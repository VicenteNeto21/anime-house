'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Anime, AniListAPI } from '@/lib/api';
import { WatchHistory } from '@/lib/history';

interface EpisodeCardProps {
  anime: Anime;
}

export default function EpisodeCard({ anime }: EpisodeCardProps) {
  const currentEp = anime.episode || 1;
  const [isWatched, setIsWatched] = useState(false);

  useEffect(() => {
    const checkWatched = () => {
      const history = WatchHistory.getAll();
      const item = history.find(h => String(h.id) === String(anime.id));
      if (item && item.episode >= currentEp) {
        setIsWatched(true);
      } else {
        setIsWatched(false);
      }
    };

    checkWatched();
    window.addEventListener('ah-history-update', checkWatched);
    return () => window.removeEventListener('ah-history-update', checkWatched);
  }, [anime.id, currentEp]);

  return (
    <Link href={`/player/${AniListAPI.slugify(anime.title)}/${currentEp}`} className="group flex flex-col cursor-pointer">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-900 border border-white/5 group-hover:border-blue-500/30 transition-all duration-300">
        <Image
          src={anime.poster}
          alt={anime.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110 brightness-[0.9] group-hover:brightness-100"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        
        {/* Watched Overlay */}
        {isWatched && (
          <div className="absolute inset-0 bg-emerald-500/10 z-10 pointer-events-none" />
        )}

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex gap-1 z-20">
          <div className="px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded flex items-center gap-1 border border-white/10">
            <i className="fa-solid fa-clock text-[8px] text-white/70"></i>
            <span className="text-[9px] font-black text-white uppercase">24 min</span>
          </div>
          {isWatched && (
            <div className="px-1.5 py-0.5 bg-emerald-600/90 backdrop-blur-md rounded flex items-center gap-1 border border-emerald-500/30 shadow-lg shadow-emerald-600/20">
              <i className="fa-solid fa-check text-[8px] text-white"></i>
              <span className="text-[9px] font-black text-white uppercase">Visto</span>
            </div>
          )}
        </div>

        <div className="absolute top-2 right-2 flex gap-1 z-20">
          <span className="px-1.5 py-0.5 bg-blue-600/90 text-[9px] font-black rounded text-white uppercase">
            LEG
          </span>
          <span className="px-1.5 py-0.5 bg-[#3b82f6] text-[9px] font-black rounded text-white uppercase">
            FULL HD
          </span>

        </div>

        {/* Hover Icon */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="w-10 h-10 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <i className="fa-solid fa-play text-white ml-0.5"></i>
          </div>
        </div>
      </div>
      
      <div className="py-3 px-1">
        <h3 className={`font-bold text-[13px] leading-tight line-clamp-1 group-hover:text-blue-400 transition-colors duration-300 ${isWatched ? 'text-emerald-400' : 'text-slate-100'}`}>
          {anime.title}
        </h3>
        <p className={`text-[10px] font-black mt-1 uppercase tracking-widest ${isWatched ? 'text-emerald-500/60' : 'text-slate-500'}`}>
          EPISÓDIO {currentEp}
        </p>
      </div>
    </Link>
  );
}
