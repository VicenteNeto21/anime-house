
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Anime, AniListAPI, TMDBAPI } from '@/lib/api';
import { getEmbedSources, EmbedSource, AudioOption } from '@/lib/embeds';
import { WatchHistory } from '@/lib/history';
import { translateEpisodeTitle } from '@/lib/episodeTitles';
import { AniSkipAPI, SkipTime } from '@/lib/aniskip';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import TorrentModal from '@/components/player/TorrentModal';
import PlayerControlsBar from '@/components/player/PlayerControlsBar';
import EpisodeSidebar from '@/components/player/EpisodeSidebar';
import NextEpisodeCountdown from '@/components/player/NextEpisodeCountdown';
import { 
  AlertTriangle, 
  VideoOff, 
  Star, 
  Clock, 
  BookOpen, 
  Gem, 
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

const ArtVideoPlayer = dynamic(() => import('@/components/player/ArtVideoPlayer'), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950">
      <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">
        Carregando ArtPlayer...
      </p>
    </div>
  ),
});

const WebtorPlayer = dynamic(() => import('@/components/player/WebtorPlayer'), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black">
      <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest animate-pulse">
        Conectando Rede Webtor...
      </p>
    </div>
  ),
});

export default function PlayerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const currentEp = parseInt(params.ep as string) || 1;
  const animeIdNum = parseInt(id?.split('-')[0] || '0');
  const slug = id?.split('-').slice(1).join('-') || '';

  const [anime, setAnime] = useState<Anime | null>(null);
  const [tmdbId, setTmdbId] = useState<string | number | null>(null);
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [tmdbSeason, setTmdbSeason] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Player state
  const [sources, setSources] = useState<EmbedSource[]>([]);
  const [activeSource, setActiveSource] = useState<string>('streambetter');
  const [audio, setAudio] = useState<AudioOption>('leg');
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aniskip, setAniskip] = useState<SkipTime[]>([]);
  const [showNextCountdown, setShowNextCountdown] = useState(false);

  // Torrent state
  const [showTorrentModal, setShowTorrentModal] = useState(false);
  const [webtorMagnet, setWebtorMagnet] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

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
        // 1. Tentar primeiro busca com AniList ID direto (mapeamento Fribb/anime-lists sem necessidade de API key)
        const directResult = await TMDBAPI.findIdByTitle(anime.title, animeIdNum);
        if (directResult?.id) {
          let resolvedSeason = directResult.season || 1;
          // Se a temporada mapeada for > 1, verificar se o episódio existe nessa temporada ou na Temporada 1
          if (resolvedSeason > 1) {
            try {
              const checkRes = await fetch(
                `/api/embedplay/status?tmdb=${directResult.id}&sea=${resolvedSeason}&epi=${currentEp}&type=tv`
              );
              if (checkRes.ok) {
                const checkData = await checkRes.json();
                if (!checkData.available) {
                  // Se temporada > 1 não tem fonte, testar se está agrupada na Temporada 1
                  const s1Res = await fetch(
                    `/api/embedplay/status?tmdb=${directResult.id}&sea=1&epi=${currentEp}&type=tv`
                  );
                  if (s1Res.ok) {
                    const s1Data = await s1Res.json();
                    if (s1Data.available) {
                      resolvedSeason = 1;
                    }
                  }
                }
              }
            } catch (err) {
              console.warn('Erro ao verificar disponibilidade de temporada:', err);
            }
          }
          setTmdbId(directResult.id);
          if (directResult.imdbId) setImdbId(directResult.imdbId);
          setTmdbSeason(resolvedSeason);
          return;
        }

        // 2. Fallback para os títulos alternativos
        const titles = [
          anime.titleRomaji,
          anime.titleEnglish,
          anime.title,
        ].filter(Boolean) as string[];

        for (const title of titles) {
          const res = await TMDBAPI.findIdByTitle(title);
          if (res?.id) {
            let fallbackSeason = res.season || 1;
            if (fallbackSeason > 1) {
              try {
                const checkRes = await fetch(
                  `/api/embedplay/status?tmdb=${res.id}&sea=${fallbackSeason}&epi=${currentEp}&type=tv`
                );
                if (checkRes.ok) {
                  const checkData = await checkRes.json();
                  if (!checkData.available) {
                    fallbackSeason = 1;
                  }
                }
              } catch {
                fallbackSeason = 1;
              }
            }
            setTmdbId(res.id);
            if (res.imdbId) setImdbId(res.imdbId);
            setTmdbSeason(fallbackSeason);
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
  }, [anime, animeIdNum, currentEp]);

  // 3. Update streaming sources
  useEffect(() => {
    if (!anime) return;
    const effectiveSlug = slug || AniListAPI.slugify(anime.titleRomaji || anime.titleEnglish || anime.title);
    const streamSources = getEmbedSources(
      tmdbId || '',
      tmdbSeason,
      currentEp,
      audio,
      effectiveSlug,
      imdbId || undefined
    );
    if (streamSources.length > 0) {
      if (!streamSources.find((s) => s.id === activeSource) || ((tmdbId || imdbId) && activeSource === 'maximaimg')) {
        setActiveSource(streamSources[0].id);
      }
    }
    setSources(streamSources);
    setIframeKey((prev) => prev + 1);
  }, [anime, slug, tmdbId, imdbId, tmdbSeason, currentEp, audio, activeSource]);

  // 4. Save watch history
  useEffect(() => {
    if (!anime || !tmdbId) return;

    WatchHistory.save(
      { id: anime.id, title: anime.title, poster: anime.poster, format: anime.format },
      currentEp
    );
  }, [anime, currentEp, tmdbId]);

  // 5. AniList Progress Sync
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

  // 6. AniSkip Fetch
  useEffect(() => {
    if (!anime?.malId) return;
    const loadSkipTimes = async () => {
      const times = await AniSkipAPI.getSkipTimes(anime.malId!, currentEp);
      setAniskip(times);
    };
    loadSkipTimes();
  }, [anime, currentEp]);

  // Episode navigation
  const totalEps = Number(anime?.episodesReleased) || Number(anime?.episodes) || currentEp;
  const hasPrev = currentEp > 1;
  const hasNext = currentEp < totalEps;
  const goToEp = useCallback((ep: number) => {
    setShowNextCountdown(false);
    router.push(`/player/${id}/${ep}`);
  }, [id, router]);

  const handleVideoEnded = useCallback(() => {
    if (hasNext) {
      setShowNextCountdown(true);
    }
  }, [hasNext]);

  // 7. StreamBetter postMessage listener (progresso e autoplay do próximo episódio)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Obrigatório pela documentação StreamBetter: conferir origem segura
      if (
        event.origin !== 'https://streambetter.lat' &&
        event.origin !== 'https://streambetter.shop'
      ) {
        return;
      }

      if (event.data?.type !== 'streambetter:progress') return;

      const { state } = event.data;

      // Se terminou o vídeo, ativa contagem regressiva para o próximo episódio
      if (state === 'ended') {
        handleVideoEnded();
      } else if (anime) {
        WatchHistory.save(
          { id: anime.id, title: anime.title, poster: anime.poster, format: anime.format },
          currentEp
        );
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [anime, currentEp, handleVideoEnded]);

  // Display sources with optional active Torrent
  const displaySources: EmbedSource[] = webtorMagnet
    ? [
        ...sources,
        {
          id: 'webtor',
          name: 'Webtor (Torrent P2P)',
          provider: 'webtor',
          audioLabel: audio === 'dub' ? 'DUB' : 'LEG',
          type: 'iframe',
          url: webtorMagnet,
        } as EmbedSource,
      ]
    : sources;

  const currentSource = displaySources.find((s) => s.id === activeSource) || displaySources[0];
  const currentUrl = currentSource?.url;

  // Handle server source change
  const handleSourceChange = (sourceId: string) => {
    const source = displaySources.find((s) => s.id === sourceId);
    if (!source) return;

    setActiveSource(sourceId);
    setShowServerMenu(false);
    setIframeKey((prev) => prev + 1);
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/20" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
            Carregando Player...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !anime) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[80vh]">
        <div className="text-center p-6 bg-slate-900/60 border border-white/5 rounded-2xl max-w-md mx-auto">
          <AlertTriangle className="w-10 h-10 text-red-500/80 mx-auto mb-4" />
          <p className="text-slate-300 font-bold uppercase tracking-widest text-xs mb-4">
            {error || 'Série não encontrada.'}
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  const epData = anime.streamingEpisodes?.find((e) => {
    const num = parseInt(e.title.replace(/\D/g, ''));
    return num === currentEp;
  });
  const epTitle = epData?.title ? translateEpisodeTitle(epData.title) : `Episódio ${currentEp}`;

  return (
    <div className="flex flex-col min-h-screen bg-[#05080f]">
      {/* Background Banner */}
      <div className="absolute top-0 left-0 w-full h-[45vh] opacity-15 pointer-events-none overflow-hidden">
        <Image
          src={anime.banner || anime.poster}
          alt=""
          fill
          aria-hidden="true"
          unoptimized
          className="object-cover blur-3xl scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05080f]/50 via-[#05080f]/90 to-[#05080f]" />
      </div>

      <div
        className={`container mx-auto px-4 lg:px-8 pt-20 pb-20 relative z-10 transition-all ${
          isTheaterMode ? 'max-w-full px-2 lg:px-4' : ''
        }`}
      >
        {/* Breadcrumbs */}
        {!isTheaterMode && (
          <Breadcrumbs
            items={[
              { label: 'Animes', href: '/lista' },
              { label: anime.title, href: `/anime/${anime.id}` },
              { label: `Episódio ${currentEp}` },
            ]}
          />
        )}

        <div className={`mt-4 flex flex-col ${isTheaterMode ? '' : 'lg:flex-row'} gap-6`}>
          {/* ─── Main Player Area ─── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Player Container */}
            <div className="relative z-10 w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 shadow-2xl shadow-black/80 group">
              {displaySources.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 p-6 text-center">
                  <VideoOff className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs font-bold mb-1">
                    Nenhum stream direto disponível para este episódio.
                  </p>
                  <p className="text-slate-600 text-[10px]">
                    Use o botão de busca por Torrent ou tente novamente em instantes.
                  </p>
                </div>
              ) : !currentUrl ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 text-slate-400 text-sm">
                  <p>Vídeo indisponível neste momento. Por favor, tente via Torrent.</p>
                </div>
              ) : activeSource === 'webtor' && webtorMagnet ? (
                /* Webtor Torrent Playback */
                <WebtorPlayer
                  magnet={webtorMagnet}
                  title={`${anime.title} - Episódio ${currentEp}`}
                  poster={anime.banner || anime.poster}
                />
              ) : currentSource?.type === 'video' ? (
                /* ArtPlayer Modern Player */
                <ArtVideoPlayer
                  key={iframeKey}
                  url={currentUrl}
                  title={`${anime.title} - Episódio ${currentEp}`}
                  poster={anime.banner || anime.poster}
                  onEnded={handleVideoEnded}
                  aniskip={aniskip}
                  autoPlay={false}
                />
              ) : (
                /* External Embed (Sem sandbox para StreamBetter e EmbedPlay para evitar bloqueio) */
                <iframe
                  key={iframeKey}
                  ref={iframeRef}
                  src={currentUrl}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  sandbox={
                    currentSource?.provider === 'streambetter' || currentSource?.provider === 'embedplay'
                      ? undefined
                      : 'allow-scripts allow-same-origin allow-forms allow-presentation allow-popups'
                  }
                  data-sb-embed={currentSource?.provider === 'streambetter' ? true : undefined}
                  title={`${anime.title} - Episódio ${currentEp}`}
                />
              )}

              {/* Next Episode Countdown Overlay */}
              {showNextCountdown && (
                <NextEpisodeCountdown
                  nextEp={currentEp + 1}
                  totalEps={totalEps}
                  onProceed={() => goToEp(currentEp + 1)}
                  onCancel={() => setShowNextCountdown(false)}
                />
              )}
            </div>

            {/* Modular Player Controls Bar */}
            <PlayerControlsBar
              currentEp={currentEp}
              totalEps={totalEps}
              hasPrev={hasPrev}
              hasNext={hasNext}
              onPrevEp={() => hasPrev && goToEp(currentEp - 1)}
              onNextEp={() => hasNext && goToEp(currentEp + 1)}
              onOpenTorrentModal={() => setShowTorrentModal(true)}
              hasActiveTorrent={Boolean(webtorMagnet && activeSource === 'webtor')}
              sources={displaySources}
              activeSourceId={activeSource}
              onSelectSource={handleSourceChange}
              showServerMenu={showServerMenu}
              onToggleServerMenu={() => setShowServerMenu(!showServerMenu)}
              onCloseServerMenu={() => setShowServerMenu(false)}
              audio={audio}
              onAudioChange={setAudio}
              isTheaterMode={isTheaterMode}
              onToggleTheaterMode={() => setIsTheaterMode(!isTheaterMode)}
              sidebarOpen={sidebarOpen}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />

            {/* Episode Title & Metadata Card */}
            <div className="bg-slate-900/40 border border-white/5 p-5 md:p-6 rounded-2xl backdrop-blur-sm">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Poster mini */}
                <Link
                  href={`/anime/${anime.id}`}
                  className="hidden md:block relative w-16 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-white/5 hover:border-blue-500/40 transition-all group"
                >
                  <Image
                    src={anime.poster}
                    alt={anime.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform"
                    sizes="64px"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-red-500/10 rounded-md border border-red-500/20 text-red-500 font-black text-[10px] flex-shrink-0">
                      {anime.genres?.some((g) => ['Hentai', 'Ecchi', 'Gore'].includes(g))
                        ? '18+'
                        : anime.genres?.some((g) => ['Psychological', 'Horror', 'Thriller'].includes(g))
                        ? '16+'
                        : anime.genres?.some((g) => ['Action', 'Drama', 'Mecha'].includes(g))
                        ? '14+'
                        : 'Livre'}
                    </span>
                    <Link href={`/anime/${anime.id}`} className="hover:text-blue-400 transition-colors min-w-0">
                      <h1 className="text-lg md:text-xl font-black text-white uppercase tracking-tight leading-tight truncate">
                        {anime.title}
                      </h1>
                    </Link>
                  </div>

                  <p className="text-sm text-slate-300 font-medium mb-3">
                    <span className="text-blue-500 font-black">EP {currentEp.toString().padStart(2, '0')}</span>
                    {epTitle !== `Episódio ${currentEp}` && (
                      <span className="text-slate-400"> — {epTitle}</span>
                    )}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {anime.format && (
                      <span className="px-2 py-1 bg-slate-800/50 rounded-md border border-white/5 text-slate-200">
                        {anime.format}
                      </span>
                    )}

                    {anime.year && anime.year !== '??' && (
                      <span className="px-2 py-1 bg-slate-800/50 rounded-md border border-white/5 text-slate-200">
                        {anime.year}
                      </span>
                    )}

                    <span
                      className={`px-2 py-1 rounded-md border ${
                        anime.status === 'Em Lançamento'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800/50 border-white/5 text-slate-400'
                      }`}
                    >
                      {anime.status}
                    </span>

                    {anime.rating && anime.rating !== 'N/A' && anime.rating !== '0' && (
                      <span className="px-2 py-1 bg-yellow-500/10 rounded-md border border-yellow-500/20 text-yellow-500 flex items-center gap-1.5">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        {anime.rating}%
                      </span>
                    )}

                    {anime.duration && anime.duration !== 'N/A' && (
                      <span className="px-2 py-1 bg-blue-500/10 rounded-md border border-blue-500/20 text-blue-400 flex items-center gap-1.5">
                        <Clock className="w-2.5 h-2.5" />
                        {anime.duration}
                      </span>
                    )}

                    {anime.source && anime.source !== 'N/A' && (
                      <span className="px-2 py-1 bg-indigo-500/10 rounded-md border border-indigo-500/20 text-indigo-400 flex items-center gap-1.5">
                        <BookOpen className="w-2.5 h-2.5" />
                        {anime.source}
                      </span>
                    )}

                    {tmdbId && (
                      <span className="px-2 py-1 bg-slate-800/50 rounded-md border border-white/5 text-slate-500 text-[8px]">
                        TMDB {tmdbId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Official Streams (collapsible) */}
            {anime.externalLinks && anime.externalLinks.filter((l) => l.type === 'STREAMING').length > 0 && (
              <details className="bg-slate-900/20 border border-white/5 rounded-2xl overflow-hidden group">
                <summary className="flex items-center gap-3 px-5 py-3 cursor-pointer text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                  <Gem className="w-3.5 h-3.5 text-blue-500/60" />
                  Plataformas Oficiais
                  <ChevronDown className="w-2.5 h-2.5 ml-auto transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-4 flex flex-wrap gap-2">
                  {anime.externalLinks
                    .filter((link) => link.type === 'STREAMING')
                    .map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-slate-800/50 hover:bg-blue-600/10 border border-white/5 hover:border-blue-500/30 text-[9px] font-bold text-slate-400 hover:text-white rounded-xl flex items-center gap-2 transition-all"
                      >
                        <Image
                          src={
                            link.icon ||
                            `https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=32`
                          }
                          alt={link.site}
                          width={16}
                          height={16}
                          unoptimized
                          className="rounded"
                        />
                        {link.site}
                        <ExternalLink className="w-2.5 h-2.5 opacity-40" />
                      </a>
                    ))}
                </div>
              </details>
            )}

            {/* Mobile Episode List */}
            <div className={`${isTheaterMode ? '' : 'lg:hidden'}`}>
              <EpisodeSidebar anime={anime} currentEp={currentEp} totalEps={totalEps} id={id} />
            </div>
          </div>

          {/* ─── Desktop Sidebar: Episode List ─── */}
          {sidebarOpen && !isTheaterMode && (
            <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
              <EpisodeSidebar anime={anime} currentEp={currentEp} totalEps={totalEps} id={id} />
            </div>
          )}
        </div>
      </div>

      {/* Torrent Modal */}
      <TorrentModal
        isOpen={showTorrentModal}
        onClose={() => setShowTorrentModal(false)}
        defaultQuery={anime ? `${anime.title} ${currentEp.toString().padStart(2, '0')}` : ''}
        onSelectMagnet={(magnetUrl) => {
          setWebtorMagnet(magnetUrl);
          setActiveSource('webtor');
        }}
        animeTitles={
          anime
            ? {
                english: anime.titleEnglish,
                romaji: anime.titleRomaji,
                native: anime.titleNative,
              }
            : undefined
        }
        currentEp={currentEp}
      />
    </div>
  );
}
