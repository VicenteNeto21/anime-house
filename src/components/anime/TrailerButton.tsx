'use client';

import { useState } from 'react';
import TrailerModal from './TrailerModal';

export default function TrailerButton({ trailerId }: { trailerId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-black uppercase text-[11px] tracking-widest transition-all hover:scale-105 active:scale-95 group"
      >
        <i className="fa-solid fa-play text-blue-500 group-hover:scale-110 transition-transform"></i>
        Ver Trailer
      </button>

      <TrailerModal 
        trailerId={trailerId} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}
