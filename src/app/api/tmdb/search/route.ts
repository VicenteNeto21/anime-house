import { NextResponse } from 'next/server';
import { getAnimeMapping } from '@/lib/server/anime-mapping';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const anilistId = searchParams.get('anilistId');
  const query = searchParams.get('query');

  // 1. Tentar mapeamento direto open-source por AniList ID (sem necessidade de API key)
  if (anilistId) {
    try {
      const mapping = await getAnimeMapping(anilistId);
      if (mapping && mapping.tmdbId) {
        return NextResponse.json({
          results: [
            {
              id: mapping.tmdbId,
              imdb_id: mapping.imdbId,
              season: mapping.season,
              media_type: mapping.type,
              source: 'fribb-mapping',
            },
          ],
        });
      }
    } catch (e) {
      console.warn('Erro ao consultar mapping AniList->TMDB:', e);
    }
  }

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  // 2. Consulta via TMDB Search API se a chave estiver configurada
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ results: [], error: 'TMDB_API_KEY_MISSING' });
  }

  const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(
    query
  )}&language=pt-BR`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('TMDB_PROXY_ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch from TMDB' }, { status: 500 });
  }
}
