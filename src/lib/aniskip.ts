/**
 * ANIME_HOUSE // ANISKIP API
 * 
 * Busca os tempos de abertura (OP) e encerramento (ED) de um anime.
 */

export interface SkipTime {
  interval: {
    startTime: number;
    endTime: number;
  };
  skipType: 'op' | 'ed';
  skipId: string;
  episodeLength: number;
}

export const AniSkipAPI = {
  /**
   * Busca os intervalos de pulo (abertura/encerramento) para um episódio específico.
   * @param malId ID do anime no MyAnimeList (requerido pela AniSkip)
   * @param episode Número do episódio
   */
  async getSkipTimes(malId: number, episode: number): Promise<SkipTime[]> {
    try {
      const response = await fetch(
        `https://api.aniskip.com/v2/skip-times/${malId}/${episode}?types=op&types=ed&episodeLength=0`
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.found ? data.results : [];
    } catch (error) {
      console.error('ANISKIP_ERROR:', error);
      return [];
    }
  }
};
