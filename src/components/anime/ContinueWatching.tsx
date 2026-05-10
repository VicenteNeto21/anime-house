'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { WatchHistory, HistoryItem } from '@/lib/history';
import { AniListAPI } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

type ResumeSnapshot = {
  time: number;
  duration?: number;
  source?: string;
  server?: string;
  src?: string;
  updatedAt?: number;
};

type AniListWatchingItem = {
  id: string | number;
  title: string;
  cover: string;
  format: string;
  progress: number;
  totalEpisodes?: number;
  updatedAt: number;
};

type AniListMediaListStatus = {
  status?: string;
  progress?: number;
};

const formatWatchTime = (seconds?: number) => {
  if (!seconds || !Number.isFinite(seconds)) return null;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const normalizeSourceName = (source?: string) => {
  if (!source) return null;

  const labels: Record<string, string> = {
    ao_to: 'Premium',
    direct: 'AnimePlay',
    feral: 'Feral',
    pixel: 'Pixel',
    anivideo: 'AniVideo',
    warez: 'WarezCDN',
    betterflix: 'BetterFlix',
    anroll: 'Anroll',
    busca_ia: 'IA',
  };

  return labels[source] || source.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const readProgressMap = () => {
  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(localStorage.getItem('ah_watch_progress') || '{}') as Record<string, number>;
  } catch {
    return {};
  }
};

const clearLocalProgressForAnime = (animeId: string | number) => {
  if (typeof window === 'undefined') return;

  const prefixes = [`ah_resume_${animeId}_`, `ah_time_${animeId}_`];
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && prefixes.some((prefix) => key.startsWith(prefix))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));

  try {
    const progressMap = readProgressMap();
    Object.keys(progressMap).forEach((key) => {
      if (key.startsWith(`${animeId}_`)) delete progressMap[key];
    });
    localStorage.setItem('ah_watch_progress', JSON.stringify(progressMap));
  } catch {
    localStorage.removeItem('ah_watch_progress');
  }
};

const filterAniListCompletedHistory = async (items: HistoryItem[], token: string) => {
  const checked = await Promise.all(
    items.map(async (item) => {
      try {
        const data = await AniListAPI.getMediaListStatus(Number(item.id), token, true);
        const mediaList = data?.MediaList as AniListMediaListStatus | undefined;
        const isCompleted = mediaList?.status === 'COMPLETED';

        if (isCompleted) {
          WatchHistory.remove(item.id);
          clearLocalProgressForAnime(item.id);
          return null;
        }

        return item;
      } catch {
        return item;
      }
    })
  );

  return checked.filter(Boolean) as HistoryItem[];
};

const readResumeSnapshot = (animeId: string | number, episode: number): ResumeSnapshot | null => {
  if (typeof window === 'undefined') return null;

  const saved = localStorage.getItem(`ah_resume_${animeId}_${episode}`);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved) as Partial<ResumeSnapshot> | number;
    if (typeof parsed === 'number' && Number.isFinite(parsed)) return { time: parsed };
    if (typeof parsed === 'object' && typeof parsed.time === 'number' && Number.isFinite(parsed.time)) {
      return {
        time: parsed.time,
        duration: typeof parsed.duration === 'number' ? parsed.duration : undefined,
        source: parsed.source,
        src: parsed.src,
        updatedAt: parsed.updatedAt,
      };
    }
  } catch {
    const legacyTime = parseFloat(saved);
    if (Number.isFinite(legacyTime)) return { time: legacyTime };
  }

  return null;
};

const readLatestResumeSnapshot = (animeId: string | number): (ResumeSnapshot & { episode: number }) | null => {
  if (typeof window === 'undefined') return null;

  let latest: (ResumeSnapshot & { episode: number }) | null = null;
  const prefix = `ah_resume_${animeId}_`;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(prefix)) continue;

    const episode = Number(key.replace(prefix, ''));
    if (!Number.isFinite(episode)) continue;

    const saved = localStorage.getItem(key);
    if (!saved) continue;

    try {
      const parsed = JSON.parse(saved) as Partial<ResumeSnapshot>;
      if (typeof parsed.time !== 'number') continue;
      const snapshot = { ...parsed, time: parsed.time, episode } as ResumeSnapshot & { episode: number };
      if (!latest || (snapshot.updatedAt || 0) > (latest.updatedAt || 0)) latest = snapshot;
    } catch {
      const legacyTime = parseFloat(saved);
      if (Number.isFinite(legacyTime) && !latest) latest = { time: legacyTime, episode };
    }
  }

  return latest;
};

const enrichLocalHistory = (items: HistoryItem[]) => {
  const progressMap = readProgressMap();

  return items
    .map((item) => {
      const exactResume = readResumeSnapshot(item.id, item.episode);
      const latestResume = readLatestResumeSnapshot(item.id);
      const resume = exactResume || latestResume;
      const episode = latestResume && !exactResume ? latestResume.episode : item.episode;
      const progress = progressMap[`${item.id}_${episode}`];
      const resumeProgress = resume?.time && resume?.duration ? Math.floor((resume.time / resume.duration) * 100) : 0;
      const bestProgress = Math.max(Number(progress) || 0, resumeProgress || 0);

      return {
        ...item,
        episode,
        resumeTime: resume?.time,
        resumeDuration: resume?.duration,
        resumeSource: resume?.source || resume?.server,
        resumeSrc: resume?.src,
        progress: bestProgress,
        updatedAt: resume?.updatedAt || item.updatedAt,
      };
    })
    .filter((item) => {
      const progress = item.progress || 0;
      const hasResume = Boolean(item.resumeTime && item.resumeTime > 10);
      const isFinished = progress >= 95;

      if (isFinished) {
        WatchHistory.remove(item.id);
        clearLocalProgressForAnime(item.id);
        return false;
      }

      return hasResume || progress > 0 || item.episode > 1;
    });
};

