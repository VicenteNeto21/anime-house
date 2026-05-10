import { AniListAPI, Anime } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default async function TopRanking() {
  const { media: topAnimes } = await AniListAPI.browse({ 
    sort: 'SCORE_DESC', 
    perPage: 10 
  });

  if (!topAnimes || topAnimes.length === 0) return null;

  // Split into odd and even for the two-column layout in desktop
  const leftCol = topAnimes.filter((_, i) => i % 2 === 0);
  const rightCol = topAnimes.filter((_, i) => i % 2 !== 0);

  const renderItem = (anime: Anime, index: number, isRight: boolean) => {
    const rank = isRight ? (index * 2) + 2 : (index * 2) + 1;
    const rankColor = rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-slate-200' : rank === 3 ? 'text-orange-500' : 'text-slate-500';
    
    return (
      <Link
        key={anime.id}
        href={`/anime/${anime.id}`}
        className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-900/40 border border-white/5 hover:bg-slate-900/80 hover:border-blue-500/30 transition-all group w-full"
      >
        <div className={`text-xl font-black ${rankColor} w-10 text-center italic`}>#{rank}</div>
        
        <div className="relative w-12 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-white/10 bg-slate-800">
          <Image 
            src={anime.poster} 
            alt={anime.title} 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>

        <div className="flex-grow min-w-0">
          <h4 className="text-[13px] font-bold text-white line-clamp-1 group-hover:text-blue-400 transition-colors uppercase tracking-tight">
            {anime.title}
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1 text-yellow-500 text-[9px] font-black uppercase">
              <i className="fa-solid fa-star text-[8px]"></i>
              <span>{anime.rating}</span>
            </div>
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">
              {anime.format} • {anime.year}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-800/50 border border-white/5 group-hover:bg-blue-600 transition-colors">
          <i className="fa-solid fa-chevron-right text-[10px] text-white/50 group-hover:text-white"></i>
        </div>
      </Link>
    );
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-trophy text-yellow-500 text-xl"></i>
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">Ranking Global</h2>
            <span className="px-2 py-0.5 bg-slate-800 text-[8px] font-black text-slate-400 rounded uppercase border border-white/5 tracking-widest ml-2">
              AniList Score
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            {leftCol.map((anime, i) => renderItem(anime, i, false))}
          </div>
          <div className="flex flex-col gap-4">
            {rightCol.map((anime, i) => renderItem(anime, i, true))}
          </div>
        </div>
      </div>
    </section>
  );
}
