export default function LoadingHome() {
  return (
    <div className="flex flex-col min-h-screen pt-4 bg-slate-950">
      {/* Top Highlights Grid Skeleton */}
      <section className="container mx-auto px-4 lg:px-8 mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-slate-900 rounded-2xl animate-pulse border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
              <div className="absolute bottom-3 left-3 w-3/4 h-4 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </section>

      {/* Calendar Section Skeleton */}
      <section className="bg-slate-900/40 border-y border-white/5 py-6 mb-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex gap-2 overflow-hidden">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-1 h-14 bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>

      {/* Recent / Top Ranking Skeletons */}
      <div className="space-y-12 pb-20 container mx-auto px-4 lg:px-8">
        <div className="space-y-4">
          <div className="h-6 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-slate-900 rounded-2xl animate-pulse border border-white/5" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
