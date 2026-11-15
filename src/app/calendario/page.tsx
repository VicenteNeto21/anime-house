'use client';

import { useState, useEffect, useMemo } from 'react';
import { AniListAPI } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, LayoutGrid, ListFilter, Bell, ChevronRight } from 'lucide-react';

interface AiringScheduleItem {
  id: number;
  airingAt: number;
  episode: number;
  media: {
    id: number | string;
    title: string;
    poster: string;
    format: string;
  };
}

export default function CalendarPage() {
  const [schedules, setSchedules] = useState<AiringScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(new Date().getDay());
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [currentTime, setCurrentTime] = useState<number>(0);

  const [notifications, setNotifications] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('anime_notifications');
      return saved ? (JSON.parse(saved) as number[]) : [];
    } catch {
      return [];
    }
  });

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
    setCurrentTime(Date.now());

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
  }, []);

  const toggleNotification = (id: number) => {
    const updated = notifications.includes(id)
      ? notifications.filter((n) => n !== id)
      : [...notifications, id];
    setNotifications(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('anime_notifications', JSON.stringify(updated));
    }
  };

  const filteredSchedules = useMemo(() => {
    return schedules
      .filter((s) => {
        const date = new Date(s.airingAt * 1000);
        return date.getDay() === activeDay;
      })
      .sort((a, b) => a.airingAt - b.airingAt);
  }, [schedules, activeDay]);

  return (
    <main className="container mx-auto px-4 lg:px-8 py-12">
      {/* Header & Filter Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500">
            <CalendarDays className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">
              Calendário de Lançamentos
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Acompanhe a transmissão semanal dos seus animes favoritos no fuso horário local.
            </p>
          </div>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-white/5 p-1 rounded-2xl flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Grade
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                viewMode === 'timeline'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Linha do Tempo
            </button>
          </div>
        </div>
      </div>

      {/* Week Day Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-6 scrollbar-none mb-10">
        {days.map((day) => {
          const isToday = new Date().getDay() === day.value;
          const isSelected = activeDay === day.value;

          return (
            <button
              key={day.value}
              onClick={() => setActiveDay(day.value)}
              className={`flex-1 min-w-[90px] py-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20'
                  : 'bg-slate-900/50 border-white/5 text-slate-400 hover:text-white hover:bg-slate-900 hover:border-white/10'
              }`}
            >
              <span className="text-[10px] font-black tracking-widest">{day.label}</span>
              {isToday && (
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  Hoje
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 animate-pulse">
              <div className="aspect-[2/3] bg-slate-900 rounded-2xl border border-white/5"></div>
              <div className="h-4 bg-slate-900 rounded-lg w-3/4"></div>
              <div className="h-3 bg-slate-900 rounded-lg w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredSchedules.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filteredSchedules.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 group">
                <Link
                  href={`/anime/${item.media.id}`}
                  className="aspect-[2/3] relative rounded-2xl overflow-hidden bg-slate-900 border border-white/5 group-hover:border-blue-500/30 transition-all duration-300 shadow-xl"
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
                    {currentTime > 0 && item.airingAt * 1000 < currentTime && (
                      <span className="px-1.5 py-0.5 bg-green-500 text-[8px] font-black rounded text-white uppercase">
                        Lançado
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 bg-blue-600 text-[8px] font-black rounded text-white">
                      {new Date(item.airingAt * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Notification Bell */}
                  {currentTime > 0 && item.airingAt * 1000 > currentTime && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleNotification(item.id);
                      }}
                      aria-label="Notificar episódio"
                      className={`absolute bottom-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all z-30 ${
                        notifications.includes(item.id) ? 'bg-yellow-500 text-white' : 'bg-black/60 text-white/50 hover:text-white hover:bg-black/80'
                      }`}
                    >
                      <Bell className={`w-3.5 h-3.5 ${notifications.includes(item.id) ? 'animate-bounce' : ''}`} />
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
                    {currentTime > 0 && item.airingAt * 1000 < currentTime ? (
                      <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[9px] font-black rounded uppercase">Lançado</span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleNotification(item.id);
                        }}
                        aria-label="Notificar episódio"
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          notifications.includes(item.id) ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' : 'bg-slate-800 text-slate-500 hover:text-white'
                        }`}
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-white mr-2 transition-colors" />
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
