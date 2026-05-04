export interface HistoryItem {
  id: string | number;
  title: string;
  cover: string;
  format: string;
  episode: number;
  updatedAt: number;
  isFromAniList?: boolean;
}

const STORAGE_KEY = 'ah_watch_history';
const MAX_ITEMS = 20;

export const WatchHistory = {
  save(anime: any, episode: number) {
    if (typeof window === 'undefined') return;

    let history = this.getAll();
    history = history.filter((item) => String(item.id) !== String(anime.id));

    const historyItem: HistoryItem = {
      id: anime.id,
      title: anime.title,
      cover: anime.poster,
      format: anime.format,
      episode: episode,
      updatedAt: Date.now(),
    };

    history.unshift(historyItem);

    if (history.length > MAX_ITEMS) {
      history = history.slice(0, MAX_ITEMS);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    
    // Dispatch event to sync UI components (like ContinueWatching)
    window.dispatchEvent(new CustomEvent('ah-history-update'));
  },

  getAll(): HistoryItem[] {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  remove(animeId: string | number) {
    if (typeof window === 'undefined') return;
    let history = this.getAll();
    history = history.filter((item) => String(item.id) !== String(animeId));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  },

  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },
};
