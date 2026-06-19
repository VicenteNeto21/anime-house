/**
 * ANROLL_API // LIB_ANROLL v1.0
 */

export const AnrollAPI = {
  async search(query: string) {
    try {
      const response = await fetch('/api/scraper/anroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', query })
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (e) {
      console.error('ANROLL_SEARCH_ERROR:', e);
      return [];
    }
  },

  async getEpisodeId(slug: string, episode: number) {
    try {
      const response = await fetch('/api/scraper/anroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getEpisodeId', slug, episode })
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.episodeId;
    } catch (e) {
      console.error('ANROLL_EPISODE_ID_ERROR:', e);
      return null;
    }
  },

  async getPlayerIframe(episodeId: string) {
    if (!episodeId) return null;
    try {
      const response = await fetch('/api/scraper/anroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getIframe', episodeId })
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.iframe;
    } catch (e) {
      console.error('ANROLL_PLAYER_ERROR:', e);
      return null;
    }
  }
};
