'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TrailerModalProps {
  trailerId: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function TrailerModal({ trailerId, isOpen, onClose, title }: TrailerModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_100px_-20px_rgba(59,130,246,0.3)] border border-white/10 animate-in zoom-in-95 fade-in duration-500">
        
        {/* Glow Effect */}
        <div className="absolute -inset-20 bg-blue-600/10 blur-[100px] pointer-events-none" />

        {/* Header Info */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-20">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Trailer Oficial</span>
            <h3 className="text-white text-sm md:text-xl font-black uppercase tracking-tighter truncate max-w-xs md:max-w-xl">
              {title || 'Assista ao Trailer'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all hover:rotate-90 hover:scale-110 active:scale-95 border border-white/10 backdrop-blur-md"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* YouTube Iframe */}
        <iframe
          src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&rel=0&modestbranding=1`}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>,
    document.body
  );
}
