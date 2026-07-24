/**
 * EMBED_PROVIDERS // LIB_EMBEDS v1.0
 *
 * Provedores de embed para player de vídeo.
 * Suporta EmbedPlay API e Fembed API.
 */

export type AudioOption = 'default' | 'dub' | 'leg';

export interface EmbedSource {
  id: string;
  name: string;
  provider: 'embedplay' | 'fembed' | 'vidsrc' | 'anroll' | 'consumet' | 'autoembed' | 'superembed' | 'meusanimes';
  url: string;
  server?: string;
  audioLabel?: string;
  type?: 'iframe' | 'video';
  isAsync?: boolean;
}

// ─────────────────────────────────────────────
// AutoEmbed & SuperEmbed API
// ─────────────────────────────────────────────
export const AutoEmbedAPI = {
  getEpisodeUrl(tmdbId: string | number, season = 1, episode = 1): string {
    return `https://autoembed.to/tv/tmdb/${tmdbId}-${season}-${episode}`;
  },
  getMovieUrl(tmdbId: string | number): string {
    return `https://autoembed.to/movie/tmdb/${tmdbId}`;
  }
};

export const SuperEmbedAPI = {
  getEpisodeUrl(tmdbId: string | number, season = 1, episode = 1): string {
    return `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
  },
  getMovieUrl(tmdbId: string | number): string {
    return `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1`;
  }
};

// ─────────────────────────────────────────────
// Vidsrc API
// ─────────────────────────────────────────────
export const VidsrcAPI = {
  getEpisodeUrl(tmdbId: string | number, season = 1, episode = 1): string {
    return `https://vidsrc-embed.ru/embed/tv/${tmdbId}/${season}-${episode}?ds_lang=pt`;
  },
  getMovieUrl(tmdbId: string | number): string {
    return `https://vidsrc-embed.ru/embed/movie/${tmdbId}?ds_lang=pt`;
  }
};



// ─────────────────────────────────────────────
// EmbedPlay API (embedplayapi.top)
// ─────────────────────────────────────────────

