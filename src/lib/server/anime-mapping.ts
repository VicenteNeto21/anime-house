/**
 * ANIME_MAPPING // LIB_SERVER
 *
 * Mapeamento em memória entre AniList ID, TMDB ID, IMDB ID e Temporadas
 * usando a base de dados open-source Fribb/anime-lists (~39.000 títulos).
 */

interface FribbAnimeItem {
  anilist_id?: number;
  mal_id?: number;
  themoviedb_id?: { tv?: number; movie?: number } | number;
  imdb_id?: string[] | string;
  season?: { tvdb?: number; tmdb?: number } | number;
  type?: string;
}

let cache: FribbAnimeItem[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

export async function getAnimeMapping(anilistId: number | string) {
  const numId = Number(anilistId);
  if (!numId || isNaN(numId)) return null;

  const now = Date.now();
  if (!cache || now - lastFetchTime > CACHE_TTL_MS) {
    try {
      const res = await fetch(
        'https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-mini.json',
        {
          headers: { 'User-Agent': 'AnimeHouse/1.0' },
          signal: AbortSignal.timeout(10000),
          next: { revalidate: 86400 },
        }
      );
      if (res.ok) {
        cache = (await res.json()) as FribbAnimeItem[];
        lastFetchTime = now;
      }
    } catch (err) {
      console.warn('Falha ao atualizar base Fribb/anime-lists:', err);
    }
  }

  if (cache && Array.isArray(cache)) {
    const item = cache.find((x) => x.anilist_id === numId);
    if (item) {
      let tmdbId: number | null = null;
      if (typeof item.themoviedb_id === 'object' && item.themoviedb_id !== null) {
        tmdbId = item.themoviedb_id.tv || item.themoviedb_id.movie || null;
      } else if (typeof item.themoviedb_id === 'number') {
        tmdbId = item.themoviedb_id;
      }

      let imdbId: string | null = null;
      if (Array.isArray(item.imdb_id) && item.imdb_id.length > 0) {
        imdbId = item.imdb_id[0];
      } else if (typeof item.imdb_id === 'string') {
        imdbId = item.imdb_id;
      }

      let season = 1;
      if (typeof item.season === 'object' && item.season !== null) {
        season = item.season.tmdb || item.season.tvdb || 1;
      } else if (typeof item.season === 'number') {
        season = item.season;
      }

      return {
        tmdbId,
        imdbId,
        season,
        type: item.type === 'Movie' ? ('movie' as const) : ('tv' as const),
      };
    }
  }

  return null;
}
