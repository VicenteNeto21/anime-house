'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { SkipTime } from '@/lib/aniskip';

interface CustomVideoPlayerProps {
  url: string;
  title?: string;
  poster?: string;
  onEnded?: () => void;
  aniskip?: SkipTime[];
}

export default function CustomVideoPlayer({ url, title, poster, onEnded, aniskip }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [showSkip, setShowSkip] = useState(false);
  const [skipTarget, setSkipTarget] = useState<number>(0);
  const [skipText, setSkipText] = useState('Pular Abertura');

  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  const aniskipRef = useRef<SkipTime[] | undefined>(aniskip);
  useEffect(() => {
    aniskipRef.current = aniskip;
  }, [aniskip]);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    
    // Inicializa o Plyr
    const player = new Plyr(video, {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'duration',
        'mute',
        'volume',
        'settings',
        'pip',
        'airplay',
        'fullscreen',
      ],
      settings: ['quality', 'speed'],
      keyboard: { focused: true, global: true },
      tooltips: { controls: true, seek: true },
      i18n: {
        speed: 'Velocidade',
        normal: 'Normal',
        quality: 'Qualidade',
      }
    });
    
    playerRef.current = player;

    // HLS Support
    if (url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      }
    } else {
      video.src = url;
    }

    // Eventos
    player.on('ended', () => {
      if (onEndedRef.current) onEndedRef.current();
    });

    player.on('timeupdate', () => {
      const currentAniskip = aniskipRef.current;
      if (!currentAniskip) {
        setShowSkip(false);
        return;
      }
      
      const currentTime = player.currentTime;
      const currentSkip = currentAniskip.find(
        (skip) => currentTime >= skip.interval.startTime && currentTime <= skip.interval.endTime
      );
      
      if (currentSkip) {
        setSkipTarget(currentSkip.interval.endTime);
        setSkipText(currentSkip.skipType === 'op' ? 'Pular Abertura' : 'Pular Encerramento');
        setShowSkip(true);
      } else {
        setShowSkip(false);
      }
    });

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (player) {
        player.destroy();
      }
    };
  }, [url, poster]); // Não colocar 'aniskip' aqui para evitar destruir o player!

  const handleSkip = () => {
    if (playerRef.current && skipTarget > 0) {
      playerRef.current.currentTime = skipTarget;
      setShowSkip(false);
    }
  };

  return (
    <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl group">
      <style>{`
        /* Tema exato da foto (Plyr Clássico em tons de branco) */
        :root {
          --plyr-color-main: #ffffff;
          --plyr-video-control-color: #d1d5db;
          --plyr-video-control-color-hover: #ffffff;
          --plyr-video-control-background-hover: transparent;
        }
        
        .plyr {
          height: 100%;
          border-radius: 16px;
          font-family: inherit;
        }
        
        /* Ajuste do fundo dos controles para não ser tão escuro e ficar elegante */
        .plyr__controls {
          background: linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%) !important;
          padding-bottom: 20px !important;
        }
        
        /* Ajustando as cores do menu de qualidade */
        .plyr__menu__container {
          background: rgba(15, 23, 42, 0.95) !important;
          border-radius: 8px !important;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .plyr__menu__container .plyr__control {
          color: white !important;
        }
        .plyr__menu__container .plyr__control:hover {
          background: rgba(255,255,255,0.1) !important;
        }
        .plyr__menu__container [role="menuitemradio"][aria-checked="true"]::before {
          background: #ffffff !important;
        }
      `}</style>
      
      <video
        ref={videoRef}
        playsInline
        data-poster={poster}
        className="w-full h-full"
      />
      
      {/* Botão flutuante de pular abertura */}
      {showSkip && (
        <button
          onClick={handleSkip}
          className="absolute bottom-24 right-8 z-50 px-4 py-2 bg-black/60 hover:bg-white text-white hover:text-black border border-white/20 rounded-md font-semibold text-sm transition-all backdrop-blur-sm flex items-center gap-2 shadow-xl"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polygon points="5 4 15 12 5 20 5 4"></polygon>
            <line x1="19" y1="5" x2="19" y2="19"></line>
          </svg>
          {skipText}
        </button>
      )}
    </div>
  );
}