export const EmbedPlayAPI = {
  baseUrl: 'https://embedplayapi.top',

  /**
   * Gera URL de embed para um episódio de anime/série.
   * @param tmdbId - TMDB ID do anime
   * @param season - Temporada (default: 1)
   * @param episode - Número do episódio
   */
  getEpisodeUrl(tmdbId: string | number, season = 1, episode = 1): string {
    return `${this.baseUrl}/embed/${tmdbId}/${season}/${episode}`;
  },

  /**
   * Gera URL de embed para filme.
   */
  getMovieUrl(tmdbId: string | number): string {
    return `${this.baseUrl}/embed/${tmdbId}`;
  },

  /**
   * Verifica disponibilidade de uma série/anime.
   */
  async checkStatus(tmdbId: string | number, season: number, episode: number): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/api/status?tmdb=${tmdbId}&sea=${season}&epi=${episode}&type=tv`;
      const response = await fetch(url);
      if (!response.ok) return false;
      const data = await response.json();
      return !!data;
    } catch {
      return false;
    }
  },
};

// ─────────────────────────────────────────────
// Fembed API (fembed.sx)
// ─────────────────────────────────────────────

export const FembedAPI = {
  baseUrl: 'https://fembed.sx',

  /**
   * Gera URL de embed para episódio de anime/série.
   * Suporta seleção de áudio (dub/leg) e servidor fixo.
   *
   * @param tmdbId  - TMDB ID
   * @param season  - Temporada
   * @param episode - Episódio
   * @param audio   - 'default' | 'dub' | 'leg'
   * @param server  - null (seletor) | 1-4 (servidor fixo)
   */
  getEpisodeUrl(
    tmdbId: string | number,
    season = 1,
    episode = 1,
    audio: AudioOption = 'default',
    server?: number
  ): string {
    const audioSuffix = audio !== 'default' ? `-${audio}` : '';
    const serverSuffix = server ? `/servidor-${server}` : '';
    return `${this.baseUrl}/e/${tmdbId}${audioSuffix}/${season}-${episode}${serverSuffix}`;
  },

  /**
   * Gera URL de embed para filme.
   */
  getMovieUrl(
    tmdbId: string | number,
    audio: AudioOption = 'default',
    server?: number
  ): string {
    const audioSuffix = audio !== 'default' ? `-${audio}` : '';
    const serverSuffix = server ? `/servidor-${server}` : '';
    return `${this.baseUrl}/e/${tmdbId}${audioSuffix}${serverSuffix}`;
  },

  /** Nomes dos servidores para UI */
  serverNames: {
    1: 'Principal',
    2: 'SuperFlix',
    3: 'MyEmbed',
    4: 'English',
  } as Record<number, string>,
};

// ─────────────────────────────────────────────
// Gerador de fontes para o Player
// ─────────────────────────────────────────────

/**
 * Gera todas as fontes de embed disponíveis para um episódio.
 * Retorna uma lista flat de EmbedSource para popular o seletor de servidor.
 */
export function getEmbedSources(
  tmdbId: string | number,
  season = 1,
  episode = 1,
  audio: AudioOption = 'default',
  slug?: string
): EmbedSource[] {
  const sources: EmbedSource[] = [];

  // 0. MeusAnimes (DooPlay Extractor)
  if (slug) {
    sources.push({
      id: 'meusanimes',
      name: 'MeusAnimes (DooPlay)',
      provider: 'meusanimes',
      url: `/api/extractor/dooplay?url=https://meusanimes.blog/e/${slug}-${ep}/`,
      type: 'iframe',
      isAsync: true,
    });
  }

  // 1. EmbedPlay (fonte principal)
  sources.push({
    id: 'embedplay',
    name: 'Player Principal (Rápido)',
    provider: 'embedplay',
    url: EmbedPlayAPI.getEpisodeUrl(tmdbId, season, episode),
  });

  // 2. Fembed — Embed único (com seletor de servidores interno)
  sources.push({
    id: 'fembed',
    name: 'Player Multi-Opções',
    provider: 'fembed',
    url: FembedAPI.getEpisodeUrl(tmdbId, season, episode, audio),
  });

  // 3. Fembed — Servidores individuais
  for (let s = 1; s <= 4; s++) {
    // Áudio só funciona no servidor 1 (Principal)
    const serverAudio = s === 1 ? audio : 'default';
    sources.push({
      id: `fembed-s${s}`,
      name: `Servidor F${s}`,
      provider: 'fembed',
      url: FembedAPI.getEpisodeUrl(tmdbId, season, episode, serverAudio, s),
      server: FembedAPI.serverNames[s],
    });
  }

  // 4. Vidsrc
  sources.push({
    id: 'vidsrc',
    name: 'Player Global',
    provider: 'vidsrc',
    url: VidsrcAPI.getEpisodeUrl(tmdbId, season, episode),
    type: 'iframe',
  });

  // 4.1. AutoEmbed
  sources.push({
    id: 'autoembed',
    name: 'Player Secundário',
    provider: 'autoembed',
    url: AutoEmbedAPI.getEpisodeUrl(tmdbId, season, episode),
    type: 'iframe',
  });

  // 4.2. SuperEmbed
  sources.push({
    id: 'superembed',
    name: 'Player Ultra',
    provider: 'superembed',
    url: SuperEmbedAPI.getEpisodeUrl(tmdbId, season, episode),
    type: 'iframe',
  });

  // 5. Anroll (Async) - Desativado (API backend não implementada)
  /*
  if (slug) {
    sources.push({
      id: 'anroll',
      name: 'Anroll (Nacional)',
      provider: 'anroll',
      url: '',
      type: 'iframe',
      isAsync: true,
    });
  }
  */

  // 6. Consumet (Async) - Desativado (API pública offline/451)
  /*
  sources.push({
    id: 'consumet',
    name: 'Consumet API',
    provider: 'consumet',
    url: '',
    type: 'video',
    isAsync: true,
  });
  */

  return sources;
}

/**
 * Gera fontes de embed para um filme.
 */
export function getMovieEmbedSources(
  tmdbId: string | number,
  audio: AudioOption = 'default'
): EmbedSource[] {
  const sources: EmbedSource[] = [];

  sources.push({
    id: 'embedplay',
    name: 'Player Principal (Rápido)',
    provider: 'embedplay',
    url: EmbedPlayAPI.getMovieUrl(tmdbId),
  });

  sources.push({
    id: 'fembed',
    name: 'Player Multi-Opções',
    provider: 'fembed',
    url: FembedAPI.getMovieUrl(tmdbId, audio),
  });

  for (let s = 1; s <= 4; s++) {
    const serverAudio = s === 1 ? audio : 'default';
    sources.push({
      id: `fembed-s${s}`,
      name: `Servidor F${s}`,
      provider: 'fembed',
      url: FembedAPI.getMovieUrl(tmdbId, serverAudio, s),
      server: FembedAPI.serverNames[s],
    });
  }

  // 4. Vidsrc
  sources.push({
    id: 'vidsrc',
    name: 'Player Global',
    provider: 'vidsrc',
    url: VidsrcAPI.getMovieUrl(tmdbId),
    type: 'iframe',
  });

  // 4.1. AutoEmbed
  sources.push({
    id: 'autoembed',
    name: 'Player Secundário',
    provider: 'autoembed',
    url: AutoEmbedAPI.getMovieUrl(tmdbId),
    type: 'iframe',
  });

  // 4.2. SuperEmbed
  sources.push({
    id: 'superembed',
    name: 'Player Ultra',
    provider: 'superembed',
    url: SuperEmbedAPI.getMovieUrl(tmdbId),
    type: 'iframe',
  });

  return sources;
}
