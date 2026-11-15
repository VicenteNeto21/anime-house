'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Anime } from '@/lib/api';
import { translateEpisodeTitle, formatEpisodeLabel } from '@/lib/episodeTitles';
import { Search, Play } from 'lucide-react';

interface EpisodeSidebarProps {
  anime: Anime;
  currentEp: number;
  totalEps: number;
  id: string;
}

export default function EpisodeSidebar({
  anime,
  currentEp,
  totalEps,
  id,
}: EpisodeSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const episodes = Array.from({ length: totalEps }, (_, i) => i + 1);
  const filteredEps = searchQuery
    ? episodes.filter((ep) => ep.toString().includes(searchQuery.trim()))
    : episodes;

  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded-full" />
            Episódios
          </h3>
          <span className="text-[9px] font-bold text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-md border border-white/5">
            {totalEps} eps
          </span>
        </div>

        {/* Search episodes for series with multiple episodes */}
        {totalEps > 12 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar número do episódio..."
              className="w-full pl-8 pr-3 py-2 bg-slate-800/50 border border-white/5 rounded-xl text-[11px] font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Episode List */}
      <div className="flex flex-col gap-1 max-h-[600px] overflow-y-auto p-2 custom-scrollbar">
        {filteredEps.map((epNum) => {
          const isActive = epNum === currentEp;
          const epData = anime.streamingEpisodes?.[epNum - 1];
          const epTitle = epData?.title
            ? translateEpisodeTitle(epData.title, epNum)
            : undefined;

          return (
            <Link
              key={epNum}
              href={`/player/${id}/${epNum}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                isActive
                  ? 'bg-blue-600/10 border-blue-500/40 shadow-lg shadow-blue-500/5'
                  : 'bg-transparent border-transparent hover:bg-slate-800/50 hover:border-white/5'
              }`}
            >
              {/* Episode thumbnail or number */}
              {epData?.thumbnail ? (
                <div className="relative w-20 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800 border border-white/5">
                  <Image
                    src={epData.thumbnail}
                    alt={`EP ${epNum}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/50">
                        <Play className="w-2.5 h-2.5 text-white fill-current ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-400/30 shadow-md shadow-blue-500/30'
                      : 'bg-slate-800/50 text-slate-400 border-white/5'
                  }`}
                >
                  {epNum}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p
                  className={`text-[10px] font-black uppercase tracking-wider truncate ${
                    isActive ? 'text-blue-400' : 'text-slate-300'
                  }`}
                >
                  {formatEpisodeLabel(epNum)}
                  {epTitle && (
                    <span className="text-slate-500 font-bold normal-case tracking-normal ml-1.5">
                      — {epTitle}
                    </span>
                  )}
                </p>
              </div>

              {isActive && (
                <div className="flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
