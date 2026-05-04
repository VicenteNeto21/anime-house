import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="text-center z-10 max-w-lg">
        {/* Animated Icon Container */}
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
          <div className="relative w-32 h-32 md:w-40 md:h-40 bg-slate-900 border border-white/5 rounded-full flex items-center justify-center shadow-2xl">
            <i className="fa-solid fa-ghost text-5xl md:text-6xl text-blue-500 animate-bounce"></i>
          </div>
          {/* 404 Badge */}
          <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl border border-white/10">
            Erro 404
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
          Você se <span className="text-blue-500">perdeu</span>?
        </h1>
        
        <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed mb-10 max-w-md mx-auto">
          Parece que você usou o Shunshin no Jutsu para o lugar errado. A página que você procura não existe ou foi movida para outra dimensão.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/"
            className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl uppercase text-[11px] tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3"
          >
            <i className="fa-solid fa-house text-sm"></i>
            Voltar ao Início
          </Link>
          
          <Link 
            href="/lista"
            className="w-full sm:w-auto px-10 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl uppercase text-[11px] tracking-[0.2em] transition-all border border-white/5 flex items-center justify-center gap-3"
          >
            <i className="fa-solid fa-magnifying-glass text-sm text-slate-500"></i>
            Explorar Animes
          </Link>
        </div>

        {/* Easter Egg / Small Text */}
        <p className="mt-16 text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">
          Até o Zoro chegaria aqui eventualmente.
        </p>
      </div>
    </main>
  );
}
