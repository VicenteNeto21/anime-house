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

export default function CalendarSection() {
  const [isOpen, setIsOpen] = useState(true);
  const [schedules, setSchedules] = useState<AiringSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(new Date().getDay());

  const days = [
    { label: 'Dom', value: 0 },
    { label: 'Seg', value: 1 },
    { label: 'Ter', value: 2 },
    { label: 'Qua', value: 3 },
    { label: 'Qui', value: 4 },
    { label: 'Sex', value: 5 },
    { label: 'Sáb', value: 6 },
  ];

  // Ordenar para que o "Hoje" fique no meio ou os dias apareçam em sequência útil
  // No print do usuário: Qui, Sex, Sáb, Hoje, Seg, Ter, Qua
  const getOrderedDays = () => {
    const today = new Date().getDay();
    const ordered = [];
    for (let i = -3; i <= 3; i++) {
      let day = today + i;
      if (day < 0) day += 7;
      if (day > 6) day -= 7;
      ordered.push(days.find(d => d.value === day)!);
    }
    return ordered;
  };

  const orderedDays = getOrderedDays();

  useEffect(() => {
    async function fetchSchedules() {
      try {
        // Buscar schedules para a semana
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

  const filteredSchedules = schedules.filter(s => {
    const date = new Date(s.airingAt * 1000);
    return date.getDay() === activeDay;
  });

  return (
    <section className="container mx-auto px-4 lg:px-8 mb-10">
      {/* Calendar Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 bg-blue-600 hover:bg-blue-500 flex items-center justify-between px-6 rounded-lg transition-all cursor-pointer border border-blue-400/20"
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-[11px]">
            <i className="fa-solid fa-calendar-day fa-lg"></i>
            <span>Calendário</span>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-black/20 p-1 rounded-lg">
            {orderedDays.map((day) => (
              <button
                key={day.value}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDay(day.value);
                }}
                className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter transition-all ${
                  activeDay === day.value 
                    ? 'bg-white text-blue-600' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {day.value === new Date().getDay() ? 'Hoje' : day.label}
              </button>
            ))}
          </div>
        </div>

        <i className={`fa-solid fa-chevron-down text-white/70 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
      </div>

      {/* Content Area */}
      {isOpen && (
        <div className="mt-2 bg-slate-900/40 rounded-xl border border-white/5 overflow-hidden">
          <div className="p-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-4 min-w-max">
              {loading ? (
                <div className="py-10 px-4 text-slate-500 text-xs animate-pulse italic">
                  Sincronizando com AniList...
                </div>
              ) : filteredSchedules.length > 0 ? (
                filteredSchedules.map((item) => (
                  <Link 
                    key={item.id} 
                    href={`/anime/${item.media.id}`}
                    className="w-32 flex-shrink-0 group"
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-white/5 mb-2 bg-slate-800">
                      <Image
                        src={item.media.poster}
                        alt={item.media.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 256px"
                      />

                      
                      {/* Lançado Badge */}
                      {item.airingAt * 1000 < Date.now() && (
                        <div className="absolute top-1 left-1 bg-green-500 text-[7px] font-black px-1.5 py-0.5 rounded text-white uppercase">
                          Lançado
                        </div>
                      )}

                      {/* Time Badge */}
                      <div className="absolute bottom-1 right-1 bg-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded text-white">
                        {new Date(item.airingAt * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <h4 className="text-[10px] font-bold text-slate-300 line-clamp-1 group-hover:text-blue-400 transition-colors uppercase tracking-tighter">
                      {item.media.title}
                    </h4>
                  </Link>
                ))
              ) : (
                <div className="py-10 px-4 text-slate-500 text-xs italic">
                  Nenhum lançamento previsto para este dia.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
