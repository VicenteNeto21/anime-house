import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden px-4">
      {/* Background Decorativo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        <div className="inline-block mb-8">
          <span className="text-[120px] md:text-[180px] font-black leading-none text-white/5 uppercase tracking-tighter select-none">
            404
          </span>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
             <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">
               Ops! <span className="text-blue-600">Perdido?</span>
             </h1>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-md mx-auto">
            Parece que esse anime (ou página) foi para outra dimensão ou ainda não foi lançado.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link 
              href="/" 
              className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95"
            >
              Voltar para a Home
            </Link>
            <Link 
              href="/noticias" 
              className="px-10 py-4 bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:border-blue-500/30 font-black uppercase text-xs tracking-widest rounded-2xl transition-all active:scale-95"
            >
              Ver Notícias
            </Link>
          </div>
        </div>

        {/* Mensagem Divertida */}
        <p className="mt-20 text-[10px] font-bold text-slate-700 uppercase tracking-[0.3em]">
          Erro de Transmissão Detectado no Servidor de Konoha
        </p>
      </div>
    </main>
  );
}
