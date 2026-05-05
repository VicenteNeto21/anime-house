export default function LoadingList() {
  return (
    <main className="container mx-auto px-4 lg:px-8 py-12 bg-slate-950 min-h-screen">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-10 mb-12">
        <div className="flex flex-col gap-3">
          <div className="w-48 h-8 bg-slate-800 rounded-lg animate-pulse"></div>
          <div className="w-96 h-4 bg-slate-800 rounded animate-pulse"></div>
        </div>
        
        {/* Filters Skeleton */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-24 h-10 bg-slate-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
          <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
            <div className="w-10 h-10 bg-slate-800 rounded-xl animate-pulse"></div>
            <div className="w-10 h-10 bg-slate-800 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {[...Array(18)].map((_, i) => (
          <div key={i} className="aspect-[2/3] bg-slate-900 rounded-2xl animate-pulse border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 space-y-2">
              <div className="w-3/4 h-3 bg-slate-800 rounded"></div>
              <div className="w-1/2 h-2 bg-slate-800 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
