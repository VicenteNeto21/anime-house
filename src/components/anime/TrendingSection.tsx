import { AniListAPI } from '@/lib/api';
import AnimeCard from './AnimeCard';

export default async function TrendingSection() {
  const trendingAnimes = await AniListAPI.getTrending(6);

  if (!trendingAnimes || trendingAnimes.length === 0) return null;

  return (
    <section className="py-10">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
            <h2 className="text-2xl font-black uppercase tracking-tighter">Em Alta</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {trendingAnimes.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </div>
    </section>
  );
}
