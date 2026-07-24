'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Anime, AniListAPI, TMDBAPI } from '@/lib/api';
import { getEmbedSources, EmbedSource, AudioOption } from '@/lib/embeds';
import { WatchHistory } from '@/lib/history';
import { translateEpisodeTitle, formatEpisodeLabel } from '@/lib/episodeTitles';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CustomVideoPlayer from '@/components/player/CustomVideoPlayer';
import { AniSkipAPI, SkipTime } from '@/lib/aniskip';

export default function PlayerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const currentEp = parseInt(params.ep as string) || 1;
  const animeIdNum = parseInt(id.split('-')[0]);
  const slug = id.split('-').slice(1).join('-');

  const [anime, setAnime] = useState<Anime | null>(null);
  const [tmdbId, setTmdbId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResolvingSource, setIsResolvingSource] = useState(false);

  // Player state
  const [sources, setSources] = useState<EmbedSource[]>([]);
  const [activeSource, setActiveSource] = useState<string>('embedplay');
  const [audio, setAudio] = useState<AudioOption>('leg');
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aniskip, setAniskip] = useState<SkipTime[]>([]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const serverMenuRef = useRef<HTMLDivElement>(null);

  // 1. Load anime details
  useEffect(() => {
    const loadAnime = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!isNaN(animeIdNum)) {
          const data = await AniListAPI.getDetails(animeIdNum.toString());
          if (data) {
            setAnime(data);
            document.title = `${data.title} - Episódio ${currentEp} | Anime House`;
          } else {
            setError('Anime não encontrado.');
          }
        }
      } catch (err) {
        console.error('PLAYER_LOAD_ERROR:', err);
        setError('Erro ao carregar dados do anime.');
      } finally {
        setLoading(false);
      }
    };
    loadAnime();
  }, [animeIdNum, currentEp]);

  // 2. Find TMDB ID when anime loads
  useEffect(() => {
    if (!anime) return;
    
    const findTmdbId = async () => {
      setTmdbLoading(true);
      try {
        // Try with romaji title first, then english
        const titles = [
          anime.titleRomaji,
          anime.titleEnglish,
          anime.title,
        ].filter(Boolean) as string[];

        for (const title of titles) {
          const foundId = await TMDBAPI.findIdByTitle(title);
          if (foundId) {
            setTmdbId(foundId);
            return;
          }
        }
        console.warn('TMDB_NOT_FOUND: Nenhum TMDB ID encontrado para', anime.title);
      } catch (err) {
        console.error('TMDB_SEARCH_ERROR:', err);
      } finally {
        setTmdbLoading(false);
      }
    };

    findTmdbId();
  }, [anime]);

  useEffect(() => {
    if (!tmdbId) return;
    const embedSources = getEmbedSources(tmdbId, 1, currentEp, audio, slug);
    setSources(embedSources);
    setIframeKey(prev => prev + 1);
  }, [tmdbId, currentEp, audio, slug]);

  // 4. Save watch history
  useEffect(() => {
    if (!anime || !tmdbId) return;

    WatchHistory.save(
      { id: anime.id, title: anime.title, poster: anime.poster, format: anime.format },
      currentEp
    );
  }, [anime, currentEp, tmdbId]);

  // AniList Sync
  useEffect(() => {
    if (!anime) return;
    const syncAniList = async () => {
      const token = localStorage.getItem('anilist_token');
      if (token) {
        const status = await AniListAPI.getMediaListStatus(Number(anime.id), token);
        const isCompleted = status?.status === 'COMPLETED';
        const currentProgress = status?.progress || 0;
        
        if (!isCompleted && currentEp > currentProgress) {
          await AniListAPI.saveMediaListEntry(Number(anime.id), 'CURRENT', currentEp, token);
          window.dispatchEvent(new Event('anilist-sync'));
        }
      }
    };
    syncAniList();
  }, [anime, currentEp]);

  // AniSkip Fetch
  useEffect(() => {
    if (!anime?.malId) return;
    const loadSkipTimes = async () => {
      const times = await AniSkipAPI.getSkipTimes(anime.malId!, currentEp);
      setAniskip(times);
    };
    loadSkipTimes();
  }, [anime, currentEp]);

  // 5. Close server menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (serverMenuRef.current && !serverMenuRef.current.contains(e.target as Node)) {
        setShowServerMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Get active source URL
  const currentSource = sources.find(s => s.id === activeSource) || sources[0];
  const currentUrl = currentSource?.url;

  // Episode navigation
  const totalEps = Number(anime?.episodesReleased) || Number(anime?.episodes) || currentEp;
  const hasPrev = currentEp > 1;
  const hasNext = currentEp < totalEps;
  const goToEp = (ep: number) => router.push(`/player/${id}/${ep}`);

  const handleVideoEnded = () => {
    if (hasNext) {
      goToEp(currentEp + 1);
    }
  };

  // Handle audio change
  const handleAudioChange = (newAudio: AudioOption) => {
    setAudio(newAudio);
    // Sources will regenerate via useEffect
  };

  // Handle server change
  const handleSourceChange = async (sourceId: string) => {
    const source = sources.find(s => s.id === sourceId);
    if (!source) return;

    setActiveSource(sourceId);
    setShowServerMenu(false);

    if (source.isAsync) {
      setIsResolvingSource(true);
      try {
        let finalUrl = '';
        if (source.provider === 'anroll' && slug) {
          const { AnrollAPI } = await import('@/lib/anroll');
          const epId = await AnrollAPI.getEpisodeId(slug, currentEp);
          if (epId) {
            finalUrl = (await AnrollAPI.getPlayerIframe(epId)) || '';
          }
        } else if (source.provider === 'consumet') {
          const res = await fetch(`/api/consumet?id=${anime?.id}&ep=${currentEp}`);
          if (res.ok) {
            const data = await res.json();
            finalUrl = data.url;
          }
        }
        
        if (finalUrl) {
          source.url = finalUrl;
        }
      } catch (err) {
        console.error('Failed to resolve async source', err);
      } finally {
        setIsResolvingSource(false);
        setIframeKey(prev => prev + 1);
      }
    } else {
      setIframeKey(prev => prev + 1);
    }
  };

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
            Carregando Player...
          </p>
        </div>
      </div>
    );
  }

  // ─── Error State ───
  if (error || !anime) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <i className="fa-solid fa-triangle-exclamation text-4xl text-red-500/60 mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
            {error || 'Série não encontrada.'}
          </p>
          <Link href="/" className="mt-4 inline-block text-blue-500 text-xs font-bold hover:underline">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const epData = anime.streamingEpisodes?.find(e => {
    const num = parseInt(e.title.replace(/\D/g, ''));
    return num === currentEp;
  });
  const epTitle = epData?.title ? translateEpisodeTitle(epData.title) : `Episódio ${currentEp}`;

  return (
    <div className="flex flex-col min-h-screen bg-[#05080f]">
      {/* Background Banner (subtle) */}
      <div className="absolute top-0 left-0 w-full h-[40vh] opacity-10 pointer-events-none overflow-hidden">
        <img
          src={anime.banner || anime.poster}
          alt=""
          className="w-full h-full object-cover blur-3xl scale-110"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05080f]/50 via-[#05080f] to-[#05080f]" />
      </div>

      <div className={`container mx-auto px-4 lg:px-8 pt-20 pb-20 relative z-10 ${isTheaterMode ? 'max-w-full px-0 lg:px-0' : ''}`}>
        {/* Breadcrumbs */}
        {!isTheaterMode && (
          <Breadcrumbs items={[
            { label: 'Animes', href: '/lista' },
            { label: anime.title, href: `/anime/${anime.id}` },
            { label: `Episódio ${currentEp}` }
          ]} />
        )}

        <div className={`mt-4 flex flex-col ${isTheaterMode ? '' : 'lg:flex-row'} gap-6`}>

          {/* ─── Main Player Area ─── */}
          <div className={`flex-1 min-w-0 flex flex-col gap-4`}>

            {/* Player Iframe Container */}
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 shadow-2xl shadow-black/50 group">
              {tmdbLoading || !tmdbId ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950">
                  {tmdbLoading ? (
                    <>
                      <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        Buscando fontes de vídeo...
                      </p>
                    </>
                  ) : (
                    <div className="text-center px-6">
                      <i className="fa-solid fa-film-slash text-3xl text-slate-700 mb-4" />
                      <p className="text-slate-500 text-xs font-bold mb-2">
                        Nenhuma fonte de vídeo encontrada para este anime.
                      </p>
                      <p className="text-slate-600 text-[10px]">
                        O TMDB ID não foi localizado. Tente um anime diferente.
                      </p>
                    </div>
                  )}
                </div>
              ) : isResolvingSource ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950">
                  <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    Conectando ao servidor...
                  </p>
                </div>
              ) : !currentUrl ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 text-slate-500 text-sm">
                  <p>Vídeo indisponível neste servidor. Por favor, tente outro.</p>
                </div>
              ) : currentSource?.type === 'video' ? (
                <CustomVideoPlayer
                  key={iframeKey}
                  url={currentUrl}
                  title={`${anime.title} - Episódio ${currentEp}`}
                  poster={anime.banner || anime.poster}
                  onEnded={handleVideoEnded}
                  aniskip={aniskip}
                />
              ) : (
                <iframe
                  key={iframeKey}
                  ref={iframeRef}
                  src={currentUrl}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
                  title={`${anime.title} - Episódio ${currentEp}`}
                />
              )}
            </div>

            {/* Player Controls Bar */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3">

              {/* Episode Navigation */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => hasPrev && goToEp(currentEp - 1)}
                  disabled={!hasPrev}
                  className="w-9 h-9 flex items-center justify-center bg-slate-900/80 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Episódio anterior"
                >
                  <i className="fa-solid fa-backward-step text-xs" />
                </button>

                <div className="px-4 py-2 bg-slate-900/80 border border-white/5 rounded-xl">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    EP {currentEp.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-slate-600 mx-1.5">/</span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {totalEps || '??'}
                  </span>
                </div>

                <button
                  onClick={() => hasNext && goToEp(currentEp + 1)}
                  disabled={!hasNext}
                  className="w-9 h-9 flex items-center justify-center bg-slate-900/80 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Próximo episódio"
                >
                  <i className="fa-solid fa-forward-step text-xs" />
                </button>
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-white/5 hidden md:block" />

              {/* Server Selector */}
              {sources.length > 0 && (
                <div className="relative" ref={serverMenuRef}>
                  <button
                    onClick={() => setShowServerMenu(!showServerMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                  >
                    <i className="fa-solid fa-server text-blue-500 text-[10px]" />
                    {currentSource?.name || 'Servidor'}
                    <i className={`fa-solid fa-chevron-down text-[8px] text-slate-500 transition-transform ${showServerMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showServerMenu && (
                    <div className="absolute bottom-full mb-2 left-0 w-64 bg-slate-900 border border-white/5 rounded-2xl shadow-2xl py-2 z-50 max-h-80 overflow-y-auto">
                      <div className="px-3 py-2 border-b border-white/5">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                          Selecionar Servidor
                        </p>
                      </div>
                      {sources.map((source) => (
                        <button
                          key={source.id}
                          onClick={() => handleSourceChange(source.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all ${
                            activeSource === source.id
                              ? 'bg-blue-600/10 text-blue-400'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            activeSource === source.id ? 'bg-blue-500' : 'bg-slate-700'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold truncate">{source.name}</p>
                            {source.server && (
                              <p className="text-[8px] text-slate-600">{source.provider === 'fembed' ? 'Servidor fixo' : ''}</p>
                            )}
                          </div>
                          {activeSource === source.id && (
                            <i className="fa-solid fa-check text-[8px] text-blue-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Audio Selector */}
              <div className="flex items-center gap-1 bg-slate-900/80 border border-white/5 rounded-xl p-1">
                {([
                  { value: 'leg' as AudioOption, label: 'LEG', icon: 'fa-closed-captioning' },
                  { value: 'dub' as AudioOption, label: 'DUB', icon: 'fa-microphone' },
                  { value: 'default' as AudioOption, label: 'AUTO', icon: 'fa-wand-magic-sparkles' },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleAudioChange(opt.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                      audio === opt.value
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                    }`}
                    title={opt.value === 'leg' ? 'Legendado' : opt.value === 'dub' ? 'Dublado' : 'Automático'}
                  >
                    <i className={`fa-solid ${opt.icon} text-[8px]`} />
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Right-side controls */}
              <div className="flex items-center gap-1.5 ml-auto">
                {/* Toggle Theater Mode */}
                <button
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  className="w-9 h-9 flex items-center justify-center bg-slate-900/80 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                  title={isTheaterMode ? 'Modo Normal' : 'Modo Teatro'}
                >
                  <i className={`fa-solid ${isTheaterMode ? 'fa-compress' : 'fa-expand'} text-xs`} />
                </button>

                {/* Toggle Sidebar */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hidden lg:flex w-9 h-9 items-center justify-center bg-slate-900/80 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                  title={sidebarOpen ? 'Esconder episódios' : 'Mostrar episódios'}
                >
                  <i className={`fa-solid ${sidebarOpen ? 'fa-angles-right' : 'fa-angles-left'} text-xs`} />
                </button>
              </div>
            </div>

            {/* Episode Title & Info */}
            <div className="bg-slate-900/40 border border-white/5 p-5 md:p-6 rounded-2xl">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Poster mini */}
                <Link href={`/anime/${anime.id}`} className="hidden md:block relative w-16 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-white/5 hover:border-blue-500/40 transition-all group">
                  <Image
                    src={anime.poster}
                    alt={anime.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform"
                    sizes="64px"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/anime/${anime.id}`} className="hover:text-blue-400 transition-colors">
                    <h1 className="text-lg md:text-xl font-black text-white uppercase tracking-tight leading-tight mb-1">
                      {anime.title}
                    </h1>
                  </Link>
                  <p className="text-sm text-slate-300 font-medium mb-2">
                    <span className="text-blue-500 font-black">EP {currentEp.toString().padStart(2, '0')}</span>
                    {epTitle !== `Episódio ${currentEp}` && (
                      <span className="text-slate-500"> — {epTitle}</span>
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                    {anime.format && <span>{anime.format}</span>}
                    {anime.format && <span className="text-slate-700">•</span>}
                    <span>{anime.year}</span>
                    <span className="text-slate-700">•</span>
                    <span className={anime.status === 'Em Lançamento' ? 'text-emerald-500' : 'text-slate-500'}>
                      {anime.status}
                    </span>
                    {tmdbId && (
                      <>
                        <span className="text-slate-700">•</span>
                        <span className="text-blue-500/60">TMDB: {tmdbId}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Official Streams (collapsible) */}
            {anime.externalLinks && anime.externalLinks.filter(l => l.type === 'STREAMING').length > 0 && (
              <details className="bg-slate-900/20 border border-white/5 rounded-2xl overflow-hidden group">
                <summary className="flex items-center gap-3 px-5 py-3 cursor-pointer text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                  <i className="fa-solid fa-gem text-blue-500/50" />
                  Plataformas Oficiais
                  <i className="fa-solid fa-chevron-down text-[8px] ml-auto transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-4 flex flex-wrap gap-2">
                  {anime.externalLinks
                    .filter(link => link.type === 'STREAMING')
                    .map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-slate-800/50 hover:bg-blue-600/10 border border-white/5 hover:border-blue-500/30 text-[9px] font-bold text-slate-400 hover:text-white rounded-xl flex items-center gap-2 transition-all"
                      >
                        <img
                          src={link.icon || `https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=32`}
                          alt={link.site}
                          className="w-4 h-4 rounded"
                        />
                        {link.site}
                        <i className="fa-solid fa-arrow-up-right-from-square text-[7px] opacity-40" />
                      </a>
                    ))}
                </div>
              </details>
            )}

            {/* Mobile Episode List */}
            <div className={`${isTheaterMode ? '' : 'lg:hidden'}`}>
              <EpisodeSidebar
                anime={anime}
                currentEp={currentEp}
                totalEps={totalEps}
                id={id}
              />
            </div>
          </div>

          {/* ─── Desktop Sidebar: Episode List ─── */}
          {sidebarOpen && !isTheaterMode && (
            <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
              <EpisodeSidebar
                anime={anime}
                currentEp={currentEp}
                totalEps={totalEps}
                id={id}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Episode Sidebar Component ───
function EpisodeSidebar({
  anime,
  currentEp,
  totalEps,
  id,
}: {
  anime: Anime;
  currentEp: number;
  totalEps: number;
  id: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const episodes = Array.from({ length: totalEps }, (_, i) => i + 1);
  const filteredEps = searchQuery
    ? episodes.filter(ep => ep.toString().includes(searchQuery))
    : episodes;

  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded-full" />
            Episódios
          </h3>
          <span className="text-[9px] font-bold text-slate-600">{totalEps} eps</span>
        </div>

        {/* Search episodes */}
        {totalEps > 24 && (
          <div className="relative">
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar episódio..."
              className="w-full pl-8 pr-3 py-2 bg-slate-800/50 border border-white/5 rounded-xl text-[10px] font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Episode List */}
      <div className="flex flex-col gap-1 max-h-[600px] overflow-y-auto p-2 custom-scrollbar">
        {filteredEps.map((epNum) => {
          const isActive = epNum === currentEp;
          const epData = anime.streamingEpisodes?.[epNum - 1];
          const epTitle = epData?.title
            ? translateEpisodeTitle(epData.title, epNum)
            : undefined;

          return (
            <Link
              key={epNum}
              href={`/player/${id}/${epNum}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                isActive
                  ? 'bg-blue-600/10 border-blue-500/40 shadow-lg shadow-blue-500/5'
                  : 'bg-transparent border-transparent hover:bg-slate-800/50 hover:border-white/5'
              }`}
            >
              {/* Episode thumbnail or number */}
              {epData?.thumbnail ? (
                <div className="relative w-20 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800">
                  <Image
                    src={epData.thumbnail}
                    alt={`EP ${epNum}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <i className="fa-solid fa-play text-[6px] text-white ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-slate-800/50 text-slate-500'
                }`}>
                  {epNum}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-black uppercase tracking-wider truncate ${
                  isActive ? 'text-blue-400' : 'text-slate-300'
                }`}>
                  {formatEpisodeLabel(epNum)}
                  {epTitle && (
                    <span className="text-slate-500 font-bold normal-case tracking-normal ml-1.5">
                      {epTitle}
                    </span>
                  )}
                </p>
              </div>

              {isActive && (
                <div className="flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
