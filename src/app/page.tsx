import RecentSection from '@/components/anime/RecentSection';
import TopRanking from '@/components/anime/TopRanking';
import ContinueWatching from '@/components/anime/ContinueWatching';
import CalendarSection from '@/components/anime/CalendarSection';
import { AniListAPI } from '@/lib/api';
import AnimeCard from '@/components/anime/AnimeCard';

export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const currentPage = parseInt(page || '1');
  const trending = await AniListAPI.getTrending(6);


  return (
    <div className="flex flex-col min-h-screen pt-4">
      {/* Top Highlights Grid - O Antigo "Header" */}
      <section className="container mx-auto px-4 lg:px-8 mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {trending.map((anime, index) => (
            <AnimeCard key={anime.id} anime={anime} priority={index < 6} />
          ))}
        </div>
      </section>

      {/* Calendar Section */}
      <CalendarSection />

      <div className="space-y-4 pb-20">
        <ContinueWatching />
        <RecentSection page={currentPage} />

        <TopRanking />
      </div>
    </div>
  );
}
