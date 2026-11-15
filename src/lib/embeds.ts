/**
 * EMBED_PROVIDERS // LIB_EMBEDS v3.0
 *
 * Múltiplos provedores de streaming de vídeo:
 * - Provedor 1: Player Ultra HLS Direto (ArtPlayer)
 * - Provedor 2: EmbedPlay (Rápido)
 * - Provedor 3: SuperFlix (Dub/Leg)
 * - Provedor 4: Vidsrc (Global)
 * - Provedor P2P: Webtor (Torrent)
 */

export type AudioOption = 'default' | 'dub' | 'leg';

export interface EmbedSource {
  id: string;
  name: string;
  provider: 'maximaimg' | 'embedplay' | 'superflix' | 'vidsrc' | 'webtor' | string;
  url: string;
  server?: string;
  audioLabel?: string;
  type?: 'iframe' | 'video';
  isAsync?: boolean;
}

// ─────────────────────────────────────────────
// 1. MaximaImg Direct HLS API (cdn-sv01.maximaimg.online)
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
// 2. EmbedPlay API (embedplay.top)
// ─────────────────────────────────────────────
export const EmbedPlayAPI = {
  getEpisodeUrl(tmdbId: string | number, season = 1, episode = 1): string {
    return `https://embedplay.top/serie/${tmdbId}/${season}/${episode}`;
  },
  getMovieUrl(tmdbId: string | number): string {
    return `https://embedplay.top/filme/${tmdbId}`;
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
 */
export function getEmbedSources(
  tmdbId: string | number = '',
  season = 1,
  episode = 1,
  audio: AudioOption = 'default',
  slug?: string
): EmbedSource[] {
  const sources: EmbedSource[] = [];

  // 1. Provedor Primário: Stream Direto HLS (Sem Anúncios / ArtPlayer)
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

  // 2. Provedor Secundário: EmbedPlay
  if (tmdbId) {
    sources.push({
      id: 'embedplay',
      name: 'Servidor 2 (EmbedPlay)',
      provider: 'embedplay',
      url: EmbedPlayAPI.getEpisodeUrl(tmdbId, season, episode),
      audioLabel: 'AUTO',
      type: 'iframe',
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
  if (tmdbId) {
    sources.push({
      id: 'vidsrc',
      name: 'Servidor 4 (Vidsrc Global)',
      provider: 'vidsrc',
      url: VidsrcAPI.getEpisodeUrl(tmdbId, season, episode),
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
      id: 'embedplay',
      name: 'Servidor 2 (EmbedPlay)',
      provider: 'embedplay',
      url: EmbedPlayAPI.getMovieUrl(tmdbId),
      type: 'iframe',
    });
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
