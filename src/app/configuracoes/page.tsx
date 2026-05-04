'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('anilist_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    // No futuro aqui podemos buscar mais configurações locais
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 py-12">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Configurações</h1>
          <p className="text-slate-500 text-sm font-medium">Gerencie sua conta e preferências da plataforma.</p>
        </div>

        <div className="space-y-6">
          {/* Section: Conta */}
          <section className="bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/5">
              <h2 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-3">
                <i className="fa-solid fa-user text-blue-500"></i>
                Minha Conta
              </h2>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white mb-1">Integração AniList</p>
                  <p className="text-[10px] text-slate-500 font-medium">Sua conta está sincronizada com a AniList.</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-lg uppercase tracking-widest border border-emerald-500/20">
                  Conectado
                </span>
              </div>
              <div className="h-px bg-white/5"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white mb-1">Email de Notificações</p>
                  <p className="text-[10px] text-slate-500 font-medium">Receba alertas sobre novos episódios.</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Player */}
          <section className="bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/5">
              <h2 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-3">
                <i className="fa-solid fa-play text-blue-500"></i>
                Preferências do Player
              </h2>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white mb-1">Auto-Play</p>
                  <p className="text-[10px] text-slate-500 font-medium">Iniciar próximo episódio automaticamente.</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="h-px bg-white/5"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white mb-1">Qualidade Padrão</p>
                  <p className="text-[10px] text-slate-500 font-medium">Priorizar sempre a melhor qualidade disponível.</p>
                </div>
                <select className="bg-slate-950 border border-white/10 text-[10px] font-black text-white px-3 py-2 rounded-xl outline-none uppercase">
                  <option>4K / Ultra HD</option>
                  <option>Full HD (1080p)</option>
                  <option>HD (720p)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-red-500/5 border border-red-500/10 rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-red-500/10 bg-red-500/5">
              <h2 className="text-[11px] font-black text-red-500 uppercase tracking-widest flex items-center gap-3">
                <i className="fa-solid fa-triangle-exclamation"></i>
                Zona de Perigo
              </h2>
            </div>
            <div className="p-8">
              <button className="px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black rounded-xl transition-all uppercase tracking-widest cursor-pointer border border-red-500/20">
                Desconectar Conta AniList
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
