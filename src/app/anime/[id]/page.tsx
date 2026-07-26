import { AniListAPI } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import TrailerButton from '@/components/anime/TrailerButton';
import FavoriteButton from '@/components/anime/FavoriteButton';
import AddToList from '@/components/anime/AddToList';
import EpisodeList from '@/components/anime/EpisodeList';
import { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

// 1. Metadata Dinâmico para SEO (Google Busca)
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const anime = await AniListAPI.getDetails(id);

  if (!anime) return { title: 'Anime não encontrado | Anime House' };

  return {
    title: `${anime.title} - Guia de Episódios e Informações | Anime House`,
    description: `Tudo sobre ${anime.title}. ${anime.description?.substring(0, 150).replace(/<[^>]*>/g, '')}... Confira sinopse, guia de episódios, elenco, equipe técnica e muito mais no melhor portal de animes.`,
    openGraph: {
      title: anime.title,
      description: anime.description?.substring(0, 160).replace(/<[^>]*>/g, ''),
      images: [anime.banner || anime.poster],
      type: 'video.tv_show',
    }
  };
}

export default async function AnimeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const anime = await AniListAPI.getDetails(id);

  if (!anime) return <div>Anime não encontrado.</div>;

  // 2. Dados Estruturados (Schema.org) para o Robô do Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "name": anime.title,
    "image": anime.poster,
    "description": anime.description?.replace(/<[^>]*>/g, ''),
    "genre": anime.genres,
    "numberOfEpisodes": anime.episodes,
    "status": anime.status === 'Em Lançamento' ? 'Continuing' : 'Finished',
    "author": anime.studios?.map(s => ({ "@type": "Organization", "name": s })),
    "aggregateRating": anime.rating !== 'N/A' ? {
      "@type": "AggregateRating",
      "ratingValue": anime.rating,
      "bestRating": "10",
      "worstRating": "1",
      "ratingCount": anime.popularity || 100
    } : undefined,
    "actor": anime.characters?.slice(0, 5).map(c => ({
      "@type": "PerformanceRole",
      "actor": { "@type": "Person", "name": c.voiceActor?.name || 'Dublador' },
      "characterName": c.name
    }))
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
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
              <Breadcrumbs items={[{ label: 'Animes', href: '/lista' }, { label: anime.title }]} />
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
                  href={`/player/${anime.id}-${AniListAPI.slugify(anime.title)}/1`}
                  className="flex-grow sm:flex-grow-0 h-14 flex items-center justify-center gap-3 px-10 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white font-black uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95"
                >
                  <i className="fa-solid fa-list"></i>
                  Guia de Episódios
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
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-2">Fonte Original</label>
                  <p className="text-xs font-bold text-slate-300 uppercase">{anime.source}</p>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-2">Duração</label>
                  <p className="text-xs font-bold text-slate-300 uppercase">{anime.duration}</p>
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
            
            {/* 0. Official Streaming Platforms Section */}
            <section id="official-streams" className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 md:p-8">
              <h3 className="text-xl font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                <i className="fa-solid fa-tv text-blue-500 text-2xl"></i>
                Assista Oficialmente
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {/* Links Dinâmicos do AniList — usa o ícone colorido da própria plataforma */}
                {anime.externalLinks && anime.externalLinks.length > 0 &&
                  anime.externalLinks
                    .filter(link => link.type === 'STREAMING' || link.site.toLowerCase().includes('site'))
                    .slice(0, 8)
                    .map((link) => {
                      const iconColor = link.color ? `#${link.color.replace('#', '')}` : '#3b82f6';
                      return (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-3 bg-slate-800/60 border border-white/8 rounded-2xl hover:border-blue-500/40 hover:bg-slate-700/60 transition-all group shadow-lg"
                          title={`Ver ${link.site}`}
                        >
                          {link.icon ? (
                            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                              <Image
                                src={link.icon}
                                alt={link.site}
                                width={28}
                                height={28}
                                unoptimized
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <div
                              className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center text-white"
                              style={{ backgroundColor: iconColor + '33', border: `1px solid ${iconColor}44` }}
                            >
                              <i className="fa-solid fa-play text-xs" style={{ color: iconColor }} />
                            </div>
                          )}
                          <span className="text-xs font-black text-slate-200 group-hover:text-white uppercase truncate">
                            {link.site}
                          </span>
                        </a>
                      );
                    })
                }

                {/* Fallback: plataformas principais com SVG oficial embutido */}
                {([
                  {
                    name: 'Crunchyroll',
                    url: 'https://crunchyroll.com',
                    domain: 'crunchyroll.com',
                    color: '#F47521',
                    svg: '<svg viewBox="0 0 24 24" fill="#F47521"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3.6c4.636 0 8.4 3.764 8.4 8.4a8.35 8.35 0 01-2.017 5.45L6.55 5.617A8.35 8.35 0 0112 3.6zM3.6 12a8.35 8.35 0 012.017-5.45l11.833 11.833A8.35 8.35 0 0112 20.4C7.364 20.4 3.6 16.636 3.6 12z"/></svg>',
                  },
                  {
                    name: 'Netflix',
                    url: 'https://netflix.com',
                    domain: 'netflix.com',
                    color: '#E50914',
                    svg: '<svg viewBox="0 0 24 24" fill="#E50914"><path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 24c.538.006 2.85 0 4.402 0V0zm-8.489 14.374v9.624c1.32 0 3.338.03 4.854 0L10.248 24v-9.626c-1.18.033-3.988 0-4.85 0z"/></svg>',
                  },
                  {
                    name: 'Disney+',
                    url: 'https://disneyplus.com',
                    domain: 'disneyplus.com',
                    color: '#0063e5',
                    svg: '<svg viewBox="0 0 24 24" fill="#0063e5"><path d="M11.43 7.448c-1.783.002-3.682.445-4.627 1.264-.48.41-.617 1.015-.31 1.628.39.78 1.354 1.49 2.623 2.057 1.42.636 3.099.99 4.81 1.01h.198c3.698 0 6.464-1.32 7.024-3.3.27-.965-.226-1.945-1.393-2.76-1.297-.909-3.408-1.523-5.97-1.717a16.87 16.87 0 00-2.355-.182zm.375.803c.664 0 1.326.05 1.97.151 2.163.334 3.862.946 4.68 1.676.573.51.693 1.088.368 1.755-.537 1.096-2.455 1.898-5.006 2.175a12.57 12.57 0 01-3.553-.173c-1.2-.264-2.292-.737-3.18-1.372-.786-.57-1.181-1.168-.979-1.655.47-1.126 2.64-2.01 5.153-2.543.504-.1 1.017-.014 1.547-.014zm-9.01.27c-.06 0-.12.003-.178.01C.934 8.7-.153 10.3.016 12.2c.143 1.62.965 3.17 2.27 4.357 1.428 1.3 3.38 2.09 5.637 2.281.553.047 1.092.07 1.624.07 3.196 0 5.964-.852 7.823-2.396.44-.364.828-.769 1.157-1.21a8.57 8.57 0 01-2.207.29c-2.64 0-5.046-.883-6.43-2.36-1.226-1.31-1.57-2.903-.915-4.402a9.86 9.86 0 00-4.02-.295 8.46 8.46 0 00-2.16.984z"/></svg>',
                  },
                  {
                    name: 'Prime Video',
                    url: 'https://primevideo.com',
                    domain: 'primevideo.com',
                    color: '#00A8E1',
                    svg: '<svg viewBox="0 0 24 24" fill="#00A8E1"><path d="M6.408 12.306c-.208.164-.214.435-.014.614l.48.428c.207.184.54.205.762.044 1.5-1.09 3.336-1.738 5.376-1.738 2.037 0 3.873.647 5.372 1.737.222.162.555.14.762-.044l.48-.428c.2-.178.194-.45-.014-.614C17.733 11.039 15.71 10.25 13.012 10.25c-2.7 0-4.72.79-6.604 2.056zM13.012 7.5C9.52 7.5 6.388 8.858 4.07 11.07l-.576-.514c-.212-.188-.21-.5 0-.688C6.06 7.64 9.373 6.25 13.012 6.25s6.952 1.39 9.518 3.618c.21.188.212.5 0 .688l-.576.514C19.636 8.858 16.505 7.5 13.012 7.5zm0 9.5c-1.415 0-2.712-.36-3.829-.988l-.71.633c-.208.185-.204.48.008.663A8.24 8.24 0 0013.012 18.5c1.99 0 3.808-.705 5.23-1.87.212-.183.216-.478.008-.663l-.71-.633C16.423 16.64 15.126 17 13.012 17z"/></svg>',
                  },
                ] as { name: string; url: string; domain: string; color: string; svg: string }[]).map((platform) => {
                  if (anime.externalLinks?.some(l => l.url.includes(platform.domain))) return null;
                  const directLink = anime.streamingEpisodes?.find(ep => ep.url.includes(platform.domain))?.url || platform.url;
                  return (
                    <a
                      key={platform.name}
                      href={directLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 bg-slate-800/60 border border-white/8 rounded-2xl hover:border-white/20 hover:bg-slate-700/60 transition-all group shadow-lg"
                      title={`Assistir na ${platform.name}`}
                    >
                      <div
                        className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: platform.color + '22', border: `1px solid ${platform.color}44` }}
                        dangerouslySetInnerHTML={{ __html: platform.svg }}
                      />
                      <span className="text-xs font-black text-slate-300 group-hover:text-white uppercase truncate">
                        {platform.name}
                      </span>
                    </a>
                  );
                })}
              </div>
              <p className="mt-6 text-sm text-slate-500 font-medium italic leading-relaxed border-t border-white/5 pt-4">
                Apoie a indústria oficial assistindo em plataformas licenciadas.
              </p>
            </section>

            {/* 1. Episodes List (Primeiro) */}
            <section id="episodes">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  Episódios
                </h2>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">
                  {anime.episodesReleased || 0} {anime.episodesReleased === 1 ? 'Episódio' : 'Episódios'}
                </span>
              </div>
              <EpisodeList 
                animeId={Number(anime.id)} 
                animeTitle={anime.title}
                totalEpisodes={Number(anime.episodesReleased) || 1} 
                animePoster={anime.poster}
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

            {/* 3. Characters & Voice Actors */}
            {anime.characters && anime.characters.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                    Personagens e Elenco
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {anime.characters.map((char, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-lg hover:shadow-blue-500/5 backdrop-blur-sm">
                      {/* Character Info */}
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/10 shadow-md bg-slate-800">
                          <Image src={char.image} alt={char.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="56px" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white truncate max-w-[110px]">{char.name}</h4>
                          <span className="text-[9px] font-black uppercase text-blue-500 tracking-widest">{char.role === 'MAIN' ? 'Protagonista' : 'Suporte'}</span>
                        </div>
                      </div>

                      {/* Voice Actor Info */}
                      {char.voiceActor && (
                        <div className="flex items-center gap-3 text-right">
                          <div className="hidden sm:block">
                            <h4 className="text-[10px] font-bold text-slate-300 truncate max-w-[90px]">{char.voiceActor.name}</h4>
                            <span className="text-[8px] font-medium text-slate-500 uppercase">Dublador JP</span>
                          </div>
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity bg-slate-800">
                            <Image src={char.voiceActor.image} alt={char.voiceActor.name} fill className="object-cover" sizes="40px" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Staff Section (Novo) */}
            {anime.staff && anime.staff.length > 0 && (
              <section className="mb-16">
                <h2 className="text-xl font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  Produção e Staff
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {anime.staff.map((s, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4 group hover:border-blue-500/30 transition-all shadow-lg hover:shadow-blue-500/5">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/10 shadow-md bg-slate-800">
                        <Image src={s.image} alt={s.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="56px" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white truncate max-w-[150px]">{s.name}</h4>
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{s.role}</span>
                      </div>
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
