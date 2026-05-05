export default function LoadingAnimeDetails() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Hero Banner Skeleton */}
      <div className="relative w-full min-h-[60vh] md:h-[65vh] flex items-end overflow-hidden bg-slate-900 animate-pulse border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        {/* Content Overlay */}
        <div className="relative z-10 w-full container mx-auto px-4 lg:px-8 pt-24 pb-8 md:pb-12 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end text-center md:text-left">
          
          {/* Poster Card Skeleton */}
          <div className="relative w-32 h-48 md:w-64 md:h-96 flex-shrink-0 rounded-2xl bg-slate-800 border-2 md:border-4 border-slate-950 shadow-2xl z-20"></div>

          {/* Info Overlay Skeleton */}
          <div className="flex-grow z-10 w-full flex flex-col items-center md:items-start">
            <div className="flex gap-2 md:gap-3 mb-4">
              <div className="w-16 h-6 bg-slate-800 rounded-lg"></div>
              <div className="w-12 h-6 bg-slate-800 rounded-lg"></div>
              <div className="w-14 h-6 bg-slate-800 rounded-lg"></div>
            </div>
            
            <div className="w-3/4 h-10 md:h-16 bg-slate-800 rounded-xl mb-6"></div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-48 h-12 bg-blue-600/50 rounded-2xl"></div>
              <div className="w-full sm:w-36 h-12 bg-slate-800 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-16 md:py-12">
        <div className="grid lg:grid-cols-4 gap-12">
          
          {/* Sidebar Skeleton */}
          <div className="order-2 lg:order-1 space-y-8">
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-8 sticky top-24">
              <div className="w-full h-12 bg-slate-800 rounded-xl mb-8 animate-pulse"></div>
              <div className="w-32 h-4 bg-slate-800 rounded mb-6 animate-pulse"></div>
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <div className="w-16 h-3 bg-slate-800/50 rounded mb-2 animate-pulse"></div>
                    <div className="w-full h-4 bg-slate-800 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="order-1 lg:order-2 lg:col-span-3 space-y-16">
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="w-32 h-6 bg-slate-800 rounded animate-pulse"></div>
                <div className="w-24 h-6 bg-slate-800 rounded-lg animate-pulse"></div>
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="aspect-square bg-slate-900 border border-white/5 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </section>
            
            <section>
              <div className="w-48 h-6 bg-slate-800 rounded mb-8 animate-pulse"></div>
              <div className="space-y-2">
                <div className="w-full h-4 bg-slate-900 rounded animate-pulse"></div>
                <div className="w-full h-4 bg-slate-900 rounded animate-pulse"></div>
                <div className="w-3/4 h-4 bg-slate-900 rounded animate-pulse"></div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
