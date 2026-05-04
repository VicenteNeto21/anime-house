'use client';

import { useState, useEffect } from 'react';
import { AniListAPI, Anime } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

interface AiringSchedule {
  id: number;
  airingAt: number;
  episode: number;
  media: Anime;
}

export default function CalendarPage() {
  const [schedules, setSchedules] = useState<AiringSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(new Date().getDay());
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [notifications, setNotifications] = useState<number[]>([]);

  const days = [
    { label: 'DOM', value: 0 },
    { label: 'SEG', value: 1 },
    { label: 'TER', value: 2 },
    { label: 'QUA', value: 3 },
    { label: 'QUI', value: 4 },
    { label: 'SEX', value: 5 },
    { label: 'SÁB', value: 6 },
  ];

  useEffect(() => {
    async function fetchSchedules() {
      try {
        const data = await AniListAPI.getAiringSchedule();
        setSchedules(data);
      } catch (error) {
        console.error('Erro ao buscar calendário:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSchedules();
    
    // Carregar notificações do localStorage
    const saved = localStorage.getItem('anime_notifications');
    if (saved) setNotifications(JSON.parse(saved));
  }, []);

  const toggleNotification = (id: number) => {
    const updated = notifications.includes(id) 
      ? notifications.filter(n => n !== id)
      : [...notifications, id];
    setNotifications(updated);
    localStorage.setItem('anime_notifications', JSON.stringify(updated));
  };

  const filteredSchedules = schedules.filter(s => {
    const date = new Date(s.airingAt * 1000);
    return date.getDay() === activeDay;
  }).sort((a, b) => a.airingAt - b.airingAt);

  return (
    <main className="container mx-auto px-4 lg:px-8 py-12">
      {/* Header & Filter Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500">
            <i className="fa-solid fa-calendar-days text-2xl"></i>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-white">Calendário</h1>
            <p className="text-slate-400 text-sm font-medium">Acompanhe os lançamentos diários atualizados.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Day Selector */}
          <div className="bg-slate-900/50 p-1 rounded-xl border border-white/5 flex gap-1 overflow-x-auto max-w-full">
            {days.map((day) => (
              <button
                key={day.value}
                onClick={() => setActiveDay(day.value)}
                className={`px-4 md:px-5 py-2.5 rounded-lg text-xs font-black transition-all flex-shrink-0 ${
                  activeDay === day.value 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="bg-slate-900 p-1 rounded-xl border border-white/5 flex gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}
              title="Visualização em Grade"
            >
              <i className="fa-solid fa-table-cells-large"></i>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2.5 rounded-lg transition-all ${viewMode === 'timeline' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}
              title="Visualização em Linha do Tempo"
            >
              <i className="fa-solid fa-list-ul"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Anime Content */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-slate-900 rounded-xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filteredSchedules.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {filteredSchedules.map((item) => (
              <div key={item.id} className="group relative flex flex-col">
                <Link 
                  href={`/anime/${item.media.id}`}
                  className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/5 bg-slate-900 mb-3"
                >
                  <Image
                    src={item.media.poster}
                    alt={item.media.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 15vw"
                  />
                  
                  {/* Status Badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 z-20 items-end">
                    {item.airingAt * 1000 < Date.now() && (
                      <span className="px-1.5 py-0.5 bg-green-500 text-[8px] font-black rounded text-white uppercase">
                        Lançado
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 bg-blue-600 text-[8px] font-black rounded text-white">
                      {new Date(item.airingAt * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Notification Bell */}
                  {item.airingAt * 1000 > Date.now() && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleNotification(item.id);
                      }}
                      className={`absolute bottom-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all z-30 ${
                        notifications.includes(item.id) ? 'bg-yellow-500 text-white' : 'bg-black/60 text-white/50 hover:text-white hover:bg-black/80'
                      }`}
                    >
                      <i className={`fa-solid fa-bell ${notifications.includes(item.id) ? 'animate-bounce' : ''} text-xs`}></i>
                    </button>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                </Link>
                
                <div className="px-1">
                  <h3 className="text-[12px] font-bold text-white line-clamp-1 group-hover:text-blue-500 transition-colors uppercase tracking-tighter">
                    {item.media.title}
                  </h3>
                  <p className="text-[9px] font-black text-slate-500 mt-1 uppercase tracking-widest">
                    Episódio {item.episode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 relative">
            <div className="absolute left-[39px] top-0 bottom-0 w-px bg-slate-800" />
            
            {filteredSchedules.map((item) => (
              <div key={item.id} className="flex gap-8 group">
                <div className="flex flex-col items-center flex-shrink-0">
                  <span className="text-[11px] font-black text-white bg-slate-900 border border-white/5 px-3 py-1.5 rounded-lg z-10 w-20 text-center">
                    {new Date(item.airingAt * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <Link 
                  href={`/anime/${item.media.id}`}
                  className="flex-grow bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex items-center gap-6 hover:bg-slate-900/80 hover:border-blue-500/30 transition-all group"
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={item.media.poster} alt={item.media.title} fill className="object-cover" sizes="56px" />
                  </div>
                  
                  <div className="flex-grow">
                    <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-blue-500 transition-colors">
                      {item.media.title}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Episódio {item.episode} • {item.media.format}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    {item.airingAt * 1000 < Date.now() ? (
                      <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[9px] font-black rounded uppercase">Lançado</span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleNotification(item.id);
                        }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          notifications.includes(item.id) ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' : 'bg-slate-800 text-slate-500 hover:text-white'
                        }`}
                      >
                        <i className="fa-solid fa-bell text-xs"></i>
                      </button>
                    )}
                    <i className="fa-solid fa-chevron-right text-slate-700 group-hover:text-white text-xs mr-2 transition-colors"></i>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="col-span-full py-20 text-center text-slate-500 italic">
          Nenhum lançamento previsto para este dia.
        </div>
      )}
    </main>
  );
}
