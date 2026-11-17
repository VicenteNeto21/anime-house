/**
 * EMBED_PROVIDERS // LIB_EMBEDS v4.2
 *
 * Provedores selecionados de alta qualidade:
 * - Provedor 1: StreamBetter Oficial (streambetter.shop) - TMDB VIP Multi-Fontes
 * - Provedor 2: EmbedPlay Oficial (embedplayapi.top) - TMDB/IMDB VIP
 * - Provedor 3: Player Ultra HLS Direto (ArtPlayer)
 * - Provedor P2P: Webtor (Torrent)
 */

export type AudioOption = 'default' | 'dub' | 'leg';

export interface EmbedSource {
  id: string;
  name: string;
  provider: 'streambetter' | 'embedplay' | 'maximaimg' | 'webtor' | string;
  url: string;
  server?: string;
  audioLabel?: string;
  type?: 'iframe' | 'video';
  isAsync?: boolean;
}

// ─────────────────────────────────────────────
// 1. StreamBetter Oficial API (streambetter.shop / streambetter.lat)
// ─────────────────────────────────────────────
export const StreamBetterAPI = {
  baseUrl: 'https://streambetter.shop',

  /**
   * Obtém a URL do player para episódios de séries/animes via TMDB ID
   * Formato: https://streambetter.shop/serie/{tmdb_id}/{temporada}/{episodio}
   */
  getEpisodeUrl(
    tmdbId: string | number,
    season = 1,
    episode = 1,
    startSeconds?: number,
    fonte?: string
  ): string {
    const base = `https://streambetter.shop/serie/${tmdbId}/${season}/${episode}`;
    const params = new URLSearchParams();
    if (startSeconds && startSeconds > 0) params.set('start', String(Math.floor(startSeconds)));
    if (fonte) params.set('fonte', fonte);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  },

  /**
   * Obtém a URL do player para filmes via TMDB ID
   * Formato: https://streambetter.shop/filme/{tmdb_id}
   */
  getMovieUrl(tmdbId: string | number, startSeconds?: number, fonte?: string): string {
    const base = `https://streambetter.shop/filme/${tmdbId}`;
    const params = new URLSearchParams();
    if (startSeconds && startSeconds > 0) params.set('start', String(Math.floor(startSeconds)));
    if (fonte) params.set('fonte', fonte);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  },
};

// ─────────────────────────────────────────────
// 2. EmbedPlay Oficial API (embedplayapi.top)
// ─────────────────────────────────────────────
export const EmbedPlayAPI = {
  baseUrl: 'https://embedplayapi.top',

  /**
   * Obtém a URL do player para um episódio específico via TMDB ou IMDB ID
   * Formato: https://embedplayapi.top/embed/{TMDB_ID}/{SEASON}/{EPISODE}
   */
  getEpisodeUrl(tmdbOrImdbId: string | number, season = 1, episode = 1): string {
    return `https://embedplayapi.top/embed/${tmdbOrImdbId}/${season}/${episode}`;
  },

  /**
   * Obtém a URL do player para um filme via TMDB ou IMDB ID
   * Formato: https://embedplayapi.top/embed/{TMDB_ID}
   */
  getMovieUrl(tmdbOrImdbId: string | number): string {
    return `https://embedplayapi.top/embed/${tmdbOrImdbId}`;
  },

  /**
   * Retorna a URL para verificar o status de disponibilidade
   */
  getStatusUrl(
    tmdbId: string | number,
    season = 1,
    episode = 1,
    type: 'movie' | 'tv' = 'tv'
  ): string {
    return type === 'movie'
      ? `https://embedplayapi.top/api/status?tmdb=${tmdbId}&type=movie`
      : `https://embedplayapi.top/api/status?tmdb=${tmdbId}&sea=${season}&epi=${episode}&type=tv`;
  },

  /**
   * Verifica disponibilidade no banco do EmbedPlay
   */
  async checkAvailability(
    tmdbId: string | number,
    season = 1,
    episode = 1,
    type: 'movie' | 'tv' = 'tv'
  ): Promise<boolean> {
    try {
      const url = EmbedPlayAPI.getStatusUrl(tmdbId, season, episode, type);
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(4000),
        next: { revalidate: 3600 },
      });
      if (!res.ok) return false;
      const json = await res.json();
      return json?.status === 'success';
    } catch {
      return false;
    }
  },
};

