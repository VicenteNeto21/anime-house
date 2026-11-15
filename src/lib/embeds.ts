/**
 * EMBED_PROVIDERS // LIB_EMBEDS v2.0
 *
 * Provedor de streaming direto HLS de alta performance para o ArtPlayer
 * e suporte a Webtor (Torrent P2P).
 */

export type AudioOption = 'default' | 'dub' | 'leg';

export interface EmbedSource {
  id: string;
  name: string;
  provider: 'maximaimg' | 'webtor';
  url: string;
  server?: string;
  audioLabel?: string;
  type?: 'iframe' | 'video';
  isAsync?: boolean;
}

// ─────────────────────────────────────────────
// MaximaImg Direct HLS API (cdn-sv01.maximaimg.online)
// ─────────────────────────────────────────────
export const MaximaImgAPI = {
  /**
   * Constrói a URL do stream m3u8 direto de alta velocidade
   * Formato: https://cdn-sv01.maximaimg.online/stream/{firstLetter}/{slug}/{epPad}.mp4/index.m3u8
   */
  getEpisodeUrl(slug: string, episode = 1, _audio: AudioOption = 'default'): string {
    const epPad = episode.toString().padStart(2, '0');
    const cleanSlug = slug.toLowerCase().trim();
    const firstLetter = (cleanSlug.charAt(0) || 'a').toLowerCase();
    return `https://cdn-sv01.maximaimg.online/stream/${firstLetter}/${cleanSlug}/${epPad}.mp4/index.m3u8`;
  },
};

/**
 * Gera as fontes de streaming para o episódio.
 * Mantém exclusivamente o stream direto HLS (sem anúncios) e permite
 * a injeção do Webtor (Torrent P2P) pelo player.
 */
export function getEmbedSources(
  _tmdbId: string | number = '',
  _season = 1,
  episode = 1,
  audio: AudioOption = 'default',
  slug?: string
): EmbedSource[] {
  const sources: EmbedSource[] = [];

  if (slug) {
    sources.push({
      id: 'maximaimg',
      name: 'Player Ultra HLS (Sem Anúncios)',
      provider: 'maximaimg',
      url: MaximaImgAPI.getEpisodeUrl(slug, episode, audio),
      audioLabel: audio === 'dub' ? 'DUB' : 'LEG',
      type: 'video',
    });
  }

  return sources;
}

/**
 * Fallback para filmes (caso aplicável)
 */
export function getMovieEmbedSources(
  _tmdbId: string | number = '',
  audio: AudioOption = 'default',
  slug?: string
): EmbedSource[] {
  return getEmbedSources('', 1, 1, audio, slug);
}
