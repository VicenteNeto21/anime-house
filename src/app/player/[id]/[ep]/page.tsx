'use client';

import { useState, useEffect } from 'react';
import { Anime, AniListAPI } from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { translateEpisodeTitle } from '@/lib/episodeTitles';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function EpisodeGuidePage() {
  const params = useParams();
  const id = params.id as string;
  const currentEp = parseInt(params.ep as string) || 1;

  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnime = async () => {
      setLoading(true);
      try {
        const idNum = parseInt(id.split('-')[0]);
        if (!isNaN(idNum)) {
          const data = await AniListAPI.getDetails(idNum.toString());
          if (data) {
            setAnime(data);
            document.title = `${data.title} - Episódio ${currentEp} | Guia Oficial Anime House`;
          }
        }
      } catch (err) {
        console.error('Error loading anime', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnime();
  }, [id, currentEp]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Carregando Guia...</p>
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[80vh]">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Série não encontrada.</p>
      </div>
    );
  }

  const episodeData = anime.streamingEpisodes?.find(e => parseInt(e.title.replace(/\D/g, '')) === currentEp) || null;
  const epTitle = episodeData?.title ? translateEpisodeTitle(episodeData.title) : `Episódio ${currentEp}`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 pb-20">
      {/* Background Banner */}
      <div className="absolute top-0 left-0 w-full h-[50vh] opacity-20 pointer-events-none overflow-hidden">
        <img src={anime.banner || anime.poster} alt="Background" className="w-full h-full object-cover blur-3xl scale-110" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950 to-slate-950"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 pt-24 relative z-10">
        <Breadcrumbs items={[
          { label: 'Animes', href: '/lista' },
          { label: anime.title, href: `/anime/${anime.id}` },
          { label: `Episódio ${currentEp}` }
        ]} />

        <div className="grid lg:grid-cols-4 gap-8 mt-6">
          {/* Main Area */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            
            {/* Title Block */}
            <div className="bg-slate-900/40 border border-white/5 p-6 md:p-8 rounded-3xl backdrop-blur-sm">
              <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">
                <span className="text-blue-500">EP {currentEp.toString().padStart(2, '0')}</span> - {epTitle}
              </h1>
              <p className="text-slate-400 font-medium">Guia Oficial de Lançamentos</p>
            </div>

            {/* Official Streams Block */}
            <section id="official-streams" className="bg-[#05080f] border border-blue-500/20 rounded-3xl p-6 md:p-10 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>
              <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mb-6 mx-auto relative z-10">
                <i className="fa-solid fa-gem text-4xl text-blue-500"></i>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-4 relative z-10">Apoie o Lançamento Oficial!</h2>
              <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-sm md:text-base leading-relaxed relative z-10">
                Para incentivar a indústria e mantermos o projeto no ar como um catálogo limpo e informativo, não hospedamos vídeos em nossos servidores. Assista este episódio através das plataformas oficiais e apoie os criadores!
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center relative z-10">
                {/* Links Dinâmicos do AniList */}
                {anime.externalLinks && anime.externalLinks.length > 0 ? (
                  anime.externalLinks
                    .filter(link => link.type === 'STREAMING' || link.site.toLowerCase().includes('site'))
                    .map((link) => (
                      <a 
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] md:text-xs rounded-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/20"
                        title={`Ver ${link.site}`}
                      >
                        <img 
                          src={link.icon || `https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=64`} 
                          alt={link.site} 
                          className="w-5 h-5 rounded-md bg-white/10" 
                        />
                        {link.site}
                        <i className="fa-solid fa-arrow-up-right-from-square opacity-70 ml-1"></i>
                      </a>
                    ))
                ) : (
                  <div className="text-slate-500 text-sm italic max-w-lg">
                    Nenhum streaming oficial localizado para este título na nossa base de dados no momento.<br/>Considere apoiar a indústria através de serviços como Crunchyroll, Netflix ou Prime Video.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Area: Episodes List */}
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 sticky top-24">
              <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                Guia de Episódios
              </h3>
              
              <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {Array.from({ length: anime.episodesReleased || anime.episodes || currentEp }).map((_, i) => {
                  const epNum = i + 1;
                  const isActive = epNum === currentEp;
                  
                  return (
                    <Link
                      key={epNum}
                      href={`/player/${id}/${epNum}`}
                      className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                        isActive 
                          ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/5' 
                          : 'bg-slate-800/40 border-white/5 hover:bg-slate-800 hover:border-blue-500/30'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'
                      }`}>
                        {epNum}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className={`text-xs font-black uppercase tracking-wider truncate ${isActive ? 'text-blue-400' : 'text-slate-300'}`}>
                          Episódio {epNum}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
