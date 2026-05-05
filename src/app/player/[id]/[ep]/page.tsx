'use client';

import { useState, useEffect, useRef } from 'react';
import { Anime, AniListAPI, TMDBAPI, BetterFlixAPI } from '@/lib/api';
import { AnrollAPI } from '@/lib/anroll';
import { WatchHistory } from '@/lib/history';
import AddToList from '@/components/anime/AddToList';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function PlayerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [activeEp, setActiveEp] = useState(() => parseInt(params.ep as string) || 1);
  const currentEp = activeEp;

  // Sync state when URL changes (e.g. browser back button)
  useEffect(() => {
    const epNum = parseInt(params.ep as string);
    if (epNum && epNum !== activeEp) {
      setActiveEp(epNum);
    }
  }, [params.ep]);

  // Update URL without full navigation when episode changes
  const changeEpisode = (epNum: number) => {
    if (epNum === activeEp) return;
    setActiveEp(epNum);
    // Use window.history to update URL without triggering Next.js route change re-render
    const slug = anime ? AniListAPI.slugify(anime.title) : id;
    window.history.pushState(null, '', `/player/${slug}/${epNum}`);
  };

  const [anime, setAnime] = useState<Anime | null>(null);
  const [tmdbId, setTmdbId] = useState<number | null>(null);
  const [server, setServer] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('ah_server') || 'direct';
    return 'direct';
  });
  const [version, setVersion] = useState<'sub' | 'dub'>(() => {
    if (typeof window !== 'undefined') return (localStorage.getItem('ah_version') as 'sub' | 'dub') || 'sub';
    return 'sub';
  });
  const [loading, setLoading] = useState(true);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [autoPlayTimer, setAutoPlayTimer] = useState<number | null>(null);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('ah_autoplay') !== 'false';
    return true;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [isNativeType, setIsNativeType] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiPlayers, setAiPlayers] = useState<{name: string, src: string, type?: string}[]>([]);
  const [userAniListInfo, setUserAniListInfo] = useState<any>(null);
  const [hasSynced, setHasSynced] = useState(false);
  const [showSyncToast, setShowSyncToast] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [buffered, setBuffered] = useState(0);
  const [seekTooltip, setSeekTooltip] = useState<{visible: boolean; time: string; x: number}>({visible: false, time: '00:00', x: 0});
  const [skipTimes, setSkipTimes] = useState<{ op?: {start: number, end: number}, ed?: {start: number, end: number}, recap?: {start: number, end: number} }>({});
  const [activeSkip, setActiveSkip] = useState<'op' | 'ed' | 'recap' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const episodesContainerRef = useRef<HTMLDivElement>(null);
  const activeEpisodeRef = useRef<HTMLDivElement>(null);

  // Persist server & version preferences
  useEffect(() => { localStorage.setItem('ah_server', server); }, [server]);
  useEffect(() => { localStorage.setItem('ah_version', version); }, [version]);
  useEffect(() => { localStorage.setItem('ah_autoplay', String(autoPlayEnabled)); }, [autoPlayEnabled]);

  useEffect(() => {
    async function loadData() {
      if (anime && String(anime.id) === String(id)) return; // Comparação segura de String
      
      setLoading(true);
      const data = await AniListAPI.getDetails(id);
      if (data) {
        setAnime(data);
        const tId = await TMDBAPI.findIdByTitle(data.title);
        setTmdbId(tId);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  useEffect(() => {
    async function fetchSyncInfo(force = false) {
      try {
        const token = localStorage.getItem('anilist_token');
        if (token && id) {
          const data = await AniListAPI.getMediaListStatus(Number(id), token, force);
          if (data?.MediaList) {
            setUserAniListInfo(data.MediaList);
            // Se o usuário já assistiu este EP, marcamos como sincronizado para não chamar de novo
            if (data.MediaList.progress >= currentEp) {
              setHasSynced(true);
            }
          }
        }
      } catch { /* AniList indisponível — não é crítico */ }
    }
    fetchSyncInfo(false); // Usa cache na carga inicial
    setHasSynced(false); // Reset para o novo episódio

    const handleGlobalSync = () => {
      fetchSyncInfo(true); // Força refresh quando o usuário faz uma ação
    };
    window.addEventListener('anilist-sync', handleGlobalSync);
    return () => window.removeEventListener('anilist-sync', handleGlobalSync);
  }, [id, currentEp]);

  // ═══ ANILIST SYNC LOGIC ═══
  useEffect(() => {
    // 1. Sincronização de Status (Assim que começa a assistir)
    if (isPlaying && progress > 1 && !hasSynced) {
      const token = localStorage.getItem('anilist_token');
      if (token) {
        const currentStatus = userAniListInfo?.status === 'REPEATING' ? 'REPEATING' : 'CURRENT';
        
        // Se não temos info ou o status não é o correto
        if (!userAniListInfo || (userAniListInfo.status !== 'CURRENT' && userAniListInfo.status !== 'REPEATING')) {
          console.log('🔄 Sincronizando Status Inicial...');
          AniListAPI.saveMediaListEntry(Number(id), currentStatus, userAniListInfo?.progress || 0, token)
            .then(data => {
              if (data?.SaveMediaListEntry) {
                setUserAniListInfo(data.SaveMediaListEntry);
                window.dispatchEvent(new CustomEvent('anilist-sync'));
              }
            });
        }
      }
    }

    // 2. Sincronização de Progresso (Ao final do episódio)
    if (progress > 85 && !hasSynced) {
      const token = localStorage.getItem('anilist_token');
      if (token) {
        setHasSynced(true);
        
        let newStatus = userAniListInfo?.status || 'CURRENT';
        // Lógica de Reassistindo
        if (newStatus === 'COMPLETED' || (userAniListInfo && userAniListInfo.progress > 0 && currentEp < userAniListInfo.progress)) {
          newStatus = 'REPEATING';
        }

        AniListAPI.saveMediaListEntry(
          Number(id), 
          newStatus, 
          currentEp, 
          token
        ).then(data => {
          if (data?.SaveMediaListEntry) {
            setUserAniListInfo(data.SaveMediaListEntry);
            setShowSyncToast(true);
            setTimeout(() => setShowSyncToast(false), 3000);
            window.dispatchEvent(new CustomEvent('anilist-sync'));
            console.log('✅ AniList Sincronizado (Modo ' + newStatus + '): EP', currentEp);
          }
        });
      }
    }
  }, [progress, isPlaying, hasSynced, userAniListInfo, id, currentEp]);

  useEffect(() => {
    if (anime && id) {
      WatchHistory.save(anime, currentEp);
    }
  }, [id, currentEp, anime]);

  // Handle non-standard PiP events via ref to satisfy TypeScript
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPiP = () => setIsPiP(true);
    const handleLeavePiP = () => setIsPiP(false);

    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, [resolvedUrl]);

  const startAutoPlay = () => {
    if (currentEp < (Number(anime?.episodes) || 0)) {
      setAutoPlayTimer(5);
    }
  };

  useEffect(() => {
    if (autoPlayTimer !== null && autoPlayTimer > 0) {
      const t = setTimeout(() => setAutoPlayTimer(autoPlayTimer - 1), 1000);
      return () => clearTimeout(t);
    } else if (autoPlayTimer === 0) {
      changeEpisode(currentEp + 1);
    }
  }, [autoPlayTimer, router, id, currentEp]);

  const slugify = (title: string) => {
    return title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase()
      .trim();
  };

  const [attemptUrls, setAttemptUrls] = useState<string[]>([]);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);

  const handleVersionChange = (newVersion: 'sub' | 'dub') => {
    setVersion(newVersion);
    if (server.startsWith('ai_')) {
      setServer('busca_ia');
    }
  };

  useEffect(() => {
    const resolvePlayer = async () => {
      if (!anime) return;
      
      setResolving(true);
      
      try {
        if (server === 'direct') {
          const titlesToTry = [anime.title];
          if (anime.titleEnglish && anime.titleEnglish !== anime.title) titlesToTry.push(anime.titleEnglish);
          if (anime.titleRomaji && anime.titleRomaji !== anime.title) titlesToTry.push(anime.titleRomaji);

          const urls: string[] = [];
          const epStr = currentEp.toString().padStart(2, '0');
          const versionPath = version === 'dub' ? `Dub/${epStr}.mp4` : `${epStr}.mp4`;

          for (const title of titlesToTry) {
            const cleanTitle = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, '').trim();
            const capitalizedSlug = cleanTitle.split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('-');
            const initial = capitalizedSlug.charAt(0).toUpperCase();
            urls.push(`https://aniplay.online/Midias/Animes/Letra-${initial}/${capitalizedSlug}/${versionPath}`);
          }
          
          setAttemptUrls(urls);
          setCurrentUrlIndex(0);
          setResolvedUrl(urls[0]);
          setIsNativeType(true);
        } else if (server === 'betterflix') {
          const url = BetterFlixAPI.generateUrl(tmdbId || id, 'tv', 1, currentEp);
          setAttemptUrls([url]);
          setCurrentUrlIndex(0);
          setResolvedUrl(url);
          setIsNativeType(false);
        } else if (server === 'anroll') {
          const results = await AnrollAPI.search(anime.title);
          const bestMatch = results[0];
          if (bestMatch?.slug) {
            const epId = await AnrollAPI.getEpisodeId(bestMatch.slug, currentEp);
            if (epId) {
              const iframe = await AnrollAPI.getPlayerIframe(epId);
              if (iframe) {
                setAttemptUrls([iframe]);
                setCurrentUrlIndex(0);
                setResolvedUrl(iframe);
                setIsNativeType(false);
              } else {
                setResolvedUrl(null);
                setIsNativeType(false);
              }
            } else {
              setResolvedUrl(null);
              setIsNativeType(false);
            }
          } else {
            setResolvedUrl(null);
            setIsNativeType(false);
          }
        } else if (server === 'feral') {
          const urls: string[] = [];
          const titlesToTry = [anime.title];
          if (anime.titleEnglish && anime.titleEnglish !== anime.title) titlesToTry.push(anime.titleEnglish);
          if (anime.titleRomaji && anime.titleRomaji !== anime.title) titlesToTry.push(anime.titleRomaji);

          for (const title of titlesToTry) {
            const slug = slugify(title);
            const dubSuffix = version === 'dub' ? '-dublado' : '-legendado';
            urls.push(`https://aigaion.feralhosting.com/bettershorts/combate/${slug}${dubSuffix}-episodio-${currentEp}.mp4`);
            urls.push(`https://aigaion.feralhosting.com/bettershorts/combate/${slug}-episodio-${currentEp}.mp4`);
          }

          setAttemptUrls(urls);
          setCurrentUrlIndex(0);
          setResolvedUrl(urls[0]);
          setIsNativeType(true);
        } else if (server === 'pixel') {
          const urls: string[] = [];
          const titlesToTry = [anime.title];
          if (anime.titleEnglish && anime.titleEnglish !== anime.title) titlesToTry.push(anime.titleEnglish);
          if (anime.titleRomaji && anime.titleRomaji !== anime.title) titlesToTry.push(anime.titleRomaji);

          const epStr = currentEp.toString().padStart(2, '0');

          for (const title of titlesToTry) {
            const slug = slugify(title);
            const firstLetter = slug.charAt(0);
            const preferred = version === 'dub' ? 'dublado' : 'legendado';
            const fallback  = version === 'dub' ? 'legendado' : 'dublado';
            // Try preferred version first, then fallback, then no suffix
            urls.push(`https://cdn-s01.pixel-sus-4k-image.com/stream/${firstLetter}/${slug}-${preferred}/${epStr}.mp4`);
            urls.push(`https://cdn-s01.pixel-sus-4k-image.com/stream/${firstLetter}/${slug}-${fallback}/${epStr}.mp4`);
            urls.push(`https://cdn-s01.pixel-sus-4k-image.com/stream/${firstLetter}/${slug}/${epStr}.mp4`);
          }

          setAttemptUrls(urls);
          setCurrentUrlIndex(0);
          setResolvedUrl(urls[0]);
          setIsNativeType(true);
        } else if (server === 'busca_ia') {
          setIsAiSearching(true);
          try {
            const res = await fetch('/api/scraper/animeplay', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: anime.title, episode: currentEp, version })
            });
            
            if (!res.ok) {
              const text = await res.text();
              throw new Error(`API retornou ${res.status}: ${text.substring(0, 50)}`);
            }
            
            const data = await res.json();
            
            if (data.players && data.players.length > 0) {
              setAiPlayers(data.players);
              // Set to the first AI player found
              setResolvedUrl(data.players[0].src);
              setIsNativeType(data.players[0].type === 'mp4' || data.players[0].type === 'm3u8');
              // Change the server dropdown to match the selected AI player
              setServer(`ai_0`); 
            } else {
              setResolvedUrl(null);
              setIsNativeType(false);
            }
          } catch (error) {
            console.error("AI Search Failed:", error);
            setResolvedUrl(null);
            setIsNativeType(false);
          } finally {
            setIsAiSearching(false);
            setResolving(false); // Make sure to stop resolving spinner
          }
        } else if (server.startsWith('ai_')) {
          // If user manually selects one of the AI found players from the dropdown
          const index = parseInt(server.replace('ai_', ''));
          if (aiPlayers[index]) {
            setResolvedUrl(aiPlayers[index].src);
            setIsNativeType(aiPlayers[index].type === 'mp4' || aiPlayers[index].type === 'm3u8');
          } else {
            setResolvedUrl(null);
            setIsNativeType(false);
          }
        } else {
          setResolvedUrl(null);
          setIsNativeType(false);
        }
      } catch (err) {
        console.error("RESOLVE_PLAYER_ERROR:", err);
        setResolvedUrl(null);
      } finally {
        setResolving(false);
      }
    };
    
    resolvePlayer();
  }, [anime, server, version, currentEp, tmdbId, id]);

  // Fetch AniSkip times
  useEffect(() => {
    async function fetchSkipTimes() {
      if (!anime?.malId || !currentEp) return;
      try {
        const res = await fetch(`https://api.aniskip.com/v2/skip-times/${anime.malId}/${currentEp}?types=op&types=ed&types=recap&episodeLength=0`);
        if (!res.ok) { setSkipTimes({}); return; }
        const data = await res.json();
        if (data.found && data.results) {
          const times: any = {};
          data.results.forEach((r: any) => {
            if (r.skipType === 'op') times.op = { start: r.interval.startTime, end: r.interval.endTime };
            if (r.skipType === 'ed') times.ed = { start: r.interval.startTime, end: r.interval.endTime };
            if (r.skipType === 'recap') times.recap = { start: r.interval.startTime, end: r.interval.endTime };
          });
          setSkipTimes(times);
        } else {
          setSkipTimes({});
        }
      } catch {
        setSkipTimes({});
      }
    }
    fetchSkipTimes();
  }, [anime, currentEp]);

  const handleVideoError = () => {
    if (currentUrlIndex < attemptUrls.length - 1) {
      const nextIndex = currentUrlIndex + 1;
      console.log(`🔄 Tentando fonte alternativa (${nextIndex + 1}/${attemptUrls.length})...`);
      setCurrentUrlIndex(nextIndex);
      setResolvedUrl(attemptUrls[nextIndex]);
    } else {
      console.error(`VIDEO_LOAD_ERROR: Todas as fontes falharam para o servidor ${server}.`);
      
      // Fallback em cascata (Waterfall)
      const fallbackChain = ['direct', 'feral', 'pixel', 'betterflix', 'anroll'];
      const currentIndex = fallbackChain.indexOf(server);
      
      if (currentIndex !== -1 && currentIndex < fallbackChain.length - 1) {
        const nextServer = fallbackChain[currentIndex + 1];
        console.log(`🔄 Alternando automaticamente para o servidor: ${nextServer.toUpperCase()}`);
        setServer(nextServer);
      } else {
        console.error('Nenhum servidor disponível funcionou.');
        setResolvedUrl(null);
      }
    }
  };

  useEffect(() => {
    if (!loading && activeEpisodeRef.current) {
      activeEpisodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [loading, currentEp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => console.log('Playback prevented:', error));
        }
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await playerContainerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Erro ao alternar tela cheia:', err);
    }
  };

  const togglePiP = async () => {
    try {
      if (videoRef.current !== document.pictureInPictureElement) {
        await videoRef.current?.requestPictureInPicture();
      } else {
        await document.exitPictureInPicture();
      }
    } catch (err) {
      console.error('Erro ao alternar Picture-in-Picture:', err);
    }
  };

  // Keyboard Shortcuts
  // Refs for keyboard shortcuts to avoid dependency array issues and excessive re-renders
  const volumeRef = useRef(volume);
  const isMutedRef = useRef(isMuted);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora atalhos se estiver digitando em campos de texto
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      
      const video = videoRef.current;
      if (!video) return;

      // Mostrar controles ao usar teclado
      handleMouseMove();

      switch(e.key.toLowerCase()) {
        case ' ': // Space
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'p':
          e.preventDefault();
          togglePiP();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          video.currentTime += 10;
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          video.currentTime -= 10;
          break;
        case 'arrowup':
          e.preventDefault();
          const newVolUp = Math.min(1, video.volume + 0.1);
          video.volume = newVolUp;
          setVolume(newVolUp);
          setIsMuted(newVolUp === 0);
          break;
        case 'arrowdown':
          e.preventDefault();
          const newVolDown = Math.max(0, video.volume - 0.1);
          video.volume = newVolDown;
          setVolume(newVolDown);
          setIsMuted(newVolDown === 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Stable dependency array



  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current && isFinite(videoRef.current.duration)) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
      setCurrentTime(formatTime(current));
      setDuration(formatTime(total));

      // Check skip times (with 2 seconds tolerance to ensure the button is visible)
      if (skipTimes.op && current >= skipTimes.op.start && current <= skipTimes.op.end + 2) {
        setActiveSkip('op');
      } else if (skipTimes.ed && current >= skipTimes.ed.start && current <= skipTimes.ed.end + 2) {
        setActiveSkip('ed');
      } else if (skipTimes.recap && current >= skipTimes.recap.start && current <= skipTimes.recap.end + 2) {
        setActiveSkip('recap');
      } else {
        setActiveSkip(null);
      }

      // Save watch progress to localStorage (if video is more than 5 seconds in and not at the very end)
      if (current > 5) {
        if (total - current < 5) {
          localStorage.removeItem(`ah_time_${id}_${currentEp}`);
        } else {
          localStorage.setItem(`ah_time_${id}_${currentEp}`, current.toString());
        }
      }
    }
  };

  // Autoplay Logic
  const handleVideoEnded = () => {
    if (!autoPlayEnabled) return;
    
    const totalEps = anime?.episodesReleased || anime?.episodes || 0;
    if (typeof totalEps === 'number' && currentEp < totalEps) {
      setAutoPlayTimer(5);
    } else if (typeof totalEps === 'string' && currentEp < parseInt(totalEps)) {
      setAutoPlayTimer(5);
    }
  };

  useEffect(() => {
    if (autoPlayTimer === null) return;
    
    if (autoPlayTimer <= 0) {
      setAutoPlayTimer(null);
      changeEpisode(currentEp + 1);
      return;
    }
    
    const interval = setInterval(() => {
      setAutoPlayTimer(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [autoPlayTimer, router, id, currentEp]);


  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current && isFinite(videoRef.current.duration)) {
      const seekTime = (Number(e.target.value) / 100) * videoRef.current.duration;
      if (isFinite(seekTime)) {
        videoRef.current.currentTime = seekTime;
        setProgress(Number(e.target.value));
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      setVolume(newVol);
      setIsMuted(newVol === 0);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const handleProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      const dur = videoRef.current.duration;
      if (isFinite(dur) && dur > 0) setBuffered((bufferedEnd / dur) * 100);
    }
  };

  const handleSeekHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !isFinite(videoRef.current.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = ratio * videoRef.current.duration;
    setSeekTooltip({ visible: true, time: formatTime(time), x: (e.clientX - rect.left) });
  };

  const handleSeekLeave = () => setSeekTooltip(s => ({ ...s, visible: false }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!anime) return <div className="text-white p-20 text-center font-black uppercase tracking-widest">Anime não encontrado.</div>;

  return (
    <div className={`flex flex-col min-h-screen relative overflow-hidden transition-colors duration-700 ${cinemaMode ? 'bg-black' : 'bg-[#05080f]'}`}>
      
      {/* Dynamic Blurred Background */}
      {!cinemaMode && anime.banner && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-[100px]"
            style={{ backgroundImage: `url(${anime.banner})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05080f]/50 via-[#05080f] to-[#05080f]" />
        </div>
      )}

      {/* Cinema Mode Overlay */}
      {cinemaMode && (
        <div className="fixed inset-0 bg-black z-40 pointer-events-none opacity-95 transition-opacity" />
      )}

      {/* Sync Toast Notification */}
      {showSyncToast && (
        <div className="fixed top-24 right-8 z-[200] bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-emerald-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-right-10 duration-500">
          <i className="fa-solid fa-circle-check text-base"></i>
          AniList Sincronizado: Episódio {currentEp}
        </div>
      )}

      <div className="container mx-auto px-4 lg:px-8 py-8 flex-grow relative z-50">
        {/* Player Header */}
        <div className={`mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 transition-all duration-500 ${cinemaMode ? 'opacity-20 translate-y-[-10px] hover:opacity-100 hover:translate-y-0' : 'opacity-100'}`}>
          <div>
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
              <Link href={`/anime/${id}`} className="hover:text-blue-500 transition-colors">{anime.title}</Link>
            </div>
            <h1 className="text-lg md:text-4xl font-black text-white uppercase tracking-tighter flex flex-wrap items-center gap-2 md:gap-4">
              <span className="truncate max-w-[70vw] md:max-w-none">{anime.title}</span>
              <span className="text-blue-500 font-black px-2 md:px-3 py-1 bg-blue-500/10 rounded-xl text-sm md:text-base border border-blue-500/20">EP {currentEp.toString().padStart(2, '0')}</span>
            </h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Player Area */}
          <div className="lg:col-span-3">
            <div 
              ref={playerContainerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => isPlaying && setShowControls(false)}
              className={`relative aspect-video bg-black rounded-3xl overflow-hidden border border-white/5 transition-all duration-700 shadow-2xl group ${cinemaMode ? 'scale-[1.02] ring-4 ring-blue-600/20' : ''}`}
            >
              {(resolving || isAiSearching) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md z-20 animate-in fade-in duration-300">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse" />
                    {isAiSearching && <i className="fa-solid fa-robot absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 text-xs animate-bounce" />}
                  </div>
                  <p className="mt-4 text-[9px] font-black text-white uppercase tracking-[0.3em] opacity-80 text-center px-4">
                    {isAiSearching ? 'IA Vasculhando a Web por Players...' : 'Trocando Episódio...'}
                  </p>
                </div>
              )}
              
              {resolvedUrl ? (
                isNativeType ? (
                  <>
                    <video 
                      ref={videoRef}
                      key={`${resolvedUrl}-${version}`}
                      src={resolvedUrl} 
                      className="w-full h-full object-contain"
                      poster={anime.banner || anime.poster}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={(e) => {
                        e.currentTarget.volume = volume;
                        e.currentTarget.muted = isMuted;
                        e.currentTarget.playbackRate = playbackSpeed;
                        
                        // Resume from saved time
                        const savedTime = localStorage.getItem(`ah_time_${id}_${currentEp}`);
                        if (savedTime) {
                          const time = parseFloat(savedTime);
                          // Only resume if it's less than the duration
                          if (time > 0 && time < e.currentTarget.duration - 5) {
                            e.currentTarget.currentTime = time;
                          }
                        }
                      }}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onClick={togglePlay}
                      onProgress={handleProgress}
                      onError={handleVideoError}
                      onEnded={handleVideoEnded}
                    />
                    
                    {/* ═══ CINEMA HUD CONTROLS ═══ */}
                    <div 
                      className={`absolute inset-0 flex flex-col justify-end transition-all duration-500 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0 cursor-none'}`}
                    >

                      {/* Gradient Fade */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                      {/* Skip Intro/Outro Button */}
                      {activeSkip && (
                        <div className="absolute bottom-28 right-8 z-[100] animate-in slide-in-from-right-8 fade-in duration-300">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (videoRef.current && skipTimes[activeSkip]) {
                                videoRef.current.currentTime = skipTimes[activeSkip]!.end;
                              }
                            }}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-white font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 pointer-events-auto"
                          >
                            {activeSkip === 'op' ? 'Pular Abertura' : activeSkip === 'ed' ? 'Pular Encerramento' : 'Pular Recapitulação'}
                            <i className="fa-solid fa-forward-step"></i>
                          </button>
                        </div>
                      )}

                      {/* Autoplay Overlay */}
                      {autoPlayTimer !== null && (
                        <div className="absolute inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                          <h3 className="text-3xl font-bold text-white mb-2">Próximo Episódio em</h3>
                          <div className="text-[120px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-12 animate-pulse">
                            {autoPlayTimer}
                          </div>
                          <div className="flex items-center gap-6">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAutoPlayTimer(null);
                                changeEpisode(currentEp + 1);
                              }}
                              className="px-10 py-4 bg-white text-black font-black rounded-full hover:bg-gray-200 transition-colors flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 text-lg"
                            >
                              <i className="fa-solid fa-play"></i> Assistir Agora
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAutoPlayTimer(null);
                              }}
                              className="px-10 py-4 bg-white/5 text-white font-bold rounded-full hover:bg-white/10 transition-colors border border-white/10 hover:scale-105 active:scale-95 text-lg"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Center Play/Pause Overlay */}
                      {!isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-white/10 animate-ping scale-150" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePlay();
                              }}
                              className="relative w-20 h-20 bg-white/15 hover:bg-white/25 text-white rounded-full flex items-center justify-center border border-white/30 transition-all hover:scale-110 active:scale-95 pointer-events-auto backdrop-blur-sm"
                            >
                              <i className="fa-solid fa-play text-2xl ml-1"></i>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Controls Bar */}
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 px-6 pb-5 flex flex-col gap-3 pointer-events-auto"
                      >

                        {/* Progress Bar Row */}
                        <div
                          className="relative h-5 flex items-center group/progress cursor-pointer"
                          onMouseMove={handleSeekHover}
                          onMouseLeave={handleSeekLeave}
                        >
                          {/* Seek Tooltip */}
                          {seekTooltip.visible && (
                            <div
                              className="absolute -top-8 bg-black/90 text-white text-[10px] font-black px-2 py-1 rounded-md pointer-events-none z-20 -translate-x-1/2 whitespace-nowrap"
                              style={{ left: seekTooltip.x }}
                            >
                              {seekTooltip.time}
                            </div>
                          )}
                          {/* Track */}
                          <div className="w-full h-1 group-hover/progress:h-2 bg-white/15 rounded-full overflow-hidden transition-all duration-200 relative">
                            {/* Buffer */}
                            <div className="absolute inset-y-0 left-0 bg-white/20 rounded-full transition-all duration-300" style={{ width: `${buffered}%` }} />
                            {/* Played */}
                            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-100 z-10" style={{ width: `${progress}%` }}>
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(99,210,255,1)] scale-0 group-hover/progress:scale-100 transition-transform z-20" />
                            </div>
                          </div>
                          {/* Invisible range input */}
                          <input
                            type="range" min="0" max="100" value={progress}
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                          />
                        </div>

                        {/* Bottom Controls Row */}
                        <div className="flex items-center justify-between gap-2">

                          {/* LEFT GROUP */}
                          <div className="flex items-center gap-2">

                            {/* Play/Pause */}
                            <button
                              onClick={togglePlay}
                              className="w-10 h-10 flex items-center justify-center text-white hover:text-cyan-400 transition-all active:scale-90"
                            >
                              <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-lg`}></i>
                            </button>

                            {/* Skip -10 */}
                            <button
                              onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }}
                              className="flex items-center gap-1 px-2 sm:px-3 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white text-[9px] sm:text-[10px] font-black transition-all active:scale-90 border border-white/5"
                            >
                              <i className="fa-solid fa-backward text-[8px]"></i> <span className="hidden sm:inline">10s</span>
                            </button>

                            {/* Skip +10 */}
                            <button
                              onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }}
                              className="flex items-center gap-1 px-2 sm:px-3 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white text-[9px] sm:text-[10px] font-black transition-all active:scale-90 border border-white/5"
                            >
                              <span className="hidden sm:inline">10s</span> <i className="fa-solid fa-forward text-[8px]"></i>
                            </button>

                            {/* Volume */}
                            <div className="flex items-center gap-2 ml-1 sm:ml-2">
                              <button onClick={toggleMute} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90">
                                <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : volume < 0.4 ? 'fa-volume-off' : volume < 0.7 ? 'fa-volume-low' : 'fa-volume-high'} text-sm`}></i>
                              </button>
                              <input
                                type="range" min="0" max="1" step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="hidden sm:block w-20 h-1 appearance-none bg-white/20 rounded-full cursor-pointer accent-cyan-400"
                              />
                            </div>

                            {/* Time */}
                            <div className="text-[9px] sm:text-[11px] font-mono text-white/60 ml-1 sm:ml-2 flex items-center gap-1">
                              <span className="text-white">{currentTime}</span>
                              <span className="opacity-30">/</span>
                              <span>{duration}</span>
                            </div>
                          </div>

                          {/* RIGHT GROUP */}
                          <div className="flex items-center gap-2">

                            {/* Prev Episode */}
                            {currentEp > 1 && (
                              <button
                                onClick={() => changeEpisode(currentEp - 1)}
                                className="flex items-center gap-1 px-2 sm:px-3 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white text-[9px] sm:text-[10px] font-black transition-all active:scale-90 border border-white/5 flex-shrink-0"
                              >
                                <i className="fa-solid fa-backward-step text-[10px]"></i> <span className="hidden sm:inline">EP </span>{currentEp - 1}
                              </button>
                            )}

                            {/* Next Episode */}
                            {currentEp < (Number(anime.episodes) || 9999) && (
                              <button
                                onClick={() => changeEpisode(currentEp + 1)}
                                className="flex items-center gap-1 px-2 sm:px-3 h-8 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 text-[9px] sm:text-[10px] font-black transition-all active:scale-90 border border-cyan-500/30 flex-shrink-0"
                              >
                                <span className="hidden sm:inline">EP </span>{currentEp + 1} <i className="fa-solid fa-forward-step text-[10px]"></i>
                              </button>
                            )}

                            {/* Speed */}
                            <select
                              value={playbackSpeed}
                              onChange={(e) => handleSpeedChange(Number(e.target.value))}
                              className="block h-8 px-1 sm:px-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 text-[9px] sm:text-[10px] font-black cursor-pointer focus:outline-none transition-all"
                            >
                              {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                                <option key={s} value={s} className="bg-slate-900">{s}x</option>
                              ))}
                            </select>

                            {/* Cinema Mode */}
                            <button
                              onClick={() => setCinemaMode(!cinemaMode)}
                              className={`hidden sm:flex w-8 h-8 items-center justify-center rounded-lg border transition-all active:scale-90 text-xs ${cinemaMode ? 'bg-blue-500/30 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-white/60 hover:text-white'}`}
                              title="Modo Cinema"
                            >
                              <i className="fa-solid fa-film"></i>
                            </button>

                            {/* Picture in Picture */}
                            {typeof document !== 'undefined' && document.pictureInPictureEnabled && (
                              <button
                                onClick={togglePiP}
                                className={`hidden sm:flex w-8 h-8 items-center justify-center rounded-lg border transition-all active:scale-90 text-xs ${isPiP ? 'bg-blue-500/30 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-white/60 hover:text-white'}`}
                                title="Picture in Picture"
                              >
                                <i className="fa-solid fa-clone"></i>
                              </button>
                            )}

                            {/* Fullscreen */}
                            <button
                              onClick={toggleFullscreen}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white transition-all active:scale-90 text-xs"
                            >
                              <i className="fa-solid fa-expand"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <iframe
                    key={`${resolvedUrl}-${version}`}
                    src={resolvedUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    referrerPolicy="no-referrer"
                  />
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-6 bg-slate-900/50 backdrop-blur-xl">
                  <div className="w-24 h-24 rounded-full bg-slate-950 flex items-center justify-center border border-white/5 shadow-inner">
                    <i className="fa-solid fa-ghost text-5xl text-slate-600"></i>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-white uppercase tracking-[0.4em] mb-2">Episódio Indisponível</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest max-w-[200px] leading-loose text-center mx-auto">Este episódio ainda não foi lançado ou não está mapeado no momento.</p>
                  </div>
                </div>
              )}

              {/* AutoPlay Timer Overlay */}
              {autoPlayTimer !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl z-50">
                  <div className="text-center scale-up-center">
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.5em] mb-8">Próxima maratona inicia em</p>
                    <div className="text-9xl font-black text-blue-500 mb-12 drop-shadow-[0_0_30px_rgba(59,130,246,0.6)] animate-pulse">{autoPlayTimer}</div>
                    <button 
                      onClick={() => setAutoPlayTimer(null)}
                      className="px-12 py-5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-2xl text-white hover:text-red-500 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                    >
                      Interromper
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Info & Main Controls Area */}
            <div className="mt-8 flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Title & Info */}
                  <div className="flex items-center gap-4">
                    <Link 
                      href={`/anime/${id}`}
                      className="group relative flex-shrink-0"
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/30 group-hover:border-blue-500 transition-all shadow-xl">
                        <img 
                          src={anime.poster} 
                          alt={anime.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-transparent transition-colors"></div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[#0a0f1a] shadow-lg">
                        <i className="fa-solid fa-check text-[8px] text-white"></i>
                      </div>
                    </Link>
                    <div className="flex flex-col">
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1 opacity-70">Série Verificada</p>
                      <Link href={`/anime/${id}`} className="text-sm font-black text-white uppercase tracking-tighter hover:text-blue-400 transition-colors">
                        {anime.title}
                      </Link>
                    </div>
                  </div>

                {/* Inline Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative group">
                    <select 
                      value={server}
                      onChange={(e) => setServer(e.target.value)}
                      className="appearance-none bg-[#161f2e] border border-white/5 rounded-xl px-3 md:px-5 py-2.5 md:py-3 pr-8 md:pr-10 text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest focus:outline-none focus:border-blue-500 transition-all cursor-pointer hover:bg-[#1c2638] w-full min-w-0"
                    >
                      {[
                        { id: 'direct', label: 'SERVIDOR 1 (ANIMEPLAY)' },
                        { id: 'feral', label: 'SERVIDOR 2 (FERAL MP4)' },
                        { id: 'pixel', label: 'SERVIDOR 3 (SUSHI 4K)' },
                        { id: 'betterflix', label: 'SERVIDOR 4 (EXTERNO)' },
                        { id: 'anroll', label: 'SERVIDOR 5 (ANROLL)' },
                        { id: 'busca_ia', label: '🤖 SERVIDOR 6 (BUSCA IA)' },
                        // Add dynamically found AI players
                        ...aiPlayers.map((player, index) => ({
                           id: `ai_${index}`,
                           label: `IA - ${player.name.toUpperCase()}`
                        }))
                      ].map(srv => (
                        <option key={srv.id} value={srv.id}>{srv.label}</option>
                      ))}
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[8px] text-slate-500 pointer-events-none"></i>
                  </div>

                  {/* LEG/DUB Toggle */}
                  <div className="flex bg-[#161f2e] p-1 rounded-xl border border-white/5">
                    <button
                      onClick={() => handleVersionChange('sub')}
                      className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${version === 'sub' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      LEG
                    </button>
                    <button
                      onClick={() => handleVersionChange('dub')}
                      className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${version === 'dub' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      DUB
                    </button>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changeEpisode(currentEp - 1)}
                      className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3 bg-[#161f2e] hover:bg-[#1c2638] border border-white/5 rounded-xl text-[9px] md:text-[10px] font-black text-white uppercase transition-all ${currentEp <= 1 ? 'opacity-20 pointer-events-none' : ''}`}
                    >
                      <i className="fa-solid fa-chevron-left text-[8px]"></i>
                      Anterior
                    </button>
                    <button
                      onClick={startAutoPlay}
                      className={`flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-[9px] md:text-[10px] font-black text-white uppercase transition-all shadow-lg shadow-blue-600/20 ${currentEp >= (Number(anime.episodes) || 0) ? 'opacity-20 pointer-events-none' : ''}`}
                    >
                      Próximo
                      <i className="fa-solid fa-chevron-right text-[8px]"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="mt-4 pt-6 md:pt-8 border-t border-white/5 flex flex-wrap items-center gap-4 md:gap-8">
                <button 
                  onClick={() => setCinemaMode(!cinemaMode)}
                  className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all group ${cinemaMode ? 'text-amber-500' : 'text-slate-500 hover:text-amber-500'}`}
                >
                  <i className={`fa-solid ${cinemaMode ? 'fa-lightbulb' : 'fa-moon'} text-xs group-hover:rotate-12 transition-transform`}></i>
                  {cinemaMode ? 'Ligar Luzes' : 'Apagar Luzes'}
                </button>
                <button 
                  onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                  className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all group ${autoPlayEnabled ? 'text-emerald-500' : 'text-slate-500 hover:text-emerald-500'}`}
                >
                  <i className={`fa-solid fa-forward-step text-xs group-hover:translate-x-0.5 transition-transform ${!autoPlayEnabled && 'opacity-50'}`}></i>
                  Autoplay: {autoPlayEnabled ? 'ON' : 'OFF'}
                </button>
                <button className="flex items-center gap-3 text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest group">
                  <i className="fa-solid fa-download text-xs group-hover:-translate-y-0.5 transition-transform"></i>
                  Baixar
                </button>
                <button className="flex items-center gap-3 text-[10px] font-black text-slate-500 hover:text-red-500 transition-all uppercase tracking-widest group">
                  <i className="fa-solid fa-flag text-xs group-hover:shake transition-all"></i>
                  Reportar
                </button>
                <button className="flex items-center gap-3 text-[10px] font-black text-slate-500 hover:text-emerald-500 transition-all uppercase tracking-widest group">
                  <i className="fa-solid fa-share-nodes text-xs group-hover:rotate-12 transition-transform"></i>
                  Compartilhar
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Episodes */}
          <div className="lg:col-span-1">
            <div className={`bg-[#0f1524] border border-white/5 rounded-3xl h-auto max-h-[50vh] lg:h-[75vh] lg:max-h-none flex flex-col transition-all duration-700 shadow-2xl ${cinemaMode ? 'opacity-10 hover:opacity-100 translate-x-4 hover:translate-x-0' : ''}`}>
              <div className="p-6 border-b border-white/5 space-y-6">
                <AddToList 
                  animeId={Number(anime.id)} 
                  totalEpisodes={Number(anime.episodesReleased) || Number(anime.episodes)} 
                />
                <div className="flex items-center gap-4">
                  <i className="fa-solid fa-list-ul text-blue-500 text-sm"></i>
                  <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-white">Episódios</h3>
                </div>
              </div>
<div 
                ref={episodesContainerRef}
                className="flex-grow overflow-y-auto p-4 space-y-1 custom-scrollbar"
              >
                {(() => {
                  // Calcular progresso local uma vez fora do loop
                  const localHistory = WatchHistory.getAll();
                  const localItem = localHistory.find(h => String(h.id) === String(anime.id));
                  const localProgress = localItem?.episode || 0;
                  const aniListProgress = Number(userAniListInfo?.progress || 0);
                  const effectiveProgress = Math.max(aniListProgress, localProgress);
                  const isCompleted = userAniListInfo?.status === 'COMPLETED';

                  return Array.from({ length: Number(anime.episodesReleased) || Number(anime.episodes) || 1 }).map((_, i) => {
                  const epNum = i + 1;
                  const isItemActive = Number(activeEp) === epNum;
                  const isWatched = isCompleted || epNum <= effectiveProgress;
                  const epData = anime.streamingEpisodes?.[i];

                  return (
                    <div
                      key={i}
                      onClick={() => changeEpisode(epNum)}
                      ref={isItemActive ? activeEpisodeRef : null}
                      className={`flex items-center gap-4 p-3 rounded-2xl transition-all group border cursor-pointer ${
                        isItemActive 
                          ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                          : isWatched
                            ? 'bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10'
                            : 'hover:bg-white/5 border-transparent'
                      }`}
                    >
                      {/* Mini Thumbnail */}
                      <div className="relative w-20 aspect-video rounded-lg overflow-hidden bg-slate-900 flex-shrink-0 border border-white/5 shadow-md">
                        {epData?.thumbnail ? (
                          <img 
                            src={epData.thumbnail} 
                            alt={`EP ${epNum}`} 
                            className={`w-full h-full object-cover transition-transform duration-500 ${isItemActive ? 'scale-110 brightness-110' : 'brightness-75 group-hover:brightness-100 group-hover:scale-105'}`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800">
                            <span className="text-[10px] font-black text-slate-600">{epNum}</span>
                          </div>
                        )}
                        
                        {isItemActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-blue-600/40">
                            <i className="fa-solid fa-play text-[10px] text-white animate-pulse"></i>
                          </div>
                        )}

                        {isWatched && !isItemActive && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                            <i className="fa-solid fa-check text-[7px] text-white"></i>
                          </div>
                        )}
                      </div>

                      <div className="flex-grow min-w-0">
                        <h4 className={`text-[10px] font-black tracking-tight truncate transition-colors ${
                          isItemActive ? 'text-white' : isWatched ? 'text-emerald-400' : 'text-slate-400'
                        } group-hover:text-white`}>
                          EP {epNum.toString().padStart(2, '0')} - {epData?.title || 'Sem título'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-[8px] font-black uppercase tracking-[0.1em] ${
                            isItemActive ? 'text-blue-400' : isWatched ? 'text-emerald-500/50' : 'text-slate-600'
                          }`}>
                            {version === 'dub' ? 'Dub PT-BR' : 'Leg PT-BR'}
                          </p>
                          {isItemActive && (
                            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] animate-pulse" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
                })()}
              </div>

              <div className="p-4 border-t border-white/5 bg-slate-950/30">
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em] text-center">Você está assistindo agora</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        {anime.recommendations && anime.recommendations.length > 0 && (
          <section className="mt-32">
            <div className="flex flex-col mb-12 relative">
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-600 rounded-full hidden lg:block shadow-[0_0_20px_rgba(37,99,235,0.5)]"></div>
              <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.5em] mb-3 ml-1 block opacity-70">Descoberta</span>
              <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                Você também pode gostar
                <span className="text-blue-600">.</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {anime.recommendations.slice(0, 6).map((rec: any, idx: number) => (
                <Link 
                  key={rec.id} 
                  href={`/anime/${rec.id}`} 
                  className="group relative flex flex-col transition-all duration-500 hover:-translate-y-3"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden border border-white/5 group-hover:border-blue-500/30 transition-all duration-500 shadow-2xl">
                    <img 
                      src={rec.poster} 
                      alt={rec.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
                    />
                    
                    {/* Glass Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-90 transition-all duration-500"></div>
                    
                    {/* Quick Info Badge */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 translate-y-[-20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                      <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-xl">
                        {rec.type || 'TV'}
                      </span>
                    </div>

                    {/* Content on card bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h4 className="text-white text-[11px] font-black uppercase tracking-tight line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
                        {rec.title}
                      </h4>
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                        <div className="flex items-center gap-1">
                          <i className="fa-solid fa-star text-amber-400 text-[8px]"></i>
                          <span className="text-[9px] font-black text-white">{rec.rating}</span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{rec.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Exterior Glow on Hover */}
                  <div className="absolute -inset-2 bg-blue-600/20 blur-2xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10"></div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
