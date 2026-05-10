import { AniListAPI } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import TrailerButton from '@/components/anime/TrailerButton';
import FavoriteButton from '@/components/anime/FavoriteButton';
import AddToList from '@/components/anime/AddToList';
import EpisodeList from '@/components/anime/EpisodeList';

export default async function AnimeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const anime = await AniListAPI.getDetails(id);

  if (!anime) return <div>Anime não encontrado.</div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Hero Banner Section */}
      {/* Hero Banner Section */}
      <div className="relative w-full min-h-[60vh] md:h-[65vh] flex items-end overflow-hidden">
        {/* Background Image & Gradient */}
        <div className="absolute inset-0">
          <Image
            src={anime.banner || anime.poster}
            alt={anime.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30 blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 w-full container mx-auto px-4 lg:px-8 pt-24 pb-8 md:pb-12 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end text-center md:text-left">
          
          {/* Poster Card (Hidden on very small screens, visible from sm up or just smaller) */}
          <div className="relative w-32 h-48 md:w-64 md:h-96 flex-shrink-0 rounded-2xl overflow-hidden border-2 md:border-4 border-slate-950 shadow-2xl z-20">
              <Image src={anime.poster} alt={anime.title} fill className="object-cover" priority sizes="(max-width: 768px) 128px, 256px" />
            </div>

            {/* Info Overlay */}
            <div className="flex-grow z-10">
              <div className="flex flex-col gap-1 mb-4 items-center md:items-start">
                <span className="text-[10px] md:text-xs font-black text-blue-500 uppercase tracking-[0.4em] mb-1">
                  {anime.titleNative || anime.titleRomaji}
                </span>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
                  <span className="px-2.5 py-1 bg-blue-600 text-[9px] md:text-[10px] font-black rounded-lg uppercase tracking-widest text-white shadow-lg">
                    {anime.format}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-[9px] md:text-[10px] font-black rounded-lg uppercase tracking-widest text-slate-300 border border-white/10">
                    {anime.year}
                  </span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 text-yellow-500 rounded-lg border border-yellow-500/20 backdrop-blur-md">
                    <i className="fa-solid fa-star text-[9px]"></i>
                    <span className="text-[10px] md:text-[11px] font-black">{anime.rating}</span>
                  </div>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter mb-8 leading-tight max-w-4xl">
                {anime.title}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
                <Link
                  href={`/player/${AniListAPI.slugify(anime.title)}/1`}
                  className="flex-grow sm:flex-grow-0 h-14 flex items-center justify-center gap-3 px-10 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white font-black uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95"
                >
                  <i className="fa-solid fa-play"></i>
                  Assistir Agora
                </Link>

                {anime.trailer?.site === 'youtube' && (
                  <TrailerButton trailerId={anime.trailer.id} title={anime.title} />
                )}

                <FavoriteButton 
                  animeId={Number(anime.id)} 
                  initialIsFavourite={anime.isFavourite} 
                />
              </div>

              {anime.description && (
                <p className="hidden md:block text-slate-400 text-sm font-medium leading-relaxed max-w-2xl line-clamp-2 opacity-80 italic">
                  "{anime.description.replace(/<[^>]*>?/gm, '').slice(0, 180)}..."
                </p>
              )}
            </div>
          </div>
        </div>

      <div className="container mx-auto px-4 lg:px-8 py-16 md:py-12">
        <div className="grid lg:grid-cols-4 gap-12">
          
          {/* Sidebar (Agora na Esquerda) */}
          <div className="order-2 lg:order-1 space-y-8">
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-8 sticky top-24 z-20">
              <div className="mb-8 pb-8 border-b border-white/5">
                <AddToList 
                  animeId={Number(anime.id)} 
                  totalEpisodes={Number(anime.episodesReleased) || Number(anime.episodes)} 
                />
              </div>

              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">Informações</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 pb-6 border-b border-white/5">
                  <div className="bg-slate-800/40 rounded-2xl p-3 border border-white/5">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Popularidade</label>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-fire text-orange-500 text-[10px]"></i>
                      <p className="text-xs font-black text-white">{anime.popularity?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="bg-slate-800/40 rounded-2xl p-3 border border-white/5">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Favoritos</label>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-heart text-red-500 text-[10px]"></i>
                      <p className="text-xs font-black text-white">{anime.favorites?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-2">Estúdio</label>
                  <p className="text-xs font-black text-blue-400">
                    {anime.studios && anime.studios.length > 0 ? anime.studios.join(', ') : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-2">Temporada</label>
                  <p className="text-xs font-bold text-slate-300 uppercase">{anime.season} {anime.year}</p>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-2">Episódios</label>
                  <p className="text-xs font-bold text-slate-300">{anime.episodes || '??'}</p>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-2">Status</label>
                  <p className="text-xs font-bold text-emerald-500">{anime.status}</p>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-2">Gêneros</label>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres?.map(g => (
                      <Link 
                        key={g} 
                        href={`/lista?genre=${g}`}
                        className="px-2 py-1 bg-slate-800 hover:bg-blue-600 rounded-md text-[9px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest"
                      >
                        {g}
                      </Link>
                    ))}
                  </div>
                </div>

                {anime.tags && anime.tags.length > 0 && (
                  <div>
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-2">Temas e Tags</label>
                    <div className="flex flex-wrap gap-1.5">
                      {anime.tags.map(t => (
                        <span 
                          key={t} 
                          className="px-2 py-1 border border-white/5 text-slate-500 text-[8px] font-bold uppercase rounded-md"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content (Agora na Direita) */}
          <div className="order-1 lg:order-2 lg:col-span-3 space-y-16">
            
            {/* 1. Episodes List (Primeiro) */}
            <section id="episodes">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  Episódios
                </h2>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">
                  {anime.episodes || '??'} no Total
                </span>
              </div>
              <EpisodeList 
                animeId={Number(anime.id)} 
                animeTitle={anime.title}
                totalEpisodes={Number(anime.episodesReleased) || Number(anime.episodes) || 1} 
                streamingEpisodes={anime.streamingEpisodes}
              />
            </section>
            
            {/* 2. Continuity / Seasons (Novo) */}
            {anime.relations && anime.relations.length > 0 && (
              <section id="seasons">
                <h2 className="text-xl font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  Continuidade e Temporadas
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {anime.relations.map((rel: any) => {
                    const relationLabels: Record<string, string> = {
                      'SEQUEL': 'Sequência',
                      'PREQUEL': 'Prequela',
                      'SIDE_STORY': 'Paralelo',
                      'SPIN_OFF': 'Spin-off',
                      'ALTERNATIVE': 'Alternativo',
                      'PARENT': 'Principal',
                      'SUMMARY': 'Resumo'
                    };
                    return (
                      <Link 
                        key={rel.id} 
                        href={`/anime/${rel.id}`}
                        className="group relative flex flex-col gap-3"
                      >
                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 group-hover:border-blue-500/50 transition-all duration-500 shadow-xl bg-slate-900">
                          <Image 
                            src={rel.poster} 
                            alt={rel.title} 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-700" 
                            sizes="(max-width: 768px) 50vw, 200px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                          <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest text-white shadow-lg z-10">
                            {relationLabels[rel.relationType] || rel.relationType}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-white text-[10px] font-black uppercase tracking-tight line-clamp-1 group-hover:text-blue-400 transition-colors">{rel.title}</h4>
                          <p className="text-slate-500 text-[8px] font-bold uppercase mt-1">{rel.format} • {rel.year}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 3. Characters & Voice Actors (Novo) */}
            {anime.characters && anime.characters.length > 0 && (
              <section className="mb-16">
                <h2 className="text-xl font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  Personagens e Elenco
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {anime.characters.map((char, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-lg hover:shadow-blue-500/5">
                      {/* Character Info */}
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/10 shadow-md">
                          <img src={char.image} alt={char.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white truncate max-w-[120px]">{char.name}</h4>
                          <span className="text-[9px] font-black uppercase text-blue-500 tracking-widest">{char.role === 'MAIN' ? 'Protagonista' : 'Suporte'}</span>
                        </div>
                      </div>

                      {/* Voice Actor Info */}
                      {char.voiceActor && (
                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <h4 className="text-[10px] font-bold text-slate-300 truncate max-w-[100px]">{char.voiceActor.name}</h4>
                            <span className="text-[8px] font-medium text-slate-500 uppercase">Dublador JP</span>
                          </div>
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity">
                            <img src={char.voiceActor.image} alt={char.voiceActor.name} className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. Synopsis (Último) */}
            <section>
              <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                Sinopse
              </h2>
              <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8">
                <p className="text-slate-400 text-base leading-relaxed font-medium">
                  {anime.description?.replace(/<[^>]*>?/gm, '')}
                </p>
              </div>
            </section>

            {/* 4. Recommendations (Novo) */}
            {anime.recommendations && anime.recommendations.length > 0 && (
              <section>
                <h2 className="text-xl font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  Você também pode gostar
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {anime.recommendations.slice(0, 10).map((rec: any) => (
                    <Link 
                      key={rec.id} 
                      href={`/anime/${rec.id}`}
                      className="group relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/50 transition-all duration-500 hover:-translate-y-2 shadow-2xl bg-slate-900"
                    >
                      <Image 
                        src={rec.poster} 
                        alt={rec.title} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.8] group-hover:brightness-100" 
                        sizes="(max-width: 768px) 50vw, 200px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className="text-white text-[10px] font-black uppercase tracking-tight line-clamp-2">{rec.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
