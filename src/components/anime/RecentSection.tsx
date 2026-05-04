import { AniListAPI } from '@/lib/api';
import Link from 'next/link';
import EpisodeCard from './EpisodeCard';

interface RecentSectionProps {
  page?: number;
}

export default async function RecentSection({ page = 1 }: RecentSectionProps) {
  const { animes, pageInfo } = await AniListAPI.getRecent(page, 20);

  if (!animes || animes.length === 0) return null;

  // Gerar array de páginas para a paginação numerada
  const totalPages = pageInfo?.lastPage || 1;
  const current = pageInfo?.currentPage || 1;
  
  const getPages = () => {
    const pages = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) {
      if (i > 0 && i <= totalPages) pages.push(i);
    }
    return pages;
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-circle-play text-blue-500 text-xl"></i>
            <h2 className="text-xl font-bold tracking-tight text-white uppercase tracking-tighter">Últimos Lançamentos</h2>
          </div>
          <Link 
            href="/lista?sort=START_DATE_DESC" 
            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-500 transition-colors flex items-center gap-2 group"
          >
            Ver Todos
            <i className="fa-solid fa-chevron-right group-hover:translate-x-1 transition-transform"></i>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {animes.map((anime, index) => (
            <EpisodeCard key={`recent-${anime.id}-${index}`} anime={anime} />
          ))}
        </div>

        {/* Numbered Pagination Bar - Circle Style */}
        <div className="mt-16 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            {current > 1 && (
              <Link 
                href={`/?page=${current - 1}`}
                scroll={false}
                className="w-10 h-10 flex items-center justify-center bg-slate-900 border border-white/5 text-white/50 hover:text-white hover:border-blue-500/50 hover:scale-110 rounded-full transition-all duration-300"
              >
                <i className="fa-solid fa-chevron-left text-xs"></i>
              </Link>
            )}

            {getPages().map(p => (
              <Link
                key={p}
                href={`/?page=${p}`}
                scroll={false}
                className={`w-10 h-10 flex items-center justify-center rounded-full text-[12px] font-black transition-all duration-300 border ${
                  p === current 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30 scale-110 z-10' 
                    : 'bg-slate-900 border-white/5 text-white/50 hover:bg-slate-800 hover:text-white hover:scale-105'
                }`}
              >
                {p}
              </Link>
            ))}

            {pageInfo?.hasNextPage && (
              <Link 
                href={`/?page=${current + 1}`}
                scroll={false}
                className="w-10 h-10 flex items-center justify-center bg-slate-900 border border-white/5 text-white/50 hover:text-white hover:border-blue-500/50 hover:scale-110 rounded-full transition-all duration-300"
              >
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}



