'use client';

import { AniListAPI } from '@/lib/api';
import { useLibrary } from '@/context/LibraryContext';
import Link from 'next/link';
import Image from 'next/image';

import { WatchHistory } from '@/lib/history';
import { useState, useEffect } from 'react';
import { formatEpisodeLabel, translateEpisodeTitle } from '@/lib/episodeTitles';

interface EpisodeListProps {
  animeId: number;
  animeTitle: string;
  totalEpisodes: number;
  streamingEpisodes?: {
    title: string;
    thumbnail: string;
    url: string;
  }[];
}

export default function EpisodeList({ animeId, animeTitle, totalEpisodes, streamingEpisodes }: EpisodeListProps) {
  const { isInLibrary } = useLibrary();
  const libraryItem = isInLibrary(animeId);
  
  const [userProgress, setUserProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const aniListProgress = libraryItem?.progress || 0;
      const isRewatching = libraryItem?.status === 'REPEATING';
      
      const localHistory = WatchHistory.getAll();
      const localItem = localHistory.find(h => String(h.id) === String(animeId));
      
      if (libraryItem?.status === 'COMPLETED') {
        setUserProgress(totalEpisodes);
      } else {
        const aniListProgress = libraryItem?.progress || 0;
        const historyProgress = localItem?.episode || 0;
        
        setUserProgress(Math.max(aniListProgress, historyProgress));
      }
    };

    calculateProgress();
    window.addEventListener('ah-history-update', calculateProgress);
    return () => window.removeEventListener('ah-history-update', calculateProgress);
  }, [libraryItem, animeId, totalEpisodes]);

  // Se tivermos thumbnails, usamos o grid de cards detalhados
  if (streamingEpisodes && streamingEpisodes.length > 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: totalEpisodes }).map((_, i) => {
          const epNum = i + 1;
          const isWatched = epNum <= userProgress;
          const isCurrent = epNum === userProgress;
          const isRewatching = libraryItem?.status === 'REPEATING';
          const epData = streamingEpisodes[i];
          const episodeTitle = translateEpisodeTitle(epData?.title, epNum);

          return (
            <Link
              key={i}
              href={`/player/${animeId}-${AniListAPI.slugify(animeTitle)}/${epNum}`}
              className={`group relative flex items-center gap-3 bg-slate-900/40 border rounded-xl overflow-hidden transition-all p-2 ${
                isCurrent ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/5 hover:border-blue-500/30 hover:bg-slate-800/50'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative w-28 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800">
                <Image
                  src={epData?.thumbnail || 'https://placehold.co/600x400/0f172a/white?text=EP'}
                  alt={`Episódio ${epNum}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                  sizes="112px"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="fa-solid fa-play text-white text-xs"></i>
                </div>
                {isWatched && (
                  <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />
                )}
              </div>

              {/* Info */}
              <div className="flex-grow min-w-0 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase">{formatEpisodeLabel(epNum)}</span>
                  {isCurrent && (
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-wider">● Atual</span>
                  )}
                  {isRewatching && isWatched && (
                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-wider">↻ Revisto</span>
                  )}
                </div>
                <h4 className={`text-[11px] font-bold truncate group-hover:text-blue-400 transition-colors leading-tight ${
                  isWatched ? 'text-emerald-400/80' : 'text-slate-200'
                }`}>
                  {episodeTitle}
                </h4>
              </div>

              {/* Watched check */}
              {isWatched && (
                <div className="flex-shrink-0 pr-1">
                  <i className="fa-solid fa-check text-[10px] text-emerald-500/60"></i>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    );
  }

  // Fallback para o grid de números simples
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
      {Array.from({ length: totalEpisodes }).map((_, i) => {
        const epNum = i + 1;
        const isWatched = epNum <= userProgress;

        return (
          <Link
            key={i}
            href={`/player/${animeId}-${AniListAPI.slugify(animeTitle)}/${epNum}`}
            className={`relative aspect-square border rounded-xl flex items-center justify-center text-[11px] font-black transition-all shadow-sm overflow-hidden ${
              isWatched 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                : 'bg-slate-900 border-white/5 text-slate-500 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {isWatched && (
              <div className="absolute top-1.5 right-1.5">
                <i className="fa-solid fa-check text-[8px]"></i>
              </div>
            )}
            <span>{epNum.toString().padStart(2, '0')}</span>
            <div className={`absolute inset-0 bg-blue-600 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity`}>
              <i className="fa-solid fa-play text-white text-[10px]"></i>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
