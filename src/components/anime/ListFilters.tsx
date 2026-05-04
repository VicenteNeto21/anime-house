'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AniListAPI } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';

interface ListFiltersProps {
  genres: string[];
}

export default function ListFilters({ genres }: ListFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentGenre = searchParams.get('genre') || '';
  const currentSort = searchParams.get('sort') || 'TRENDING_DESC';
  const currentYear = searchParams.get('year') || '';
  const currentSeason = searchParams.get('season') || '';
  const currentView = searchParams.get('view') || 'grid';
  const currentSearch = searchParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(currentSearch);

  // Debounce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== currentSearch) {
        updateFilters('search', searchTerm);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/lista?${params.toString()}`, { scroll: false });
  };

  const years = Array.from({ length: 36 }, (_, i) => (2025 - i).toString());

  const sorts = [
    { label: 'Tendência', value: 'TRENDING_DESC' },
    { label: 'Populares', value: 'POPULARITY_DESC' },
    { label: 'Melhor Avaliados', value: 'SCORE_DESC' },
    { label: 'Lançamentos', value: 'START_DATE_DESC' },
    { label: 'Antigos', value: 'START_DATE_ASC' },
  ];

  const seasons = [
    { label: 'Inverno', value: 'WINTER' },
    { label: 'Primavera', value: 'SPRING' },
    { label: 'Verão', value: 'SUMMER' },
    { label: 'Outono', value: 'FALL' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full lg:w-auto">
      {/* Search & View Toggle Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80 group">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"></i>
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5 self-end md:self-auto">
          <button
            onClick={() => updateFilters('view', 'grid')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${currentView === 'grid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
          >
            <i className="fa-solid fa-grid-2"></i>
            Grade
          </button>
          <button
            onClick={() => updateFilters('view', 'list')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${currentView === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
          >
            <i className="fa-solid fa-list"></i>
            Lista
          </button>
        </div>
      </div>

      {/* Selects Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 ml-1">Ordenar</label>
          <select 
            value={currentSort}
            onChange={(e) => updateFilters('sort', e.target.value)}
            className="w-full bg-slate-900 border border-white/5 rounded-lg px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
          >
            {sorts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 ml-1">Gênero</label>
          <select 
            value={currentGenre}
            onChange={(e) => updateFilters('genre', e.target.value)}
            className="w-full bg-slate-900 border border-white/5 rounded-lg px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
          >
            <option value="">Todos</option>
            {genres.map(g => (
              <option key={g} value={g}>{AniListAPI.maps.genres[g] || g}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 ml-1">Temporada</label>
          <select 
            value={currentSeason}
            onChange={(e) => updateFilters('season', e.target.value)}
            className="w-full bg-slate-900 border border-white/5 rounded-lg px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
          >
            <option value="">Todas</option>
            {seasons.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 ml-1">Ano</label>
          <select 
            value={currentYear}
            onChange={(e) => updateFilters('year', e.target.value)}
            className="w-full bg-slate-900 border border-white/5 rounded-lg px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
          >
            <option value="">Todos</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Finalizados', key: 'status', value: 'FINISHED' },
          { label: 'Em Lançamento', key: 'status', value: 'RELEASING' },
          { label: 'Dublados', key: 'dubbed', value: 'true' },
          { label: 'Top 100', key: 'sort', value: 'SCORE_DESC' },
        ].map((tag) => {
          const isActive = searchParams.get(tag.key) === tag.value;
          return (
            <button
              key={tag.label}
              onClick={() => updateFilters(tag.key, isActive ? '' : tag.value)}
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                isActive 
                  ? 'bg-blue-600 border-blue-500 text-white' 
                  : 'bg-slate-900 border-white/5 text-slate-500 hover:text-white hover:border-white/10'
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
