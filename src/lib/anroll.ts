/**
 * ANROLL_API // LIB_ANROLL v1.0
 */

export const AnrollAPI = {
  baseUrl: 'https://anroll.io',

  async search(query: string) {
    const url = `${this.baseUrl}/?s=${encodeURIComponent(query)}`;
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;

    try {
      const response = await fetch(proxyUrl);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const items = doc.querySelectorAll('.anime-card a');
      return Array.from(items).map(item => {
        const title = item.querySelector('.title')?.textContent?.trim() || item.getAttribute('title') || "";
        const link = item.getAttribute('href');
        const slug = link?.split('/').filter(Boolean).pop();
        return { title, slug };
      }).filter(item => item.slug);
    } catch (e) {
      console.error('ANROLL_SEARCH_ERROR:', e);
      return [];
    }
  },

  async getEpisodeId(slug: string, episode: number) {
    const url = `${this.baseUrl}/anime/${slug}`;
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;

    try {
      const response = await fetch(proxyUrl);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const epLinks = doc.querySelectorAll('a[href*="/"]');
      for (let i = 0; i < epLinks.length; i++) {
        const link = epLinks[i];
        const epText = link.textContent?.trim().toLowerCase() || "";
        const href = link.getAttribute('href');
        
        if (href && /^\/\d+\/$/.test(href)) {
          if (epText === episode.toString() || epText.includes(`episódio ${episode}`) || epText.includes(`ep ${episode}`)) {
            return href.replace(/\//g, '');
          }
        }
      }
      return null;
    } catch (e) {
      console.error('ANROLL_EPISODE_ID_ERROR:', e);
      return null;
    }
  },

  async getPlayerIframe(episodeId: string) {
    if (!episodeId) return null;
    const url = `${this.baseUrl}/${episodeId}/`;
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;

    try {
      const response = await fetch(proxyUrl);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const iframe = doc.querySelector('iframe[src*="anidrive"]') as HTMLIFrameElement;
      return iframe ? iframe.src : null;
    } catch (e) {
      console.error('ANROLL_PLAYER_ERROR:', e);
      return null;
    }
  }
};
