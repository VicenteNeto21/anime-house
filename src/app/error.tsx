'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-6 p-8 bg-slate-900/60 border border-white/5 rounded-3xl backdrop-blur-xl shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
          <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
        </div>

        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">
            Ocorreu um imprevisto
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            Não foi possível carregar este conteúdo no momento. Nossos sistemas já registraram o evento.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-white/5 active:scale-95"
          >
            Página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
