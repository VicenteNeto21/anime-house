'use client';

import { useState, useEffect, useRef } from 'react';
import { WatchHistory, HistoryItem } from '@/lib/history';
import { AniListAPI } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default function ContinueWatching() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function loadHistory(currentPage: number, append = false) {
    if (loading) return;
    setLoading(true);
    
    try {
      const localHistory = WatchHistory.getAll();
      const token = typeof window !== 'undefined' ? localStorage.getItem('anilist_token') : null;
      
      let merged: HistoryItem[] = append ? [...history] : [...localHistory];

      if (token) {
        const aniListItems = await AniListAPI.getUserWatchingList(token, currentPage, 12);
        
        if (aniListItems.length < 12) {
          setHasMore(false);
        }

        aniListItems.forEach((ani: any) => {
          const alreadyExistsIndex = merged.findIndex(m => String(m.id) === String(ani.id));
          const aniUpdatedAt = ani.updatedAt * 1000;
          
          if (alreadyExistsIndex === -1) {
            merged.push({
              id: ani.id,
              title: ani.title,
              cover: ani.cover,
              format: ani.format,
              episode: ani.progress + 1,
              updatedAt: aniUpdatedAt || Date.now() - 1000,
              isFromAniList: true
            });
          } else {
             const localItem = merged[alreadyExistsIndex];
              if (aniUpdatedAt > localItem.updatedAt) {
                merged[alreadyExistsIndex] = {
                  ...localItem,
                  episode: ani.progress + 1,
                  updatedAt: aniUpdatedAt,
                  isFromAniList: true
                };
              } else if (ani.progress + 1 > localItem.episode) {
                // Se o local for mais recente mas o AniList tiver progresso maior (raro), atualizamos o progresso mantendo a data local
                merged[alreadyExistsIndex].episode = ani.progress + 1;
                merged[alreadyExistsIndex].isFromAniList = true;
              }
          }
        });
      } else {
        setHasMore(false);
      }
      
      setHistory(merged.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (error) {
      console.error("CONTINUE_WATCHING_SYNC_ERROR:", error);
      if (!append) {
        const localHistory = WatchHistory.getAll();
        setHistory(localHistory.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory(1);

    const handleUpdate = () => loadHistory(1);
    window.addEventListener('ah-history-update', handleUpdate);
    window.addEventListener('anilist-sync', handleUpdate);
    
    return () => {
      window.removeEventListener('ah-history-update', handleUpdate);
      window.removeEventListener('anilist-sync', handleUpdate);
    };
  }, []);

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
              aria-label="Scroll Left"
            >
              <i className="fa-solid fa-chevron-left text-xs group-hover:-translate-x-0.5 transition-transform"></i>
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-10 h-10 flex items-center justify-center bg-slate-900/50 hover:bg-slate-800 border border-white/5 rounded-xl transition-all group"
              aria-label="Scroll Right"
            >
              <i className="fa-solid fa-chevron-right text-xs group-hover:translate-x-0.5 transition-transform"></i>
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

        {/* Horizontal Carousel */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar scroll-smooth"
        >
          {history.map((item) => (
            <Link
              key={`${item.id}-${item.episode}`}
              href={`/player/${AniListAPI.slugify(item.title)}/${item.episode}`}
              className="group relative flex-none w-[220px] md:w-[280px] aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 border border-white/5 hover:border-blue-500/50 transition-all shadow-xl snap-start"
            >
              <Image 
                src={item.cover} 
                alt={item.title} 
                fill 
                sizes="(max-width: 768px) 220px, 280px"
                className="object-cover group-hover:scale-110 transition-transform duration-500 brightness-75 group-hover:brightness-100" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className="text-sm font-bold text-white line-clamp-1 mb-1 group-hover:text-blue-400 transition-colors">{item.title}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                    {item.isFromAniList && <i className="fa-solid fa-sync-alt text-[8px] opacity-50 animate-pulse"></i>}
                    <i className="fa-solid fa-play text-[8px]"></i> Episódio {item.episode}
                  </span>
                </div>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/40 scale-75 group-hover:scale-100 transition-transform">
                  <i className="fa-solid fa-play text-white text-lg ml-1"></i>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
