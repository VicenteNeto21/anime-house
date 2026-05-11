import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

export default function AnimeDetailsLoading() {
  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Banner Skeleton */}
      <div className="relative h-[40vh] md:h-[60vh] w-full bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 -mt-32 md:-mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* Sidebar Skeleton */}
          <div className="w-full md:w-72 shrink-0 space-y-6">
            <Skeleton className="aspect-[2/3] w-full shadow-2xl" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
            </div>
            <div className="space-y-4 pt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-1/3" variant="text" />
                  <Skeleton className="h-5 w-full" variant="text" />
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-grow pt-4">
            <div className="mb-8 space-y-4">
              <Skeleton className="h-12 w-3/4" variant="text" />
              <div className="flex gap-3">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>

            {/* Sections Skeletons */}
            <div className="space-y-12">
              <section className="space-y-6">
                 <Skeleton className="h-6 w-48 rounded-lg" />
                 <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="aspect-[16/9] rounded-xl" />
                    ))}
                 </div>
              </section>

              <section className="space-y-6">
                 <Skeleton className="h-6 w-48 rounded-lg" />
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-slate-900/40 p-4 rounded-2xl flex items-center gap-4">
                        <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
                        <div className="space-y-2 flex-grow">
                          <Skeleton className="h-4 w-3/4" variant="text" />
                          <Skeleton className="h-3 w-1/2" variant="text" />
                        </div>
                      </div>
                    ))}
                 </div>
              </section>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
