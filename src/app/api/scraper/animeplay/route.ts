import { NextResponse } from 'next/server';
export const maxDuration = 60; // Permite que a Vercel rode a função por até 60s (necessário pro Puppeteer)
import * as cheerio from 'cheerio';
import { LRUCache } from 'lru-cache';
import pino from 'pino';

// ============================================================================
// ANIME HOUSE - Scraper Profissional v3.0 (Anti-Bot & Multi-Source)
// ============================================================================

const logger = pino({
    ...(process.env.NODE_ENV === 'development' && {
        transport: {
            target: 'pino-pretty',
            options: { colorize: true }
        }
    }),
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
});

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

// Multi-Source com 6 Sites Dooplay (Antigos + Novos)
const SOURCES = [
    'https://animeplay.cloud',
    'https://animesonline.cloud',
    'https://animesdrive.online',
    'https://anroll.site',
    'https://anroll.cc/home',
    'https://animesbr.cc'
];

type ScrapedPlayer = {
    name: string;
    src: string;
    type: string;
    quality?: string;
};

type SpecialScrapeResult = {
    source: string;
    players: ScrapedPlayer[];
};

type AnimesBrSuggestion = {
    type?: string;
    slug?: string;
};

type ScrapeResponse = {
    players: ScrapedPlayer[];
    meta?: {
        title: string;
        source: string;
    };
};

type BloggerStream = {
    format_id?: string | number;
    play_url?: string;
};

type BrowserLike = {
    isConnected: () => boolean;
    newPage: () => Promise<PageLike>;
};

type PageLike = {
    setUserAgent: (ua: string) => Promise<void>;
    goto: (url: string, options: { waitUntil: string; timeout: number }) => Promise<unknown>;
    title: () => Promise<string>;
    waitForNavigation: (options: { waitUntil: string; timeout: number }) => Promise<unknown>;
    content: () => Promise<string>;
    close: () => Promise<void>;
};

// LRU Cache (max 100 itens, 30 min TTL)
const cache = new LRUCache<string, ScrapeResponse>({
    max: 100,
    ttl: 30 * 60 * 1000,
});

// Delay utilitário para Rate Limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = (min: number, max: number) => delay(Math.floor(Math.random() * (max - min + 1) + min));

// === ANTI-BOT BYPASS (PUPPETEER STEALTH) ===
let browserInstance: BrowserLike | null = null;

async function getBrowser() {
    if (browserInstance && browserInstance.isConnected()) return browserInstance;

    const puppeteer = (await import('puppeteer-extra')).default;
    const StealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default;
    puppeteer.use(StealthPlugin());

    let executablePath = null;
    let args: string[] = [];

    // Se rodando na Vercel (AWS Lambda)
    if (process.env.VERCEL) {
        const chromium = (await import('@sparticuz/chromium')).default;
        executablePath = await chromium.executablePath();
        args = chromium.args;
    } else {
        // Se rodando localmente (precisa ter Chrome instalado ou baixar automático via puppeteer normal)
        executablePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    }

    logger.info(`Inicializando Puppeteer Stealth com executável: ${executablePath}`);

    try {
        browserInstance = await puppeteer.launch({
            args: [...args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
            executablePath,
            headless: true,
        });
        return browserInstance;
    } catch (error) {
        logger.error('Erro ao instanciar Puppeteer: ' + error);
        return null;
    }
}

async function bypassCloudflare(url: string): Promise<string | null> {
    logger.info(`[Bypass] Acionando anti-bot para: ${url}`);
    const browser = await getBrowser();
    if (!browser) return null;

    let page: PageLike | null = null;
    try {
        page = await browser.newPage();
        await page.setUserAgent(UA);

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

        // Pequena espera simulando humano
        await randomDelay(1000, 2000);

        // Verifica se caiu em captcha
        const pageTitle = await page.title();
        if (pageTitle.includes('Just a moment') || pageTitle.includes('Cloudflare')) {
            logger.info(`[Bypass] Desafio Cloudflare detectado. Aguardando resolução...`);
            await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => { });
        }

        const html = await page.content();
        await page.close();
        logger.info(`[Bypass] Sucesso ao resolver ${url}`);
        return html;
    } catch (error) {
        logger.error(`[Bypass] Falha ao by-passar ${url}: ` + error);
        return null;
    } finally {
        if (page) {
            await page.close().catch(() => { });
        }
    }
}

