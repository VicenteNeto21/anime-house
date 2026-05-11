import React from 'react';
import { NewsCardSkeleton } from '@/components/ui/Skeleton';

export default function NewsLoading() {
  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        {/* Header Skeleton */}
        <header className="mb-12 border-b border-white/5 pb-12 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full" />
            <div className="h-3 w-40 bg-slate-800/50 animate-pulse rounded-full" />
          </div>
          <div className="h-12 w-3/4 bg-slate-800/50 animate-pulse rounded-2xl" />
          <div className="h-6 w-1/2 bg-slate-800/30 animate-pulse rounded-xl" />
        </header>

        {/* Grid de Notícias Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(9)].map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
