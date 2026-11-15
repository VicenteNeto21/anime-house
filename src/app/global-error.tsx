'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-slate-950 text-white min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full text-center flex flex-col items-center gap-6 p-8 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
            Erro Crítico no Sistema
          </h2>
          <p className="text-slate-400 text-xs">
            Houve uma falha inesperada na aplicação. Clique abaixo para recarregar.
          </p>
          <button
            onClick={() => reset()}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
          >
            Recarregar aplicação
          </button>
        </div>
      </body>
    </html>
  );
}
