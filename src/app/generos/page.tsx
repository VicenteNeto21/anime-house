import { AniListAPI } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

const genreIcons: Record<string, string> = {
  'Action': 'fa-fire-flame-curved',
  'Adventure': 'fa-compass',
  'Comedy': 'fa-face-laugh-squint',
  'Drama': 'fa-masks-theater',
  'Fantasy': 'fa-wand-magic-sparkles',
  'Horror': 'fa-ghost',
  'Mahou Shoujo': 'fa-wand-sparkles',
  'Mecha': 'fa-robot',
  'Music': 'fa-music',
  'Mystery': 'fa-magnifying-glass',
  'Psychological': 'fa-brain',
  'Romance': 'fa-heart',
  'Sci-Fi': 'fa-shuttle-space',
  'Slice of Life': 'fa-mug-hot',
  'Sports': 'fa-volleyball',
  'Supernatural': 'fa-bolt',
  'Thriller': 'fa-skull'
};

const gradients = [
  'from-blue-600 to-indigo-600',
  'from-purple-600 to-pink-600',
  'from-orange-600 to-red-600',
  'from-emerald-600 to-teal-600',
  'from-pink-600 to-rose-600',
  'from-cyan-600 to-blue-600'
];

export default async function GenresPage() {
  const genres = await AniListAPI.getGenres();
  const genreMaps = AniListAPI.maps.genres;

  // Buscar estatísticas em lotes de 5 (evita rate limit)
  const topGenres = genres.slice(0, 20);
  const stats: { genre: string; total: number; topMedia: any }[] = [];

  for (let i = 0; i < topGenres.length; i += 5) {
    const batch = topGenres.slice(i, i + 5);
    const batchResults = await Promise.all(
      batch.map(async (genre) => {
        try {
          const data = await AniListAPI.getGenreStats(genre);
          return { genre, ...data };
        } catch {
          return { genre, total: 0, topMedia: null };
        }
      })
    );
    stats.push(...batchResults);
  }

  return (
    <main className="pt-24 pb-20 container mx-auto px-4 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500">
            <i className="fa-solid fa-tags text-2xl"></i>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-white">Gêneros</h1>
            <p className="text-slate-400 text-sm font-medium">Explore as categorias mais populares da nossa biblioteca.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {stats.map((item, index) => {
          const genre = item.genre;
          const translation = genreMaps[genre] || genre;
          const icon = genreIcons[genre] || 'fa-tag';
          const gradient = gradients[index % gradients.length];

          return (
            <Link
              key={genre}
              href={`/lista?genre=${genre}`}
              className="group relative h-40 rounded-[2.5rem] bg-slate-900/50 border border-white/5 hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
              {/* Highlight Background Image */}
              {item.topMedia?.banner && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 scale-110 group-hover:scale-100 transition-transform duration-700">
                  <Image 
                    src={item.topMedia.banner} 
                    alt={genre} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 15vw"
                  />
                </div>
              )}

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-40 transition-opacity duration-500`} />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors duration-500">
                  <i className={`fa-solid ${icon} text-2xl text-white/40 group-hover:text-white transition-all duration-500 group-hover:scale-110`} />
                </div>
                
                <span className="text-[13px] font-black tracking-widest uppercase text-white/80 group-hover:text-white transition-colors">
                  {translation}
                </span>
                
                {item.total > 0 && (
                  <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-400 transition-colors">
                    {item.total.toLocaleString()} Títulos
                  </span>
                )}
              </div>

              {/* Inner border effect */}
              <div className="absolute inset-2 border border-white/5 rounded-[1.8rem] pointer-events-none group-hover:border-white/10 transition-colors" />
            </Link>
          );
        })}
      </div>
    </main>
  );
}