async function fetchWithAntiBot(url: string): Promise<string | null>;
async function fetchWithAntiBot(url: string, isJson: true): Promise<unknown | null>;
async function fetchWithAntiBot(url: string, isJson: boolean = false): Promise<string | unknown | null> {
    // Tentativa 1: Fetch normal
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': UA,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            },
            signal: AbortSignal.timeout(5000),
        });

        if (res.status === 200) {
            return isJson ? await res.json() as unknown : await res.text();
        }

        if (res.status === 403 || res.status === 429 || res.status === 503) {
            logger.warn(`[FastPath] Bloqueio detectado (${res.status}) na URL: ${url}`);
        } else {
            return null;
        }
    } catch {
        logger.warn(`[FastPath] Timeout ou falha na URL: ${url}`);
    }

    // Tentativa 2: Puppeteer Bypass (Somente HTML)
    if (isJson) return null;
    const html = await bypassCloudflare(url);
    return html;
}

// === UTILITÁRIOS ===

function slugify(title: string): string {
    return title
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase()
        .trim();
}

function padEpisode(ep: number): string {
    return ep < 10 ? `0${ep}` : `${ep}`;
}

function decodeHtmlEntities(value: string): string {
    return value
        .replace(/&quot;/g, '"')
        .replace(/&#034;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

function normalizeUrl(url: string, baseUrl?: string): string | null {
    if (!url) return null;
    const decoded = decodeHtmlEntities(url.trim()).replace(/\\\//g, '/');
    try {
        return baseUrl ? new URL(decoded, baseUrl).toString() : new URL(decoded).toString();
    } catch {
        return null;
    }
}

function inferPlayerType(url: string): string {
    const lower = url.toLowerCase();
    if (lower.includes('.m3u8')) return 'm3u8';
    if (lower.includes('.mp4')) return 'mp4';
    return 'iframe';
}

function getDirectMediaFromUrlParam(url: string): string | null {
    try {
        const parsed = new URL(url);
        const preferredParams = ['source', 'url', 'file', 'video', 'src', 'd'];

        for (const key of preferredParams) {
            const value = parsed.searchParams.get(key);
            const normalized = normalizeUrl(value || '');
            if (normalized && inferPlayerType(normalized) !== 'iframe') return normalized;
        }

        for (const value of parsed.searchParams.values()) {
            const normalized = normalizeUrl(value);
            if (normalized && inferPlayerType(normalized) !== 'iframe') return normalized;
        }
    } catch { }

    return null;
}

function uniquePlayers<T extends { src?: string }>(players: T[]): T[] {
    const seen = new Set<string>();
    return players.filter((player) => {
        if (!player?.src || seen.has(player.src)) return false;
        seen.add(player.src);
        return true;
    });
}

// === RESOLVERS E EXTRATORES ===

function resolveEmbedToDirectUrl(url: string): { src: string, type: string } {
    const directType = inferPlayerType(url);
    if (directType !== 'iframe') {
        return { src: url, type: directType };
    }

    const anivideoMatch = url.match(/[?&]d=([^&]+)/);
    if (url.includes('api.anivideo.net') && anivideoMatch?.[1]) {
        const src = decodeURIComponent(anivideoMatch[1]);
        return { src, type: inferPlayerType(src) };
    }

    const directParam = getDirectMediaFromUrlParam(url);
    if (directParam) {
        return { src: directParam, type: inferPlayerType(directParam) };
    }

    if (url.includes('mp4upload.com') || url.includes('streamtape.com') || url.includes('vidstreaming.io')) {
        logger.debug(`[Resolver] Encontrado embed complexo que pode ser by-passado no futuro: ${url}`);
    }

    return { src: url, type: 'iframe' };
}

function extractDirectPlayersFromHtml(html: string, sourceName: string, baseUrl: string): ScrapedPlayer[] {
    const players: ScrapedPlayer[] = [];
    const $ = cheerio.load(html);

    $('iframe').each((i, el) => {
        const src = normalizeUrl($(el).attr('src') || '', baseUrl);
        if (!src) return;
        const resolved = resolveEmbedToDirectUrl(src);
        players.push({
            name: `${sourceName} Player ${i + 1}`,
            src: resolved.src,
            type: resolved.type,
            quality: resolved.src.includes('1080') || resolved.src.includes('FHD') ? '1080p' : 'HD'
        });
    });

    $('meta[itemprop="embedURL"], meta[itemprop="contentUrl"], meta[itemprop="contentURL"], link[itemprop="embedURL"], source').each((i, el) => {
        const raw = $(el).attr('content') || $(el).attr('href') || $(el).attr('src');
        const src = normalizeUrl(raw || '', baseUrl);
        if (!src) return;
        players.push({
            name: `${sourceName} Direto ${i + 1}`,
            src,
            type: inferPlayerType(src),
            quality: src.includes('1080') || src.includes('FHD') ? '1080p' : 'HD'
        });
    });

    const directRegex = /https?:\\?\/\\?\/[^\s"'<>]+?\.(?:m3u8|mp4)(?:[^\s"'<>]*)?/gi;
    for (const match of html.matchAll(directRegex)) {
        const src = normalizeUrl(match[0], baseUrl);
        if (!src) continue;
        players.push({
            name: `${sourceName} Direto`,
            src,
            type: inferPlayerType(src),
            quality: src.includes('1080') || src.includes('FHD') ? '1080p' : 'HD'
        });
    }

    return uniquePlayers(players);
}

/**
 * Resolve o link direto de vídeos do Blogger (Google Video) 
 * que geralmente possuem qualidade 1080p disponível.
 */
async function resolveBloggerUrl(url: string): Promise<{ src: string, type: string, quality?: string } | null> {
    if (!url.includes('blogger.com')) return null;

    try {
        const html = await fetchWithAntiBot(url);
        if (!html) return null;

        // Regex para capturar as URLs de vídeo no script do Blogger
        const videoMatch = html.match(/"play_url":"([^"]+)"/);
        if (videoMatch && videoMatch[1]) {
            const videoUrl = videoMatch[1].replace(/\\u0026/g, '&');
            return { src: videoUrl, type: 'mp4', quality: '1080p' };
        }

        // Fallback: Tenta buscar por stream_map ou links diretos de vídeo no HTML
        const streamsMatch = html.match(/"streams":\[([^\]]+)\]/);
        if (streamsMatch && streamsMatch[1]) {
            const streams = JSON.parse(`[${streamsMatch[1]}]`) as BloggerStream[];
            // Prioriza a maior qualidade disponível (geralmente a última na lista do Blogger)
            const bestStream = streams.sort((a, b) => (parseInt(String(b.format_id)) || 0) - (parseInt(String(a.format_id)) || 0))[0];
            if (bestStream?.play_url) {
                return { src: bestStream.play_url, type: 'mp4', quality: '1080p' };
            }
        }
    } catch {
        logger.warn(`[Resolver] Falha ao resolver Blogger: ${url}`);
    }
    return null;
}

async function extractDooplayPlayers(html: string, baseUrl: string): Promise<ScrapedPlayer[]> {
    const players: ScrapedPlayer[] = [];
    const $ = cheerio.load(html);
    const options = $('li.dooplay_player_option');

    if (options.length === 0) return players;

    const promises: Promise<ScrapedPlayer | null>[] = [];

    options.each((i, el) => {
        const dataPost = $(el).attr('data-post');
        const dataNume = $(el).attr('data-nume');
        const dataType = $(el).attr('data-type');
        let name = $(el).find('.title').text().trim() || `Player ${i + 1}`;

        if (dataPost && dataNume && dataType) {
            promises.push(
                fetch(`${baseUrl}/wp-admin/admin-ajax.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
                    body: `action=doo_player_ajax&post=${dataPost}&nume=${dataNume}&type=${dataType}`,
                })
                    .then((r) => r.json())
                    .then((data) => {
                        if (data?.embed_url) {
                            const resolved = resolveEmbedToDirectUrl(data.embed_url);
                            if (resolved.type === 'mp4' && !name.includes('Direto')) name = `${name} (Nativo)`;
                            return { name, src: resolved.src, type: resolved.type };
                        }
                        return null;
                    })
                    .catch(() => null)
            );
        }
    });

    const results = await Promise.all(promises);
    for (const r of results) {
        if (r) players.push(r);
    }

    return players;
}

function extractStaticIframes(html: string): ScrapedPlayer[] {
    const players: ScrapedPlayer[] = [];
    const blocklist = ['facebook', 'disqus', 'googletagmanager', 'googlesyndication', 'doubleclick'];
    const $ = cheerio.load(html);

    $('iframe').each((i, el) => {
        const src = $(el).attr('src');
        if (src && !blocklist.some((b) => src.includes(b))) {
            let name = `Player ${i + 1}`;
            let quality = undefined;

            if (src.includes('blogger.com')) {
                name = 'Blogger FHD';
                quality = '1080p';
            }
            else if (src.includes('strp2p.com')) name = 'STRp2p';
            else if (src.includes('animeshd.cloud')) name = 'AnimesHD';
            else if (src.includes('aniplay.online') || src.includes('jwplayer')) name = 'AnimePlay HD';
            else if (src.includes('mp4upload')) name = 'MP4Upload';
            else if (src.includes('streamtape')) name = 'StreamTape';

            const resolved = resolveEmbedToDirectUrl(src);
            players.push({ name, src: resolved.src, type: resolved.type, ...(quality && { quality }) });
        }
    });

    return players;
}

async function trySearchPath(title: string, episode: number, baseUrl: string, version?: string): Promise<string | null> {
    try {
        const searchUrl = `${baseUrl}/?s=${encodeURIComponent(title)}`;
        const searchHtml = await fetchWithAntiBot(searchUrl);
        if (!searchHtml) return null;

        const $ = cheerio.load(searchHtml);
        let animePageUrl: string | null = null;
        const titleSlug = slugify(title);

        $('a[href*="/anime/"]').each((_, el) => {
            if (animePageUrl) return;
            const href = $(el).attr('href');
            if (href && href.includes('/anime/') && !href.includes('#')) {
                const absoluteHref = href.startsWith('http') ? href : `${baseUrl}${href}`;
                const urlSlug = href.split('/anime/')[1]?.replace(/\/$/, '');
                if (urlSlug && (urlSlug === titleSlug || urlSlug.includes(titleSlug) || titleSlug.includes(urlSlug))) {
                    const isDubHref = href.includes('dublado');
                    if (version === 'dub' && isDubHref) {
                        animePageUrl = absoluteHref;
                    } else if (version === 'sub' && !isDubHref) {
                        animePageUrl = absoluteHref;
                    } else if (!version) {
                        animePageUrl = absoluteHref;
                    }
                }
            }
        });

        if (!animePageUrl) {
            $('a[href*="/anime/"]').each((_, el) => {
                if (animePageUrl) return;
                const href = $(el).attr('href');
                if (href && href.includes('/anime/') && !href.includes('#') && !href.includes('one-piece') && !href.includes('dragon-ball')) {
                    const absoluteHref = href.startsWith('http') ? href : `${baseUrl}${href}`;
                    animePageUrl = absoluteHref;
                }
            });
        }

        if (!animePageUrl) return null;

        const animeHtml = await fetchWithAntiBot(animePageUrl);
        if (!animeHtml) return null;

        const $anime = cheerio.load(animeHtml);
        const finalUrl = animePageUrl as string;
        const realSlug = finalUrl.split('/anime/')[1]?.replace(/\/$/, '');
        if (!realSlug) return null;

        const paddedEp = padEpisode(episode);
        const epUrls = [
            `${baseUrl}/episodio/${realSlug}-episodio-${paddedEp}`,
            `${baseUrl}/episodio/${realSlug}-episodio-${episode}`,
        ];

        $anime(`a[href*="/episodio/"]`).each((_, el) => {
            const href = $anime(el).attr('href');
            const text = $anime(el).text().trim();
            if (href && (
                text.includes(`Episódio ${paddedEp}`) ||
                text.includes(`Episódio ${episode}`) ||
                href.endsWith(`episodio-${paddedEp}`) ||
                href.endsWith(`episodio-${episode}`)
            )) {
                const absoluteHref = href.startsWith('http') ? href : `${baseUrl}${href}`;
                if (!epUrls.includes(absoluteHref)) {
                    epUrls.unshift(absoluteHref);
                }
            }
        });

        for (const url of epUrls) {
            const resHtml = await fetchWithAntiBot(url);
            if (resHtml) return resHtml;
            await randomDelay(300, 600);
        }
    } catch (err) {
        logger.error(`[trySearchPath] Erro ao buscar em ${baseUrl}: ` + err);
    }
    return null;
}

function scoreHrefForVersion(href: string, version?: string): number {
    const lower = href.toLowerCase();
    if (version === 'dub') return lower.includes('dublado') || lower.includes('dub') ? 2 : -1;
    if (version === 'sub') return lower.includes('dublado') || lower.includes('dub') ? -1 : 1;
    return 1;
}

function findBestEpisodeUrl(html: string, baseUrl: string, title: string, episode: number, version?: string): string | null {
    const $ = cheerio.load(html);
    const titleSlug = slugify(title);
    const epTokens = [
        `episodio-${padEpisode(episode)}`,
        `episodio-${episode}`,
        `episode-${padEpisode(episode)}`,
        `episode-${episode}`,
        `/videos/`
    ];
    let best: { url: string; score: number } | null = null;

    const links = $('a[href]').toArray();
    for (const el of links) {
        const href = $(el).attr('href');
        if (!href) continue;

        const absolute = normalizeUrl(href, baseUrl);
        if (!absolute) continue;

        const haystack = `${href} ${$(el).text()}`.toLowerCase();
        const hrefSlug = slugify(haystack);
        const matchesEpisode = epTokens.some(token => haystack.includes(token));
        const matchesTitle = hrefSlug.includes(titleSlug) || titleSlug.includes(hrefSlug.slice(0, Math.min(hrefSlug.length, titleSlug.length)));
        const versionScore = scoreHrefForVersion(haystack, version);

        if (versionScore < 0 || !matchesEpisode) continue;

        const score = versionScore + (matchesTitle ? 3 : 0) + (absolute.includes('/videos/') ? 1 : 0);
        if (!best || score > best.score) {
            best = { url: absolute, score };
        }
    }

    return best?.url || null;
}

async function scrapeAnimesDigital(title: string, episode: number, version?: string): Promise<ScrapedPlayer[] | null> {
    const baseUrl = 'https://animesdigital.org';
    const titleQuery = version === 'dub' ? `${title} dublado` : title;
    const searchHtml = await fetchWithAntiBot(`${baseUrl}/?s=${encodeURIComponent(titleQuery)}`);
    if (!searchHtml) return null;

    const episodeUrl = findBestEpisodeUrl(searchHtml, baseUrl, title, episode, version);
    if (!episodeUrl) return null;

    const html = await fetchWithAntiBot(episodeUrl);
    if (!html) return null;

    return extractDirectPlayersFromHtml(html, 'AnimesDigital', baseUrl);
}

async function scrapeSushiAnimes(title: string, episode: number, version?: string): Promise<ScrapedPlayer[] | null> {
    const baseUrl = 'https://sushianimes.com.br';
    const titleSlug = slugify(title);
    const wantedDub = version === 'dub';
    const candidates = [
        `${baseUrl}/anime/${titleSlug}${wantedDub ? '-dublado' : ''}`,
        `${baseUrl}/anime/${titleSlug}`,
        `${baseUrl}/search?q=${encodeURIComponent(title)}`
    ];

    let animePageUrl: string | null = null;
    for (const candidate of candidates) {
        const html = await fetchWithAntiBot(candidate);
        if (!html) continue;

        if (candidate.includes('/anime/') && html.includes('episodes tab-content')) {
            animePageUrl = candidate;
            break;
        }

        const $ = cheerio.load(html);
        $('a[href*="/anime/"]').each((_, el) => {
            if (animePageUrl) return;
            const href = $(el).attr('href');
            if (!href) return;
            const score = scoreHrefForVersion(href, version);
            if (score < 0) return;
            const hrefSlug = slugify(href);
            if (hrefSlug.includes(titleSlug) || titleSlug.includes(hrefSlug)) {
                animePageUrl = normalizeUrl(href, baseUrl);
            }
        });
        if (animePageUrl) break;
    }

    if (!animePageUrl) return null;

    const animeHtml = await fetchWithAntiBot(animePageUrl);
    if (!animeHtml) return null;

    const episodeUrl = findBestEpisodeUrl(animeHtml, baseUrl, title, episode, version);
    if (!episodeUrl) return null;

    const episodeHtml = await fetchWithAntiBot(episodeUrl);
    if (!episodeHtml) return null;

    const $ = cheerio.load(episodeHtml);
    const embedIds = new Set<string>();
    $('[data-embed]').each((_, el) => {
        const id = $(el).attr('data-embed');
        if (id) embedIds.add(id);
    });

    const players: ScrapedPlayer[] = [];
    for (const id of embedIds) {
        try {
            const res = await fetch(`${baseUrl}/ajax/embed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'User-Agent': UA,
                    'Referer': episodeUrl,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: `id=${encodeURIComponent(id)}`
            });
            if (!res.ok) continue;
            const embedHtml = await res.text();
            const embedMatch = embedHtml.match(/playerEmbed\s*=\s*["']([^"']+)["']/);
            const src = normalizeUrl(embedMatch?.[1] || '', baseUrl);
            if (src) {
                const resolved = resolveEmbedToDirectUrl(src);
                players.push({
                    name: `SushiAnimes ${version === 'dub' ? 'DUB' : 'SUB'}`,
                    src: resolved.src,
                    type: resolved.type,
                    quality: resolved.src.includes('1080') || resolved.src.includes('4k') ? '1080p' : 'HD'
                });
            } else {
                players.push(...extractDirectPlayersFromHtml(embedHtml, 'SushiAnimes', baseUrl));
            }
        } catch (error) {
            logger.warn(`[SushiAnimes] Falha ao resolver embed ${id}: ${error}`);
        }
    }

    return uniquePlayers(players);
}

async function scrapeAnimesBR(title: string, episode: number, version?: string): Promise<ScrapedPlayer[] | null> {
    const baseUrl = 'https://animesbr.lat';
    const search = await fetchWithAntiBot(`${baseUrl}/buscar/sugestoes?q=${encodeURIComponent(title)}`, true);
    const searchData = search && typeof search === 'object' && 'data' in search ? search.data : null;
    const items = Array.isArray(searchData) ? searchData as AnimesBrSuggestion[] : [];
    if (items.length === 0) return null;

    const anime = items
        .filter((item: AnimesBrSuggestion) => item.type === 'anime' && item.slug)
        .sort((a: AnimesBrSuggestion, b: AnimesBrSuggestion) => scoreHrefForVersion(b.slug || '', version) - scoreHrefForVersion(a.slug || '', version))[0];

    if (!anime?.slug || scoreHrefForVersion(anime.slug, version) < 0) return null;

    const episodeSlug = `${anime.slug}-episodio-${padEpisode(episode)}`;
    const episodeUrl = `${baseUrl}/animes/${anime.slug}/episodios/${episodeSlug}`;
    const html = await fetchWithAntiBot(episodeUrl);
    if (!html) return null;

    const decoded = decodeHtmlEntities(html);
    const players: ScrapedPlayer[] = [];
    const sourceRegex = /"url":"([^"]*\/(?:player|media)\/source\/[^"]+)"/g;

    for (const match of decoded.matchAll(sourceRegex)) {
        const playerUrl = normalizeUrl(match[1], baseUrl);
        if (!playerUrl) continue;

        try {
            const parsed = new URL(playerUrl);
            const directSource = parsed.searchParams.get('source');
            const src = directSource ? normalizeUrl(decodeURIComponent(directSource), baseUrl) : playerUrl;
            if (!src) continue;
            players.push({
                name: `AnimesBR ${version === 'dub' ? 'DUB' : 'SUB'}`,
                src,
                type: inferPlayerType(src),
                quality: src.includes('1080') || src.includes('FHD') ? '1080p' : 'HD'
            });
        } catch {
            players.push({ name: 'AnimesBR Player', src: playerUrl, type: 'iframe', quality: 'HD' });
        }
    }

    players.push(...extractDirectPlayersFromHtml(decoded, 'AnimesBR', baseUrl));
    return uniquePlayers(players);
}

async function scrapeSuperAnimes(title: string, episode: number, version?: string): Promise<ScrapedPlayer[] | null> {
    const baseUrl = 'https://superanimes.in';
    const query = version === 'dub' ? `${title} dublado` : title;
    const searchHtml = await fetchWithAntiBot(`${baseUrl}/busca/?search_query=${encodeURIComponent(query)}`);
    if (!searchHtml) return null;

    const episodeUrl = findBestEpisodeUrl(searchHtml, baseUrl, title, episode, version);
    if (!episodeUrl) return null;

    const html = await fetchWithAntiBot(episodeUrl);
    if (!html) return null;

    return extractDirectPlayersFromHtml(html, 'SuperAnimes', baseUrl);
}

async function scrapeSpecialSources(title: string, episode: number, version?: string): Promise<SpecialScrapeResult[]> {
    const resolvers = [
        { source: 'https://animesdigital.org', run: () => scrapeAnimesDigital(title, episode, version) },
        { source: 'https://sushianimes.com.br', run: () => scrapeSushiAnimes(title, episode, version) },
        { source: 'https://animesbr.lat', run: () => scrapeAnimesBR(title, episode, version) },
        { source: 'https://superanimes.in', run: () => scrapeSuperAnimes(title, episode, version) },
    ];

    const settled = await Promise.allSettled(resolvers.map(async resolver => ({
        source: resolver.source,
        players: await resolver.run()
    })));

    return settled
        .filter((result): result is PromiseFulfilledResult<{ source: string; players: ScrapedPlayer[] | null }> => result.status === 'fulfilled')
        .map(result => ({ source: result.value.source, players: result.value.players || [] }))
        .filter(result => result.players.length > 0);
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(req: Request) {
    try {
        const { title, episode, version, preferredSource } = await req.json();

        if (!title || typeof episode !== 'number') {
            return NextResponse.json({ error: 'Parâmetros inválidos. Informe title (string) e episode (number).' }, { status: 400 });
        }

        const preferredSourceKey = typeof preferredSource === 'string' ? preferredSource : 'any-source';
        const cacheKey = `${slugify(title)}-ep-${episode}-${version || 'any'}-${preferredSourceKey}`;
        const cached = cache.get(cacheKey);

        if (cached) {
            logger.info(`[Scraper] Cache HIT: ${cacheKey}`);
            return NextResponse.json(cached);
        }

        logger.info(`[Scraper] Iniciando busca para: ${title} (EP ${episode})`);

        const specialResults = await scrapeSpecialSources(title, episode, version);
        const prioritizedResults = typeof preferredSource === 'string'
            ? specialResults.filter(result => result.source.includes(preferredSource))
            : specialResults;
        const preferredResults = prioritizedResults.length > 0 ? prioritizedResults : specialResults;
        const specialPlayers = uniquePlayers(preferredResults.flatMap(result => result.players));

        if (specialPlayers.length > 0) {
            const resultData = {
                players: specialPlayers,
                meta: {
                    title: `${title} Episodio ${episode}`,
                    source: preferredResults.map(result => result.source).join(', ')
                }
            };
            cache.set(cacheKey, resultData);
            return NextResponse.json(resultData);
        }

        let successfulSource: string | null = null;
        let epHtml: string | null = null;

        // --- BUSCA PARALELA OTIMIZADA (Waterfall Dinâmico) ---
        // Dividimos em chunks para não sobrecarregar mas ganhar velocidade
        const chunks = [SOURCES.slice(0, 3), SOURCES.slice(3)];

        for (const chunk of chunks) {
            const results = await Promise.all(chunk.map(async (baseUrl) => {
                const html = await trySearchPath(title, episode, baseUrl, version);
                if (html && (html.includes('dooplay_player_option') || html.includes('<iframe'))) {
                    return { baseUrl, html };
                }
                return null;
            }));

            const found = results.find(r => r !== null);
            if (found) {
                successfulSource = found.baseUrl;
                epHtml = found.html;
                break;
            }
        }

        if (!successfulSource || !epHtml) {
            logger.warn(`[Scraper] Nenhuma fonte retornou resultado para ${title} (EP ${episode}).`);
            return NextResponse.json({ players: [] });
        }

        let players: ScrapedPlayer[] = await extractDooplayPlayers(epHtml, successfulSource);

        if (players.length === 0) {
            players = extractStaticIframes(epHtml);
        }

        // Tenta converter Iframes do Blogger em Links Diretos FHD
        const enhancedPlayers = await Promise.all(players.map(async (p) => {
            if (p.type === 'iframe' && p.src.includes('blogger.com')) {
                const resolved = await resolveBloggerUrl(p.src);
                if (resolved) {
                    return { ...p, src: resolved.src, type: resolved.type, quality: '1080p', name: `${p.name} (Nativo)` };
                }
            }
            return p;
        }));

        const $ep = cheerio.load(epHtml);
        let metaTitle = $ep('title').text().split('-')[0].trim();
        if (!metaTitle || metaTitle.length > 100) {
            metaTitle = `${title} Episódio ${episode}`;
        }

        const resultData = {
            players: enhancedPlayers,
            meta: { title: metaTitle, source: successfulSource }
        };

        if (enhancedPlayers.length > 0) {
            cache.set(cacheKey, resultData);
        }

        return NextResponse.json(resultData);

    } catch (error) {
        logger.error(`[Scraper] Erro crítico no Scraper: ${error}`);
        return NextResponse.json({ error: 'Erro interno no servidor', players: [] }, { status: 500 });
    }
}