// ─────────────────────────────────────────────
// 2. MaximaImg Direct HLS API (cdn-sv01.maximaimg.online)
// ─────────────────────────────────────────────
export const MaximaImgAPI = {
  getEpisodeUrl(slug: string, episode = 1): string {
    const epPad = episode.toString().padStart(2, '0');
    const cleanSlug = slug.toLowerCase().trim();
    const firstLetter = (cleanSlug.charAt(0) || 'a').toLowerCase();
    return `https://cdn-sv01.maximaimg.online/stream/${firstLetter}/${cleanSlug}/${epPad}.mp4/index.m3u8`;
  },
};

/**
 * Gera todas as fontes de streaming disponíveis para o episódio.
 * Ordem de prioridade recomendada:
 * 1. StreamBetter Oficial (streambetter.shop) - TMDB VIP Multi-Fontes
 * 2. EmbedPlay Oficial (embedplayapi.top) - TMDB/IMDB VIP
 * 3. Player Ultra HLS (maximaimg) - Direto ArtPlayer
 */
export function getEmbedSources(
  tmdbId: string | number = '',
  season = 1,
  episode = 1,
  audio: AudioOption = 'default',
  slug?: string,
  imdbId?: string
): EmbedSource[] {
  const sources: EmbedSource[] = [];

  const mainId = tmdbId || imdbId;

  // 1. Provedor Primário Recomendado: StreamBetter Oficial (streambetter.shop)
  if (tmdbId) {
    sources.push({
      id: 'streambetter',
      name: 'StreamBetter (Multi-Fontes)',
      provider: 'streambetter',
      url: StreamBetterAPI.getEpisodeUrl(tmdbId, season, episode),
      audioLabel: 'AUTO',
      type: 'iframe',
    });

    // Se temporada > 1, oferece também fallback da Temporada 1
    // (Muitos catálogos como TMDB/StreamBetter mantêm animes como cours contínuos na T1)
    if (season > 1) {
      sources.push({
        id: 'streambetter-s1',
        name: 'StreamBetter (Temporada 1)',
        provider: 'streambetter',
        url: StreamBetterAPI.getEpisodeUrl(tmdbId, 1, episode),
        audioLabel: 'AUTO',
        type: 'iframe',
      });
    }
  }

  // 2. Provedor Secundário: EmbedPlay Oficial (embedplayapi.top)
  if (mainId) {
    sources.push({
      id: 'embedplay',
      name: 'EmbedPlay (Oficial VIP)',
      provider: 'embedplay',
      url: EmbedPlayAPI.getEpisodeUrl(mainId, season, episode),
      audioLabel: 'AUTO',
      type: 'iframe',
    });

    if (season > 1) {
      sources.push({
        id: 'embedplay-s1',
        name: 'EmbedPlay (Temporada 1)',
        provider: 'embedplay',
        url: EmbedPlayAPI.getEpisodeUrl(mainId, 1, episode),
        audioLabel: 'AUTO',
        type: 'iframe',
      });
    }
  }

  // 3. Provedor Terciário: Stream Direto HLS (Sem Anúncios / ArtPlayer)
  if (slug) {
    sources.push({
      id: 'maximaimg',
      name: 'Player Ultra HLS (Sem Anúncios)',
      provider: 'maximaimg',
      url: MaximaImgAPI.getEpisodeUrl(slug, episode),
      audioLabel: audio === 'dub' ? 'DUB' : 'LEG',
      type: 'video',
    });
  }

  return sources;
}

/**
 * Fontes para filmes
 */
export function getMovieEmbedSources(
  tmdbId: string | number = '',
  _audio: AudioOption = 'default',
  slug?: string
): EmbedSource[] {
  const sources: EmbedSource[] = [];

  if (tmdbId) {
    sources.push({
      id: 'streambetter',
      name: 'StreamBetter (Multi-Fontes)',
      provider: 'streambetter',
      url: StreamBetterAPI.getMovieUrl(tmdbId),
      type: 'iframe',
    });

    sources.push({
      id: 'embedplay',
      name: 'EmbedPlay (Oficial VIP)',
      provider: 'embedplay',
      url: EmbedPlayAPI.getMovieUrl(tmdbId),
      type: 'iframe',
    });
  }

  if (slug) {
    sources.push({
      id: 'maximaimg',
      name: 'Player Ultra HLS (Sem Anúncios)',
      provider: 'maximaimg',
      url: MaximaImgAPI.getEpisodeUrl(slug, 1),
      type: 'video',
    });
  }

  return sources;
}
