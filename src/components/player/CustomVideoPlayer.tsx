'use client';

import { useEffect, useRef } from 'react';
import Artplayer from 'artplayer';
import { SkipTime } from '@/lib/aniskip';

interface CustomVideoPlayerProps {
  url: string;
  title?: string;
  poster?: string;
  onEnded?: () => void;
  aniskip?: SkipTime[];
}

export default function CustomVideoPlayer({ url, title, poster, onEnded, aniskip }: CustomVideoPlayerProps) {
  const artRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!artRef.current) return;

    // Converte os intervalos de pulo para as marcações de progresso do Artplayer
    const highlight = aniskip?.map((skip) => ({
      time: skip.interval.startTime,
      text: skip.skipType === 'op' ? 'Abertura' : 'Encerramento',
    })) || [];

    const art = new Artplayer({
      container: artRef.current,
      url,
      title: title || '',
      poster: poster || '',
      theme: '#3b82f6', // blue-500
      volume: 1,
      isLive: false,
      muted: false,
      autoplay: true,
      pip: true,
      autoSize: false,
      autoMini: true,
      screenshot: true,
      setting: true,
      loop: false,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      subtitleOffset: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: true,
      airplay: true,
      highlight,
      controls: [
        {
          name: 'skip-button',
          position: 'right',
          html: '<div class="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-sm font-bold rounded-lg transition-all shadow-lg flex items-center gap-2"><i class="fa-solid fa-forward-step"></i> Pular Abertura</div>',
          index: 1,
          style: {
            marginRight: '20px',
            marginBottom: '60px',
            display: 'none', // oculto por padrao
          },
          click: function () {
            if (art) {
              const currentSkip = aniskip?.find(
                (s) => art.currentTime >= s.interval.startTime && art.currentTime <= s.interval.endTime
              );
              if (currentSkip) {
                art.seek = currentSkip.interval.endTime;
              }
            }
          },
        },
      ],
    });

    // Lógica para mostrar/esconder o botão de pular abertura
    art.on('video:timeupdate', () => {
      const currentTime = art.currentTime;
      const shouldShowSkip = aniskip?.some(
        (skip) => currentTime >= skip.interval.startTime && currentTime <= skip.interval.endTime
      );
      
      if (art.controls['skip-button']) {
        art.controls['skip-button'].style.display = shouldShowSkip ? 'block' : 'none';
      }
    });

    if (onEnded) {
      art.on('video:ended', onEnded);
    }

    return () => {
      if (art && art.destroy) {
        art.destroy(false);
      }
    };
  }, [url, title, poster, aniskip, onEnded]);

  return <div ref={artRef} className="w-full h-full" />;
}
