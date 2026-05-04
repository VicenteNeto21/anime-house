import { AniListAPI } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import TrailerButton from '@/components/anime/TrailerButton';
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
      <div className="relative w-full h-[40vh] md:h-[60vh] overflow-hidden">
        <Image
          src={anime.banner || anime.poster}
          alt={anime.title}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40 blur-[2px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 lg:px-8 pb-12 flex flex-col md:flex-row gap-8 items-center md:items-end">
            {/* Poster Card */}
            <div className="relative w-48 h-72 md:w-64 md:h-96 flex-shrink-0 rounded-2xl overflow-hidden border-4 border-slate-950 -mb-20 md:mb-0 z-10 shadow-2xl">
              <Image src={anime.poster} alt={anime.title} fill className="object-cover" priority sizes="(max-width: 768px) 192px, 256px" />
            </div>

            {/* Info Overlay */}
            <div className="flex-grow text-center md:text-left z-10 pb-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-600 text-[10px] font-black rounded-lg uppercase tracking-widest text-white">
                  {anime.format}
                </span>
                <span className="px-3 py-1 bg-slate-800 text-[10px] font-black rounded-lg uppercase tracking-widest text-slate-300 border border-white/5">
                  {anime.year}
                </span>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-lg border border-yellow-500/20">
                  <i className="fa-solid fa-star text-[10px]"></i>
                  <span className="text-[11px] font-black">{anime.rating}</span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
                {anime.title}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Link
                  href={`/player/${AniListAPI.slugify(anime.title)}/1`}
                  className="flex items-center gap-3 px-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white font-black uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20"
                >
                  <i className="fa-solid fa-play"></i>
                  Assistir Agora
                </Link>

                {anime.trailer?.site === 'youtube' && (
                  <TrailerButton trailerId={anime.trailer.id} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-20 md:py-12">
        <div className="grid lg:grid-cols-4 gap-12">
          
          {/* Sidebar (Agora na Esquerda) */}
          <div className="order-2 lg:order-1 space-y-8">
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-8 sticky top-24 z-20">
              <div className="mb-8 pb-8 border-b border-white/5">
                <AddToList 
                  animeId={Number(id)} 
                  totalEpisodes={Number(anime.episodesReleased) || Number(anime.episodes)} 
                />
              </div>

              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">Informações</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-2">Estúdio</label>
                  <p className="text-xs font-bold text-slate-300">
                    {anime.studios && anime.studios.length > 0 ? anime.studios.join(', ') : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-2">Temporada</label>
                  <p className="text-xs font-bold text-slate-300 uppercase">{anime.season} {anime.year}</p>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-2">Formato</label>
                  <p className="text-xs font-bold text-slate-300">{anime.format}</p>
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
                animeId={Number(id)} 
                animeTitle={anime.title}
                totalEpisodes={Number(anime.episodesReleased) || Number(anime.episodes) || 1} 
                streamingEpisodes={anime.streamingEpisodes}
              />
            </section>

            {/* 2. Voice Actors Section (Segundo) */}
            {anime.characters && anime.characters.length > 0 && (
              <section>
                <h2 className="text-xl font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  Dubladores & Personagens
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {anime.characters.map((char: any, i: number) => (
                    <div key={i} className="flex flex-col bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden group hover:border-blue-500/30 transition-all">
                      {/* Character Info */}
                      <div className="flex items-center gap-3 p-3 border-b border-white/5">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={char.image} alt={char.name} fill className="object-cover" sizes="40px" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[10px] font-black text-white uppercase truncate">{char.name}</h4>
                          <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">{char.role}</p>
                        </div>
                      </div>
                      
                      {/* Voice Actor Info */}
                      {char.voiceActor && (
                        <div className="flex items-center justify-end gap-3 p-3 bg-white/[0.02]">
                          <div className="min-w-0 text-right">
                            <h4 className="text-[10px] font-black text-slate-300 uppercase truncate group-hover:text-white transition-colors">{char.voiceActor.name}</h4>
                            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Dublador</p>
                          </div>
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                            <Image src={char.voiceActor.image} alt={char.voiceActor.name} fill className="object-cover grayscale group-hover:grayscale-0 transition-all" sizes="40px" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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
