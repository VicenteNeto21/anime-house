'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Anime } from '@/lib/api';
import { useLibrary } from '@/context/LibraryContext';

interface AnimeCardProps {
  anime: Anime;
  priority?: boolean;
}

const STATUS_CONFIG: { [key: string]: { label: string, color: string } } = {
  'CURRENT': { label: 'Assistindo', color: 'bg-blue-600' },
  'REPEATING': { label: 'Reassistindo', color: 'bg-indigo-600' },
  'PLANNING': { label: 'Na Fila', color: 'bg-amber-600' },
  'COMPLETED': { label: 'Visto', color: 'bg-emerald-600' },
  'DROPPED': { label: 'Desisti', color: 'bg-rose-600' },
  'PAUSED': { label: 'Pausado', color: 'bg-slate-600' },
};

export default function AnimeCard({ anime, priority = false }: AnimeCardProps) {
  const { isInLibrary } = useLibrary();
  const libraryItem = isInLibrary(Number(anime.id));
  const statusInfo = libraryItem ? STATUS_CONFIG[libraryItem.status] : null;

  return (
    <Link href={`/anime/${anime.id}`} className="group relative aspect-[2/3] overflow-hidden rounded-xl bg-slate-900 border border-white/5 hover:border-blue-500/30 transition-all duration-300">

      <Image
        src={anime.poster}
        alt={anime.title}
        fill
        priority={priority}
        className="object-cover transition-transform duration-700 group-hover:scale-110 brightness-[0.85] group-hover:brightness-100"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

      {/* Badges */}
      <div className="absolute top-2 right-2 flex flex-col items-end gap-1 z-20">
        {statusInfo && (
          <span className={`px-1.5 py-0.5 ${statusInfo.color} text-[7px] font-black rounded text-white uppercase shadow-lg shadow-black/50 animate-in fade-in zoom-in duration-300`}>
            {statusInfo.label}
          </span>
        )}
        <div className="flex gap-1">
          {anime.currentEpisode && (
            <span className="px-1.5 py-0.5 bg-blue-600 text-[8px] font-black rounded text-white uppercase">
              Ep {anime.currentEpisode}
            </span>
          )}
          <span className="px-1.5 py-0.5 bg-slate-900/90 text-[8px] font-black rounded text-white uppercase border border-white/5 backdrop-blur-sm">
            HD
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        <h3 className="font-black text-[11px] leading-tight text-white uppercase tracking-tight line-clamp-2 drop-shadow-md group-hover:text-blue-400 transition-colors">
          {anime.title}
        </h3>
      </div>

      {/* Hover Icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <div className="w-10 h-10 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <i className="fa-solid fa-play text-white ml-0.5"></i>
          </div>
      </div>
    </Link>
  );
}
