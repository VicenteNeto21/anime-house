'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Anime, AniListAPI } from '@/lib/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }
    setLoading(true);
    try {
      const data = await AniListAPI.search(q);
      setResults(data);
      setSelectedIndex(-1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
        e.preventDefault();
        router.push(`/anime/${results[selectedIndex].id}`);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, results, selectedIndex, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-lg flex items-start justify-center pt-32 px-6">
      <div className="w-full max-w-3xl">
        <div className="flex items-center gap-4 bg-slate-900/80 p-6 rounded-2xl border border-white/10 shadow-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="O que você quer assistir hoje?"
            className="w-full bg-transparent border-none text-xl focus:ring-0 outline-none text-white placeholder-slate-600"
          />
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-all text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        <div className="mt-8 grid gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar pb-10">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-5 p-4 bg-slate-900/40 rounded-2xl border border-transparent">
                <div className="relative w-16 h-24 flex-shrink-0 skeleton rounded-xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-3/4 skeleton rounded-md"></div>
                  <div className="h-3 w-1/2 skeleton rounded-md"></div>
                  <div className="h-3 w-full skeleton rounded-md mt-2"></div>
                </div>
                <div className="w-10 h-10 rounded-full skeleton flex-shrink-0"></div>
              </div>
            ))
          ) : results.length > 0 ? (
            results.map((anime, index) => (
              <Link
                key={anime.id}
                href={`/anime/${anime.id}`}
                onClick={onClose}
                className={`flex items-center gap-5 p-4 rounded-2xl border transition-all group cursor-pointer ${selectedIndex === index ? 'bg-slate-900/80 border-blue-500/50' : 'bg-slate-900/40 border-transparent hover:border-blue-500/50 hover:bg-slate-900/80'
                  }`}
              >
                <div className="relative w-16 h-24 flex-shrink-0">
                  <Image
                    src={anime.poster}
                    alt={anime.title}
                    fill
                    className="object-cover rounded-xl"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-1">{anime.title}</h4>
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{anime.format} • {anime.year} • {anime.episodes} EPS</p>
                  <p className="text-sm text-slate-400 line-clamp-2 mt-2 font-medium">
                    {anime.description?.replace(/<[^>]*>?/gm, '') || 'Sem descrição.'}
                  </p>

                </div>
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center group-hover:bg-blue-600 transition-colors flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </div>
              </Link>
            ))
          ) : query && !loading && (
            <p className="text-center text-slate-500 py-10">Nenhum resultado encontrado para "{query}"</p>
          )}
        </div>
      </div>
    </div>
  );
}
