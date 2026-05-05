import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { LRUCache } from 'lru-cache';
import pino from 'pino';

// ============================================================================
// ANIME HOUSE - Scraper Profissional v3.0 (Anti-Bot & Multi-Source)
// ============================================================================

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  },
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
});

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

// Multi-Source com 6 Sites Dooplay (Antigos + Novos)
const SOURCES = [
  'https://animeplay.cloud',
  'https://animesonline.cloud',
  'https://animesdrive.online',
  'https://animeonline.cc',
  'https://animeshouse.net',
  'https://animesbr.cc'
];

// LRU Cache (max 100 itens, 30 min TTL)
const cache = new LRUCache<string, any>({
  max: 100,
  ttl: 30 * 60 * 1000, 
});

// Delay utilitário para Rate Limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = (min: number, max: number) => delay(Math.floor(Math.random() * (max - min + 1) + min));

// === ANTI-BOT BYPASS (PUPPETEER STEALTH) ===
let browserInstance: any = null;

async function getBrowser() {
  if (browserInstance) return browserInstance;
  
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

  try {
    const page = await browser.newPage();
    await page.setUserAgent(UA);
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Pequena espera simulando humano
    await randomDelay(1000, 2000);
    
    // Verifica se caiu em captcha
    const pageTitle = await page.title();
    if (pageTitle.includes('Just a moment') || pageTitle.includes('Cloudflare')) {
      logger.info(`[Bypass] Desafio Cloudflare detectado. Aguardando resolução...`);
      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    }

    const html = await page.content();
    await page.close();
    logger.info(`[Bypass] Sucesso ao resolver ${url}`);
    return html;
  } catch (error) {
    logger.error(`[Bypass] Falha ao by-passar ${url}: ` + error);
    return null;
  }
}

async function fetchWithAntiBot(url: string, isJson: boolean = false): Promise<any> {
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
      return isJson ? await res.json() : await res.text();
    }
    
    if (res.status === 403 || res.status === 429 || res.status === 503) {
      logger.warn(`[FastPath] Bloqueio detectado (${res.status}) na URL: ${url}`);
    } else {
      return null;
    }
  } catch (e) {
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

// === RESOLVERS E EXTRATORES ===

function resolveEmbedToDirectUrl(url: string): { src: string, type: string } {
  // JWPlayer
  if (url.includes('jwplayer?source=')) {
    try {
      const parsed = new URL(url);
      const source = parsed.searchParams.get('source');
      if (source && (source.endsWith('.mp4') || source.includes('.mp4'))) return { src: source, type: 'mp4' };
      if (source && (source.endsWith('.m3u8') || source.includes('.m3u8'))) return { src: source, type: 'm3u8' }; 
    } catch {}
  }
  
  if (url.includes('mp4upload.com') || url.includes('streamtape.com') || url.includes('vidstreaming.io')) {
    logger.debug(`[Resolver] Encontrado embed complexo que pode ser by-passado no futuro: ${url}`);
  }

  return { src: url, type: 'iframe' };
}

async function extractDooplayPlayers(html: string, baseUrl: string): Promise<{ name: string; src: string; type: string }[]> {
  const players: { name: string; src: string; type: string }[] = [];
  const $ = cheerio.load(html);
  const options = $('li.dooplay_player_option');

  if (options.length === 0) return players;

  const promises: Promise<any>[] = [];

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

function extractStaticIframes(html: string): { name: string; src: string; type: string }[] {
  const players: { name: string; src: string; type: string }[] = [];
  const blocklist = ['facebook', 'disqus', 'googletagmanager', 'googlesyndication', 'doubleclick'];
  const $ = cheerio.load(html);

  $('iframe').each((i, el) => {
    const src = $(el).attr('src');
    if (src && !blocklist.some((b) => src.includes(b))) {
      let name = `Player ${i + 1}`;
      if (src.includes('blogger.com')) name = 'Blogger';
      else if (src.includes('strp2p.com')) name = 'STRp2p';
      else if (src.includes('animeshd.cloud')) name = 'AnimesHD';
      else if (src.includes('aniplay.online') || src.includes('jwplayer')) name = 'AnimePlay HD';
      else if (src.includes('mp4upload')) name = 'MP4Upload';
      else if (src.includes('streamtape')) name = 'StreamTape';

      const resolved = resolveEmbedToDirectUrl(src);
      players.push({ name, src: resolved.src, type: resolved.type });
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
        const urlSlug = href.split('/anime/')[1]?.replace(/\/$/, '');
        if (urlSlug && (urlSlug === titleSlug || urlSlug.includes(titleSlug) || titleSlug.includes(urlSlug))) {
          const isDubHref = href.includes('dublado');
          if (version === 'dub' && isDubHref) {
            animePageUrl = href;
          } else if (version === 'sub' && !isDubHref) {
            animePageUrl = href;
          } else if (!version) {
            animePageUrl = href;
          }
        }
      }
    });

    if (!animePageUrl) {
      $('a[href*="/anime/"]').each((_, el) => {
        if (animePageUrl) return;
        const href = $(el).attr('href');
        if (href && href.includes('/anime/') && !href.includes('#') && !href.includes('one-piece') && !href.includes('dragon-ball')) {
          animePageUrl = href;
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
        if (!epUrls.includes(href)) {
          epUrls.unshift(href);
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

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(req: Request) {
  try {
    const { title, episode, version } = await req.json();

    if (!title || typeof episode !== 'number') {
      return NextResponse.json({ error: 'Parâmetros inválidos. Informe title (string) e episode (number).' }, { status: 400 });
    }

    const cacheKey = `${slugify(title)}-ep-${episode}-${version || 'any'}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      logger.info(`[Scraper] Cache HIT: ${cacheKey}`);
      return NextResponse.json(cached);
    }

    logger.info(`[Scraper] Iniciando busca para: ${title} (EP ${episode})`);

    let successfulSource: string | null = null;
    let epHtml: string | null = null;

    for (const baseUrl of SOURCES) {
      logger.debug(`[Scraper] Tentando fonte: ${baseUrl}`);
      const resultHtml = await trySearchPath(title, episode, baseUrl, version);
      
      if (resultHtml) {
        if (resultHtml.includes('dooplay_player_option') || resultHtml.includes('<iframe')) {
          logger.info(`[Scraper] Sucesso na fonte: ${baseUrl}`);
          successfulSource = baseUrl;
          epHtml = resultHtml;
          break; 
        }
      }

      await randomDelay(400, 800); 
    }

    if (!successfulSource || !epHtml) {
      logger.warn(`[Scraper] Nenhuma fonte retornou resultado para ${title} (EP ${episode}).`);
      return NextResponse.json({ players: [] });
    }

    let players = await extractDooplayPlayers(epHtml, successfulSource);

    if (players.length === 0) {
      players = extractStaticIframes(epHtml);
    }

    const $ep = cheerio.load(epHtml);
    let metaTitle = $ep('title').text().split('-')[0].trim();
    if (!metaTitle || metaTitle.length > 100) {
      metaTitle = `${title} Episódio ${episode}`;
    }

    const resultData = { 
      players, 
      meta: { title: metaTitle, source: successfulSource } 
    };

    if (players.length > 0) {
      cache.set(cacheKey, resultData);
    }

    return NextResponse.json(resultData);

  } catch (error) {
    logger.error(`[Scraper] Erro crítico no Scraper: ${error}`);
    return NextResponse.json({ error: 'Erro interno no servidor', players: [] }, { status: 500 });
  }
}
