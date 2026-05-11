import Link from 'next/link';
import { NewsAPI } from '@/lib/api';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata = {
  title: 'Portal de Notícias | Anime House',
  description: 'Fique por dentro das últimas novidades, lançamentos e curiosidades do mundo dos animes.',
};

export default async function NoticiasPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string }> 
}) {
  const { page } = await searchParams;
  const currentPage = parseInt(page || '1');
  const limit = 12;
  
  const { news, totalResults } = await NewsAPI.getLatestNews(currentPage, limit);
  const totalPages = Math.ceil(totalResults / limit);

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <Breadcrumbs items={[{ label: 'Notícias' }]} />
        
        {/* Header da Página */}
        <header className="mb-12 border-b border-white/5 pb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">
              Atualizado em Tempo Real
            </p>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
            Portal de <span className="text-blue-600">Notícias</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium max-w-2xl">
            Acompanhe as principais manchetes, trailers e anúncios que agitam a comunidade otaku global.
          </p>
        </header>

        {/* Grid de Notícias */}
        {news.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item) => (
                <a 
                  key={item.id} 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex flex-col bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all shadow-xl hover:shadow-blue-500/5 backdrop-blur-sm"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
                      {item.category}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {item.date}
                      </span>
                      <span className="w-1 h-1 bg-slate-700 rounded-full" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Por: Mundo dos Otakus
                      </span>
                    </div>
                    
                    <h2 className="text-lg md:text-xl font-black text-white leading-tight mb-4 group-hover:text-blue-400 transition-colors line-clamp-2">
                      {item.title}
                    </h2>
                    
                    <p className="text-sm text-slate-400 font-medium mb-6 line-clamp-3 leading-relaxed">
                      {item.excerpt}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                        Ler matéria completa
                      </span>
                      <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <i className="fa-solid fa-chevron-right text-xs"></i>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Paginação */}
            <div className="mt-16 flex items-center justify-center gap-4">
              {currentPage > 1 && (
                <Link 
                  href={`/noticias?page=${currentPage - 1}`}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-blue-500 transition-all"
                >
                  <i className="fa-solid fa-arrow-left"></i> Anterior
                </Link>
              )}
              
              <div className="flex items-center gap-2">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1; // Simplificado para demonstração, ideal é lógica de sliding window
                  return (
                    <Link 
                      key={pageNum}
                      href={`/noticias?page=${pageNum}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${currentPage === pageNum ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-900 text-slate-500 hover:text-white border border-white/5'}`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
              </div>

              {currentPage < totalPages && (
                <Link 
                  href={`/noticias?page=${currentPage + 1}`}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-blue-500 transition-all"
                >
                  Próximo <i className="fa-solid fa-arrow-right"></i>
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <i className="fa-solid fa-newspaper text-6xl text-slate-800 mb-6"></i>
            <p className="text-slate-500 font-bold uppercase tracking-widest">Nenhuma notícia encontrada.</p>
          </div>
        )}

        {/* Newsletter Section */}
        <div className="mt-20 p-12 bg-blue-600/5 border border-blue-600/10 rounded-3xl text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
             <i className="fa-solid fa-newspaper text-8xl text-blue-600"></i>
           </div>
           <h3 className="text-2xl font-black text-white uppercase mb-4 tracking-tighter">Receba as novidades por e-mail</h3>
           <p className="text-slate-400 max-w-md mx-auto mb-8 text-sm">
             Inscreva-se para receber um resumo semanal das notícias mais importantes do mundo dos animes.
           </p>
           <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
             <input 
               type="email" 
               placeholder="seu@email.com" 
               className="flex-grow px-6 py-3 bg-slate-950 border border-white/10 rounded-2xl text-sm focus:border-blue-500 outline-none transition-all"
             />
             <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-600/20">
               Inscrever
             </button>
           </div>
        </div>
      </div>
    </main>
  );
}
