import { Suspense } from 'react';
import RecentSection from '@/components/anime/RecentSection';
import TopRanking from '@/components/anime/TopRanking';
import ContinueWatching from '@/components/anime/ContinueWatching';
import CalendarSection from '@/components/anime/CalendarSection';
import { AniListAPI } from '@/lib/api';
import AnimeCard from '@/components/anime/AnimeCard';
import NewsSection from '@/components/anime/NewsSection';

export const revalidate = 3600; // Cache ISR por 1 hora para TTFB ultra-rápido no Edge CDN

function SectionSkeleton() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 animate-pulse">
      <div className="h-6 w-48 bg-slate-800 rounded mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] bg-slate-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function TrendingTopSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="aspect-[2/3] bg-slate-800/60 rounded-xl" />
      ))}
    </div>
  );
}

async function TrendingTopGrid() {
  const trending = (await AniListAPI.getTrending(18))
    .filter((anime) => anime.status !== 'Finalizado')
    .slice(0, 6);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
      {trending.map((anime, index) => (
        <AnimeCard key={anime.id} anime={anime} priority={index < 6} />
      ))}
    </div>
  );
}

export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const currentPage = parseInt(page || '1', 10);

  return (
    <div className="flex flex-col min-h-screen pt-4">
      <section className="container mx-auto px-4 lg:px-8 mb-8">
        <Suspense fallback={<TrendingTopSkeleton />}>
          <TrendingTopGrid />
        </Suspense>
      </section>

      <Suspense fallback={<SectionSkeleton />}>
        <CalendarSection />
      </Suspense>

      <div className="space-y-4 pb-20">
        <ContinueWatching />

        <Suspense fallback={<SectionSkeleton />}>
          <RecentSection page={currentPage} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <NewsSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <TopRanking />
        </Suspense>
      </div>
    </div>
  );
}
