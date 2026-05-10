import { NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';
import pino from 'pino';

// ============================================================================
// ANIMES ONLINE TO - Scraper Profissional v1.0
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
const BASE_URL = 'https://animesonlineto.to';

// LRU Cache (max 100 itens, 30 min TTL)
const cache = new LRUCache<string, any>({
    max: 100,
    ttl: 30 * 60 * 1000,
});

async function fetchWithAntiBot(url: string, options: RequestInit = {}): Promise<any> {
    const headers = {
        'User-Agent': UA,
        'Accept': 'application/json, text/plain, */*',
        'Referer': BASE_URL,
        ...options.headers,
    };

    try {
        const res = await fetch(url, { ...options, headers });
        if (res.status === 200) {
            return await res.json();
        }
        logger.warn(`[AnimesOnlineTo] Status ${res.status} na URL: ${url}`);
        return null;
    } catch (e) {
        logger.error(`[AnimesOnlineTo] Falha ao buscar URL: ${url} - ${e}`);
        return null;
    }
}

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

export async function POST(req: Request) {
    try {
        const { title, episode, version } = await req.json();

        if (!title || typeof episode !== 'number') {
            return NextResponse.json({ error: 'Parâmetros inválidos. Informe title (string) e episode (number).' }, { status: 400 });
        }

        const cacheKey = `animesonlineto-${slugify(title)}-ep-${episode}-${version || 'any'}`;
        const cached = cache.get(cacheKey);

        if (cached) {
            logger.info(`[AnimesOnlineTo] Cache HIT: ${cacheKey}`);
            return NextResponse.json(cached);
        }

        logger.info(`[AnimesOnlineTo] Iniciando busca para: ${title} (EP ${episode})`);

        // 1. Buscar Anime
        const searchResults = await fetchWithAntiBot(`${BASE_URL}/api-proxy/animes?search=${encodeURIComponent(title)}&limit=10`);
        if (!searchResults || !searchResults.animes || searchResults.animes.length === 0) {
            logger.warn(`[AnimesOnlineTo] Anime não encontrado: ${title}`);
            return NextResponse.json({ players: [] });
        }

        // Tenta encontrar o melhor match pelo slug
        const targetSlug = slugify(title);
        const anime = searchResults.animes.find((a: any) => a.slug === targetSlug || a.slug.includes(targetSlug)) || searchResults.animes[0];

        // 2. Buscar Detalhes e Lista de Episódios
        const details = await fetchWithAntiBot(`${BASE_URL}/api-proxy/animes/${anime.slug}`);
        if (!details || !details.episodes) {
            logger.warn(`[AnimesOnlineTo] Episódios não encontrados para o slug: ${anime.slug}`);
            return NextResponse.json({ players: [] });
        }

        // 3. Filtrar o episódio correto
        const targetEpisode = details.episodes.find((ep: any) => {
            const numMatch = ep.number === episode;
            if (version === 'dub') return numMatch && ep.is_dub;
            if (version === 'sub') return numMatch && !ep.is_dub;
            return numMatch;
        });

        if (!targetEpisode) {
            logger.warn(`[AnimesOnlineTo] Episódio ${episode} (${version || 'any'}) não encontrado para ${anime.slug}`);
            return NextResponse.json({ players: [] });
        }

        // 4. Buscar URL de Vídeo
        const watchData = await fetchWithAntiBot(`${BASE_URL}/api-proxy/episodes/${targetEpisode.uuid}/watch`);
        if (!watchData || !watchData.video_url) {
            logger.warn(`[AnimesOnlineTo] URL de vídeo não encontrada para o UUID: ${targetEpisode.uuid}`);
            return NextResponse.json({ players: [] });
        }

        const resultData = {
            players: [
                {
                    name: `AnimesOnlineTo ${targetEpisode.is_dub ? 'DUB' : 'SUB'}`,
                    src: watchData.video_url,
                    type: watchData.video_url.includes('.m3u8') ? 'm3u8' : 'mp4',
                    quality: 'HD'
                }
            ],
            meta: {
                title: details.name,
                source: 'AnimesOnlineTo',
                episode_uuid: targetEpisode.uuid
            }
        };

        cache.set(cacheKey, resultData);
        return NextResponse.json(resultData);

    } catch (error) {
        logger.error(`[AnimesOnlineTo] Erro crítico: ${error}`);
        return NextResponse.json({ error: 'Erro interno no servidor', players: [] }, { status: 500 });
    }
}
