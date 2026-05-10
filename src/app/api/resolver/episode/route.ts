import { NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';

export const maxDuration = 60;

type PlayerType = 'mp4' | 'm3u8' | 'iframe';

type ResolverRequest = {
    aniListId?: number | string;
    malId?: number | string;
    tmdbId?: number | string | null;
    title: string;
    titleEnglish?: string | null;
    titleRomaji?: string | null;
    titleNative?: string | null;
    year?: number | string | null;
    totalEpisodes?: number | string | null;
    episode: number;
    version?: 'sub' | 'dub';
    preferredSource?: string | null;
    preferredSrc?: string | null;
};

type ResolverCandidate = {
    name: string;
    src: string;
    type: PlayerType;
    quality?: string;
    source: string;
    confidence: number;
    reason: string[];
    season?: number;
    episode?: number;
    validated?: boolean;
};

type ResolverResponse = {
    players: ResolverCandidate[];
    meta: {
        confidence: number;
        aliases: string[];
        ids: {
            aniListId?: number | string;
            malId?: number | string;
            tmdbId?: number | string | null;
        };
        seasonCandidates: number[];
    };
};

const cache = new LRUCache<string, ResolverResponse>({
    max: 200,
    ttl: 20 * 60 * 1000,
});

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

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

function unique<T>(items: T[]): T[] {
    return Array.from(new Set(items.filter(Boolean)));
}

function inferPlayerType(url: string): PlayerType {
    const lower = url.toLowerCase();
    if (lower.includes('.m3u8')) return 'm3u8';
    if (lower.includes('.mp4')) return 'mp4';
    return 'iframe';
}

function inferQuality(url: string): string {
    const lower = url.toLowerCase();
    if (lower.includes('2160') || lower.includes('4k')) return '4K';
    if (lower.includes('1080') || lower.includes('fhd')) return '1080p';
    if (lower.includes('720') || lower.includes('hd')) return '720p';
    return 'HD';
}

function normalizeUrl(url: string): string | null {
    try {
        return new URL(url.replace(/\\\//g, '/')).toString();
    } catch {
        return null;
    }
}

function directMediaFromUrlParam(url: string): string | null {
    try {
        const parsed = new URL(url);
        for (const key of ['source', 'url', 'file', 'video', 'src', 'd']) {
            const value = parsed.searchParams.get(key);
            const normalized = value ? normalizeUrl(decodeURIComponent(value)) : null;
            if (normalized && inferPlayerType(normalized) !== 'iframe') return normalized;
        }
        for (const value of parsed.searchParams.values()) {
            const normalized = normalizeUrl(decodeURIComponent(value));
            if (normalized && inferPlayerType(normalized) !== 'iframe') return normalized;
        }
    } catch { }
    return null;
}

function aliasAffinity(src: string, aliases: string[]): number {
    const haystack = slugify(src);
    const aliasTokens = aliases
        .flatMap(alias => slugify(alias).split('-'))
        .filter(token => token.length >= 4 && !['season', 'dublado', 'legendado'].includes(token));

    const uniqueTokens = unique(aliasTokens);
    if (uniqueTokens.length === 0) return 0;

    const hits = uniqueTokens.filter(token => haystack.includes(token)).length;
    return hits / Math.min(uniqueTokens.length, 3);
}

function seasonNumberFromTitle(title: string): number | null {
    const slug = slugify(title);
    const patterns: Array<[RegExp, number]> = [
        [/(^|-)2(nd)?(-season)?$/i, 2],
        [/(^|-)second(-season)?$/i, 2],
        [/(^|-)3(rd)?(-season)?$/i, 3],
        [/(^|-)third(-season)?$/i, 3],
        [/(^|-)4(th)?(-season)?$/i, 4],
        [/(^|-)fourth(-season)?$/i, 4],
        [/-season-2$/i, 2],
        [/-season-3$/i, 3],
        [/-season-4$/i, 4],
    ];

    for (const [pattern, season] of patterns) {
        if (pattern.test(slug)) return season;
    }

    return null;
}

function aliasVariants(title: string): string[] {
    const clean = title.replace(/\(\d{4}\)/g, '').trim();
    const slug = slugify(clean);
    const variants = new Set<string>([clean, slug]);
    const replacements: Array<[RegExp, string]> = [
        [/-2nd-season$/i, '-2'],
        [/-second-season$/i, '-2'],
        [/-3rd-season$/i, '-3'],
        [/-third-season$/i, '-3'],
        [/-4th-season$/i, '-4'],
        [/-fourth-season$/i, '-4'],
        [/-season-2$/i, '-2'],
        [/-season-3$/i, '-3'],
        [/-season-4$/i, '-4'],
    ];

    for (const [pattern, replacement] of replacements) {
        if (pattern.test(slug)) variants.add(slug.replace(pattern, replacement));
    }

    return Array.from(variants);
}

function buildAliases(input: ResolverRequest): string[] {
    const titles = [
        input.title,
        input.titleEnglish || '',
        input.titleRomaji || '',
        input.titleNative || '',
    ];
    return unique(titles.flatMap(aliasVariants)).slice(0, 12);
}

function buildSeasonCandidates(input: ResolverRequest): number[] {
    const inferred = [
        input.title,
        input.titleEnglish || '',
        input.titleRomaji || '',
    ].map(seasonNumberFromTitle).find(Boolean);

    return unique([inferred || 1, 1, 2, 3]).filter((season) => season > 0).slice(0, 3);
}

function pixelUrls(aliases: string[], episode: number, version?: string): ResolverCandidate[] {
    const epStr = episode.toString().padStart(2, '0');
    const preferred = version === 'dub' ? 'dublado' : 'legendado';
    const fallback = version === 'dub' ? 'legendado' : 'dublado';
    const candidates: ResolverCandidate[] = [];

    for (const alias of aliases) {
        const slug = slugify(alias);
        if (!slug) continue;
        const firstLetter = slug.charAt(0);
        for (const suffix of [`-${preferred}`, `-${fallback}`, '']) {
            const src = `https://cdn-s01.pixel-sus-4k-image.com/stream/${firstLetter}/${slug}${suffix}/${epStr}.mp4`;
            candidates.push({
                name: `Pixel ${preferred.toUpperCase()}`,
                src,
                type: 'mp4',
                quality: '4K',
                source: 'pixel',
                confidence: suffix === `-${preferred}` ? 58 : 45,
                reason: ['slug-alias', suffix ? 'version-suffix' : 'no-version-suffix'],
            });
        }
    }

    return candidates;
}

function anivideoHlsUrls(aliases: string[], episode: number, version?: string): ResolverCandidate[] {
    const epStr = episode.toString().padStart(2, '0');
    const preferred = version === 'dub' ? 'dublado' : 'legendado';
    const fallback = version === 'dub' ? 'legendado' : 'dublado';
    const candidates: ResolverCandidate[] = [];

    for (const alias of aliases) {
        const slug = slugify(alias);
        if (!slug) continue;
        const firstLetter = slug.charAt(0);
        for (const suffix of ['', `-${preferred}`, `-${fallback}`]) {
            const mp4 = `https://cdn-s01.mywallpaper-4k-image.net/stream/${firstLetter}/${slug}${suffix}/${epStr}.mp4`;
            candidates.push({
                name: 'AniVideo HLS',
                src: `https://api.anivideo.net/videohls.php?d=${encodeURIComponent(mp4)}`,
                type: 'm3u8',
                quality: 'HLS',
                source: 'anivideo',
                confidence: suffix === '' ? 52 : 46,
                reason: ['hls-wrapper', 'mywallpaper-cdn', suffix ? 'version-suffix' : 'no-version-suffix'],
            });
        }
    }

    return candidates;
}

function directUrls(aliases: string[], episode: number, version?: string): ResolverCandidate[] {
    const epStr = episode.toString().padStart(2, '0');
    const versionPath = version === 'dub' ? `Dub/${epStr}.mp4` : `${epStr}.mp4`;

    return aliases.map((alias) => {
        const cleanTitle = alias.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').trim();
        const capitalizedSlug = cleanTitle.split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('-');
        const initial = capitalizedSlug.charAt(0).toUpperCase();
        return {
            name: 'AnimePlay Direct',
            src: `https://aniplay.online/Midias/Animes/Letra-${initial}/${capitalizedSlug}/${versionPath}`,
            type: 'mp4' as PlayerType,
            quality: 'HD',
            source: 'direct',
            confidence: 42,
            reason: ['capitalized-alias', version === 'dub' ? 'dub-path' : 'sub-path'],
        };
    });
}

function feralUrls(aliases: string[], episode: number, version?: string): ResolverCandidate[] {
    const suffix = version === 'dub' ? '-dublado' : '-legendado';
    return aliases.flatMap((alias) => {
        const slug = slugify(alias);
        return [
            {
                name: 'Feral MP4',
                src: `https://aigaion.feralhosting.com/bettershorts/combate/${slug}${suffix}-episodio-${episode}.mp4`,
                type: 'mp4' as PlayerType,
                quality: 'HD',
                source: 'feral',
                confidence: 40,
                reason: ['slug-alias', 'version-suffix'],
            },
            {
                name: 'Feral MP4',
                src: `https://aigaion.feralhosting.com/bettershorts/combate/${slug}-episodio-${episode}.mp4`,
                type: 'mp4' as PlayerType,
                quality: 'HD',
                source: 'feral',
                confidence: 35,
                reason: ['slug-alias'],
            },
        ];
    });
}

function iframeCandidates(input: ResolverRequest, seasonCandidates: number[]): ResolverCandidate[] {
    const candidates: ResolverCandidate[] = [];
    if (input.tmdbId) {
        for (const season of seasonCandidates) {
            candidates.push({
                name: `WarezCDN T${season}`,
                src: `https://warezcdn.site/serie/${input.tmdbId}/${season}/${input.episode}`,
                type: 'iframe',
                quality: 'HD',
                source: 'warez',
                confidence: season === seasonCandidates[0] ? 74 : 55,
                reason: ['tmdb-id', 'season-map'],
                season,
                episode: input.episode,
                validated: true,
            });
        }
        candidates.push({
            name: 'BetterFlix',
            src: `https://betterflix.click/api/player?id=${input.tmdbId}&type=tv&season=${seasonCandidates[0] || 1}&episode=${input.episode}`,
            type: 'iframe',
            quality: 'HD',
            source: 'betterflix',
            confidence: 50,
            reason: ['tmdb-id', 'iframe-fallback'],
            season: seasonCandidates[0] || 1,
            episode: input.episode,
            validated: true,
        });
    }
    return candidates;
}

async function validateCandidate(candidate: ResolverCandidate): Promise<ResolverCandidate> {
    if (candidate.type === 'iframe') return candidate;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);
    try {
        const res = await fetch(candidate.src, {
            method: 'HEAD',
            headers: {
                'User-Agent': UA,
                'Range': 'bytes=0-1',
            },
            signal: controller.signal,
            cache: 'no-store',
        });
        const contentType = res.headers.get('content-type') || '';
        const validContent = contentType.includes('video') || contentType.includes('mpegurl') || candidate.src.includes('.m3u8') || candidate.src.includes('.mp4') || candidate.src.includes('videohls.php');
        if (res.ok && validContent) {
            return {
                ...candidate,
                confidence: candidate.confidence + 28,
                validated: true,
                reason: [...candidate.reason, 'head-ok'],
            };
        }
    } catch { }
    finally {
        clearTimeout(timeout);
    }

    return {
        ...candidate,
        confidence: Math.max(5, candidate.confidence - 18),
        validated: false,
        reason: [...candidate.reason, 'not-validated'],
    };
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
    try {
        const res = await fetch(url, {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                ...(init?.headers || {}),
            },
            cache: 'no-store',
        });
        if (!res.ok) return null;
        return await res.json() as T;
    } catch {
        return null;
    }
}

async function scraperCandidates(origin: string, aliases: string[], input: ResolverRequest): Promise<ResolverCandidate[]> {
    const candidates: ResolverCandidate[] = [];
    const primaryAlias = aliases[0] || input.title;
    const scraperCalls = [
        {
            source: 'ao_to',
            url: `${origin}/api/scraper/animesonlineto`,
            confidence: 82,
            body: { title: primaryAlias, episode: input.episode, version: input.version },
        },
        {
            source: 'animeplay',
            url: `${origin}/api/scraper/animeplay`,
            confidence: 70,
            body: { title: primaryAlias, episode: input.episode, version: input.version },
        },
    ];

    for (const call of scraperCalls) {
        const data = await fetchJson<{ players?: Array<{ name?: string; src?: string; type?: string; quality?: string }> }>(call.url, {
            method: 'POST',
            body: JSON.stringify(call.body),
        });
        for (const player of data?.players || []) {
            if (!player.src) continue;
            const directSrc = directMediaFromUrlParam(player.src) || player.src;
            const type = (player.type === 'mp4' || player.type === 'm3u8' || player.type === 'iframe')
                ? player.type
                : inferPlayerType(directSrc);
            const affinity = aliasAffinity(directSrc, aliases);
            candidates.push({
                name: player.name || call.source,
                src: directSrc,
                type: inferPlayerType(directSrc) === 'iframe' ? type : inferPlayerType(directSrc),
                quality: player.quality || inferQuality(directSrc),
                source: call.source,
                confidence: call.confidence + (type === 'mp4' || type === 'm3u8' ? 8 : 0) + Math.round(affinity * 18) - (affinity === 0 ? 45 : 0),
                reason: ['scraper-match', primaryAlias, affinity > 0 ? 'alias-affinity' : 'alias-mismatch'],
            });
        }
    }

    return candidates;
}

function rankCandidates(candidates: ResolverCandidate[], preferredSource?: string | null, preferredSrc?: string | null): ResolverCandidate[] {
    const seen = new Set<string>();
    return candidates
        .map(candidate => ({
            ...candidate,
            confidence:
                candidate.confidence
                + (preferredSource && candidate.source === preferredSource ? 20 : 0)
                + (preferredSrc && candidate.src === preferredSrc ? 35 : 0),
        }))
        .sort((a, b) => b.confidence - a.confidence)
        .filter((candidate) => {
            if (!candidate.src || seen.has(candidate.src)) return false;
            seen.add(candidate.src);
            return true;
        })
        .slice(0, 24);
}

export async function POST(req: Request) {
    try {
        const input = await req.json() as ResolverRequest;
        if (!input.title || typeof input.episode !== 'number') {
            return NextResponse.json({ error: 'Informe title e episode.' }, { status: 400 });
        }

        const cacheKey = JSON.stringify({
            id: input.aniListId || input.title,
            tmdb: input.tmdbId || null,
            ep: input.episode,
            version: input.version || 'any',
            preferred: input.preferredSource || '',
            preferredSrc: input.preferredSrc || '',
        });
        const cached = cache.get(cacheKey);
        if (cached) return NextResponse.json(cached);

        const origin = new URL(req.url).origin;
        const aliases = buildAliases(input);
        const seasonCandidates = buildSeasonCandidates(input);

        const scraper = await scraperCandidates(origin, aliases, input);
        const heuristic = [
            ...iframeCandidates(input, seasonCandidates),
            ...anivideoHlsUrls(aliases, input.episode, input.version),
            ...pixelUrls(aliases, input.episode, input.version),
            ...directUrls(aliases, input.episode, input.version),
            ...feralUrls(aliases, input.episode, input.version),
        ];

        const likelyCandidates = [...scraper, ...heuristic].filter((candidate) => candidate.type === 'iframe' || candidate.confidence >= 40);
        const validated = await Promise.all(likelyCandidates.slice(0, 40).map(validateCandidate));
        const players = rankCandidates(validated, input.preferredSource, input.preferredSrc);

        const result: ResolverResponse = {
            players,
            meta: {
                confidence: players[0]?.confidence || 0,
                aliases,
                ids: {
                    aniListId: input.aniListId,
                    malId: input.malId,
                    tmdbId: input.tmdbId,
                },
                seasonCandidates,
            },
        };

        cache.set(cacheKey, result);
        return NextResponse.json(result);
    } catch (error) {
        console.error('[EpisodeResolver] Falha:', error);
        return NextResponse.json({ error: 'Erro interno no resolvedor', players: [] }, { status: 500 });
    }
}
