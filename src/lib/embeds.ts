/**
 * EMBED_PROVIDERS // LIB_EMBEDS v4.0
 *
 * Múltiplos provedores de streaming de vídeo:
 * - Provedor 1: EmbedPlay Oficial (embedplayapi.top) - TMDB/IMDB VIP
 * - Provedor 2: Player Ultra HLS Direto (ArtPlayer)
 * - Provedor 3: SuperFlix (Dub/Leg)
 * - Provedor 4: Vidsrc (Global)
 * - Provedor P2P: Webtor (Torrent)
 */

export type AudioOption = 'default' | 'dub' | 'leg';

export interface EmbedSource {
  id: string;
  name: string;
  provider: 'embedplay' | 'maximaimg' | 'superflix' | 'vidsrc' | 'webtor' | string;
  url: string;
  server?: string;
  audioLabel?: string;
  type?: 'iframe' | 'video';
  isAsync?: boolean;
}

// ─────────────────────────────────────────────
// 1. EmbedPlay Oficial API (embedplayapi.top)
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

// ─────────────────────────────────────────────
// 3. SuperFlix API (superflixapi.pro)
// ─────────────────────────────────────────────
export const SuperFlixAPI = {
  getEpisodeUrl(tmdbId: string | number, season = 1, episode = 1): string {
    return `https://superflixapi.pro/serie/${tmdbId}/${season}/${episode}`;
  },
  getMovieUrl(tmdbId: string | number): string {
    return `https://superflixapi.pro/filme/${tmdbId}`;
  },
};

// ─────────────────────────────────────────────
// 4. Vidsrc API (vidsrc.to)
// ─────────────────────────────────────────────
export const VidsrcAPI = {
  getEpisodeUrl(tmdbId: string | number, season = 1, episode = 1): string {
    return `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;
  },
  getMovieUrl(tmdbId: string | number): string {
    return `https://vidsrc.to/embed/movie/${tmdbId}`;
  },
};

/**
 * Gera todas as fontes de streaming disponíveis para o episódio.
 * EmbedPlay Oficial (embedplayapi.top) tem prioridade principal com TMDB ID.
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

  // 1. Provedor Primário Recomendado: EmbedPlay Oficial (embedplayapi.top)
  if (mainId) {
    sources.push({
      id: 'embedplay',
      name: 'EmbedPlay (Oficial VIP)',
      provider: 'embedplay',
      url: EmbedPlayAPI.getEpisodeUrl(mainId, season, episode),
      audioLabel: 'AUTO',
      type: 'iframe',
    });

    // Se a temporada for maior que 1, adiciona também a opção da Temporada 1
    // (Muitos catálogos de animes como Netflix/TMDB agrupam cours na Temporada 1)
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

  // 2. Provedor Secundário: Stream Direto HLS (Sem Anúncios / ArtPlayer)
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

  // 3. Provedor Terciário: SuperFlix (Dublado / Legendado)
  if (tmdbId) {
    sources.push({
      id: 'superflix',
      name: 'Servidor 3 (SuperFlix)',
      provider: 'superflix',
      url: SuperFlixAPI.getEpisodeUrl(tmdbId, season, episode),
      audioLabel: audio === 'dub' ? 'DUB' : 'LEG',
      type: 'iframe',
    });
  }

  // 4. Provedor Quaternário: Vidsrc Global
  if (mainId) {
    sources.push({
      id: 'vidsrc',
      name: 'Servidor 4 (Vidsrc Global)',
      provider: 'vidsrc',
      url: VidsrcAPI.getEpisodeUrl(mainId, season, episode),
      audioLabel: 'LEG',
      type: 'iframe',
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

  if (tmdbId) {
    sources.push({
      id: 'superflix',
      name: 'Servidor 3 (SuperFlix)',
      provider: 'superflix',
      url: SuperFlixAPI.getMovieUrl(tmdbId),
      type: 'iframe',
    });
  }

  return sources;
}