export default function ContinueWatching() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HistoryItem[]>([]);
  const loadingRef = useRef(false);

  const loadHistory = useCallback(async (currentPage: number, append = false) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      let localHistory: HistoryItem[] = enrichLocalHistory(WatchHistory.getAll());
      const token = typeof window !== 'undefined' ? localStorage.getItem('anilist_token') : null;

      if (token) {
        localHistory = await filterAniListCompletedHistory(localHistory, token);
      }

      const merged: HistoryItem[] = append ? [...historyRef.current] : [...localHistory];

      if (token) {
        const aniListItems = await AniListAPI.getUserWatchingList(token, currentPage, 12);

        if (aniListItems.length < 12) {
          setHasMore(false);
        }

        aniListItems.forEach((ani: AniListWatchingItem) => {
          const alreadyExistsIndex = merged.findIndex((item) => String(item.id) === String(ani.id));
          const aniUpdatedAt = ani.updatedAt * 1000;
          const nextEpisode = ani.progress + 1;
          const totalEpisodes = Number(ani.totalEpisodes) || 0;

          if (totalEpisodes > 0 && ani.progress >= totalEpisodes) return;

          if (alreadyExistsIndex === -1) {
            merged.push({
              id: ani.id,
              title: ani.title,
              cover: ani.cover,
              format: ani.format,
              episode: nextEpisode,
              updatedAt: aniUpdatedAt || Date.now() - 1000,
              isFromAniList: true,
            });
          } else {
            const localItem = merged[alreadyExistsIndex];
            if (aniUpdatedAt > localItem.updatedAt) {
              merged[alreadyExistsIndex] = {
                ...localItem,
                episode: nextEpisode,
                updatedAt: aniUpdatedAt,
                isFromAniList: true,
              };
            } else if (nextEpisode > localItem.episode) {
              merged[alreadyExistsIndex].episode = nextEpisode;
              merged[alreadyExistsIndex].isFromAniList = true;
            }
          }
        });
      } else {
        setHasMore(false);
      }

      const sorted = merged.sort((a, b) => b.updatedAt - a.updatedAt);
      historyRef.current = sorted;
      setHistory(sorted);
    } catch (error) {
      console.error('CONTINUE_WATCHING_SYNC_ERROR:', error);
      if (!append) {
        const fallback = enrichLocalHistory(WatchHistory.getAll()).sort((a, b) => b.updatedAt - a.updatedAt);
        historyRef.current = fallback;
        setHistory(fallback);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => loadHistory(1), 0);

    const handleUpdate = () => loadHistory(1);
    window.addEventListener('ah-history-update', handleUpdate);
    window.addEventListener('anilist-sync', handleUpdate);

    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener('ah-history-update', handleUpdate);
      window.removeEventListener('anilist-sync', handleUpdate);
    };
  }, [loadHistory]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (history.length === 0 && !loading) return null;

  return (
    <section className="py-10">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
            <h2 className="text-2xl font-black uppercase tracking-tighter">Continuar Assistindo</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 flex items-center justify-center bg-slate-900/50 hover:bg-slate-800 border border-white/5 rounded-xl transition-all group"
              aria-label="Rolar para esquerda"
            >
              <i className="fa-solid fa-chevron-left text-xs group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 flex items-center justify-center bg-slate-900/50 hover:bg-slate-800 border border-white/5 rounded-xl transition-all group"
              aria-label="Rolar para direita"
            >
              <i className="fa-solid fa-chevron-right text-xs group-hover:translate-x-0.5 transition-transform" />
            </button>
            {hasMore && (
              <button
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  loadHistory(nextPage, true);
                }}
                disabled={loading}
                className="ml-2 px-6 py-2 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all disabled:opacity-50"
              >
                {loading ? '...' : 'Mais'}
              </button>
            )}
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar scroll-smooth"
        >
          {history.map((item) => {
            const resumeLabel = formatWatchTime(item.resumeTime);
            const progress = item.progress || (item.resumeTime && item.resumeDuration ? Math.floor((item.resumeTime / item.resumeDuration) * 100) : 0);
            const sourceName = normalizeSourceName(item.resumeSource);

            return (
              <Link
                key={`${item.id}-${item.episode}`}
                href={`/player/${AniListAPI.slugify(item.title)}/${item.episode}`}
                className="group relative flex-none w-[240px] md:w-[320px] aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 border border-white/5 hover:border-blue-500/50 transition-all shadow-xl snap-start"
              >
                <Image
                  src={item.cover}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 240px, 320px"
                  className="object-cover group-hover:scale-110 transition-transform duration-500 brightness-75 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />

                {progress > 0 && (
                  <div className="absolute left-0 right-0 bottom-0 h-1.5 bg-white/10 z-20">
                    <div className="h-full bg-blue-500" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 className="text-sm font-bold text-white line-clamp-1 mb-1 group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5 min-w-0">
                      {item.isFromAniList && <i className="fa-solid fa-sync-alt text-[8px] opacity-50 animate-pulse" />}
                      <i className="fa-solid fa-play text-[8px]" />
                      {resumeLabel ? `Continuar EP ${item.episode} - ${resumeLabel}` : `Episodio ${item.episode}`}
                    </span>
                    {sourceName && (
                      <span className="shrink-0 text-[8px] font-black uppercase tracking-widest text-white/50">
                        {sourceName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/40 scale-75 group-hover:scale-100 transition-transform">
                    <i className="fa-solid fa-play text-white text-lg ml-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
