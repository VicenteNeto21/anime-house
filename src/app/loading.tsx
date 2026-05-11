import React from 'react';
import { AnimeCardSkeleton, NewsCardSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen pt-4 pb-20">
      {/* Top Highlights Skeleton */}
      <section className="container mx-auto px-4 lg:px-8 mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <AnimeCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Generic Spacer for Calendar */}
      <div className="container mx-auto px-4 lg:px-8 mb-12">
        <div className="h-12 w-48 bg-slate-800/30 animate-pulse rounded-2xl" />
      </div>

      {/* Recent Releases Skeleton */}
      <section className="container mx-auto px-4 lg:px-8 space-y-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full animate-pulse" />
            <div className="h-6 w-64 bg-slate-800/50 animate-pulse rounded-lg" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {[...Array(12)].map((_, i) => (
              <AnimeCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* News Skeleton */}
        <div className="space-y-6 pt-12">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full animate-pulse" />
            <div className="h-6 w-48 bg-slate-800/50 animate-pulse rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <NewsCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
