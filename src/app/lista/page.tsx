import { AniListAPI } from '@/lib/api';
import AnimeCard from '@/components/anime/AnimeCard';
import ListFilters from '@/components/anime/ListFilters';
import Link from 'next/link';
import Image from 'next/image';

export default async function ListPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    genre?: string; 
    sort?: string; 
    page?: string; 
    year?: string; 
    season?: string;
    view?: string;
    search?: string;
    status?: string;
  }>;
}) {
  const { 
    genre, 
    sort = 'TRENDING_DESC', 
    page: pageStr = '1', 
    year, 
    season,
    view = 'grid',
    search,
    status
  } = await searchParams;
  const page = parseInt(pageStr);
  
  // Fallback: Se o season vier com formato de ano (ex: 2024) e o year estiver vazio, usamos como year
  const effectiveYear = year ? parseInt(year) : (season && /^\d{4}$/.test(season) ? parseInt(season) : undefined);
  const effectiveSeason = (season && !/^\d{4}$/.test(season)) ? season : undefined;

  const { media, pageInfo } = await AniListAPI.browse({
    genre,
    sort,
    page,
    year: effectiveYear,
    season: effectiveSeason as any,
    search,
    status: status as any,
    perPage: view === 'list' ? 20 : 30, 
  });

  const genres = await AniListAPI.getGenres();

  const paginationBaseUrl = `/lista?${search ? `search=${search}&` : ''}${genre ? `genre=${genre}&` : ''}${year ? `year=${year}&` : ''}${season ? `season=${season}&` : ''}${status ? `status=${status}&` : ''}sort=${sort}&view=${view}`;

  return (
    <main className="container mx-auto px-4 lg:px-8 py-12">
      {/* Header Section */}
      <div className="flex flex-col gap-10 mb-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
            Lista de Animes
          </h1>
          <p className="text-slate-400 text-sm font-medium">Explore nosso catálogo completo com mais de 10.000 títulos.</p>
        </div>
        
        <ListFilters genres={genres} />
      </div>

      {/* Anime Grid/List */}
      {view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {media.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {media.map((anime) => (
            <Link
              key={anime.id}
              href={`/anime/${anime.id}`}
              className="flex items-center gap-6 p-4 bg-slate-900/40 border border-white/5 rounded-2xl hover:bg-slate-900/80 hover:border-blue-500/30 transition-all group relative overflow-hidden"
            >
              <div className="relative w-24 h-36 md:w-28 md:h-40 flex-shrink-0 rounded-xl overflow-hidden border border-white/10">
                <Image 
                  src={anime.poster} 
                  alt={anime.title} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 15vw"
                />
              </div>
              
              <div className="flex-grow min-w-0 pr-12 md:pr-16">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="px-2 py-0.5 bg-blue-600 text-[9px] font-black rounded uppercase text-white">
                    {anime.format}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-500 text-[10px] font-black">
                    <i className="fa-solid fa-star"></i>
                    <span>{anime.rating}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">{anime.year} • {anime.status}</span>
                </div>
                <h3 className="text-lg md:text-xl font-black text-white group-hover:text-blue-500 transition-colors uppercase tracking-tight truncate mb-2">
                  {anime.title}
                </h3>
                <p className="text-slate-400 text-[13px] line-clamp-3 leading-relaxed font-medium">
                  {anime.description?.replace(/<[^>]*>?/gm, '')}
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  {anime.genres?.slice(0, 4).map(g => (
                    <span key={g} className="text-[9px] font-black uppercase tracking-widest text-slate-600">#{g}</span>
                  ))}
                </div>
              </div>

              {/* Play Button - Fixed Circle */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:scale-110 transition-all shadow-xl group-hover:shadow-blue-600/20">
                  <i className="fa-solid fa-play text-white text-xs ml-1"></i>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}


      {/* Pagination */}
      <div className="mt-20 flex items-center justify-center gap-2">
        {page > 1 && (
          <Link
            href={`${paginationBaseUrl}&page=${page - 1}`}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900 border border-white/5 text-white/50 hover:text-white transition-all"
          >
            <i className="fa-solid fa-chevron-left text-xs"></i>
          </Link>
        )}

        {Array.from({ length: Math.min(5, pageInfo.lastPage || 5) }, (_, i) => {
          let p = page - 2 + i;
          if (page <= 2) p = i + 1;
          if (pageInfo.lastPage && p > pageInfo.lastPage) return null;
          if (p <= 0) return null;
          
          return (
            <Link
              key={p}
              href={`${paginationBaseUrl}&page=${p}`}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold transition-all border ${
                p === page 
                  ? 'bg-blue-600 text-white border-blue-500' 
                  : 'bg-slate-900 border-white/5 text-white/50 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {p}
            </Link>
          );
        })}

        {pageInfo.hasNextPage && (
          <Link
            href={`${paginationBaseUrl}&page=${page + 1}`}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900 border border-white/5 text-white/50 hover:text-white transition-all"
          >
            <i className="fa-solid fa-chevron-right text-xs"></i>
          </Link>
        )}
      </div>
    </main>
  );
}
