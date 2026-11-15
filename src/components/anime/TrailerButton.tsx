'use client';

import { useState } from 'react';
import TrailerModal from './TrailerModal';
import { Play } from 'lucide-react';

export default function TrailerButton({ trailerId, title }: { trailerId: string; title?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="h-14 flex items-center gap-3 px-8 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-white font-black uppercase text-[11px] tracking-widest transition-all hover:scale-105 active:scale-95 group cursor-pointer"
        aria-label="Assistir ao trailer oficial"
      >
        <Play className="w-4 h-4 text-blue-500 fill-blue-500 group-hover:scale-110 transition-transform" />
        <span>Ver Trailer</span>
      </button>

      <TrailerModal 
        trailerId={trailerId} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title={title}
      />
    </>
  );
}
