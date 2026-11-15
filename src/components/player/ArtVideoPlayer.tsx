'use client';

import { useEffect, useRef, useState } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
// @ts-ignore
import artplayerPluginHlsQualityRaw from 'artplayer-plugin-hls-quality';
import { SkipTime } from '@/lib/aniskip';

const hlsQualityPlugin = (artplayerPluginHlsQualityRaw as any)?.default || artplayerPluginHlsQualityRaw;

export interface ArtVideoPlayerProps {
  url: string;
  title?: string;
  poster?: string;
  onEnded?: () => void;
  aniskip?: SkipTime[];
  autoPlay?: boolean;
  className?: string;
}

export default function ArtVideoPlayer({
  url,
  title,
  poster,
  onEnded,
  aniskip,
  autoPlay = false,
  className = '',
}: ArtVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Artplayer | null>(null);
  const wakeLockRef = useRef<any>(null);
  const onEndedRef = useRef(onEnded);
  const aniskipRef = useRef<SkipTime[] | undefined>(aniskip);
  const currentSkipTargetRef = useRef<number>(0);

  // Skip button state for React overlay fallback or layer update
  const [skipInfo, setSkipInfo] = useState<{ visible: boolean; label: string; target: number }>({
    visible: false,
    label: 'Pular Abertura',
    target: 0,
  });

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    aniskipRef.current = aniskip;
  }, [aniskip]);

  useEffect(() => {
    if (!containerRef.current) return;

    const isM3U8 = url.includes('.m3u8');

    // Build timeline highlights for OP / ED intervals
    const highlights = (aniskipRef.current || []).map((s) => ({
      time: Math.max(0, Math.floor(s.interval.startTime)),
      text: s.skipType === 'op' ? 'Abertura (OP)' : 'Encerramento (ED)',
    }));

    // Wake Lock handlers
    const requestWakeLock = async () => {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && !wakeLockRef.current) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch {
          // Wake lock unavailable or denied
        }
      }
    };

    const releaseWakeLock = () => {
      if (wakeLockRef.current) {
        try {
          wakeLockRef.current.release();
        } catch {
          // Ignored
        }
        wakeLockRef.current = null;
      }
    };

    // Plugins list
    const plugins: any[] = [];
    if (isM3U8 && typeof hlsQualityPlugin === 'function') {
      try {
        plugins.push(
          hlsQualityPlugin({
            control: true,
            setting: true,
            getResolution: (level: any) => (level?.height ? `${level.height}p` : 'Auto'),
            title: 'Qualidade',
            auto: 'Automático',
          })
        );
      } catch (err) {
        console.warn('HLS Quality plugin registration failed:', err);
      }
    }

    // Initialize Artplayer
    const art = new Artplayer({
      container: containerRef.current,
      url,
      poster: poster || '',
      volume: 0.8,
      isLive: false,
      muted: false,
      autoplay: autoPlay,
      pip: true,
      autoSize: false,
      autoMini: false,
      screenshot: true,
      setting: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      miniProgressBar: true,
      hotkey: true,
      playsInline: true,
      lock: true,
      fastForward: true,
      autoOrientation: true,
      airplay: true,
      theme: '#2563eb',
      lang: 'pt',
      highlight: highlights,
      plugins,
      customType: {
        m3u8: (video: HTMLVideoElement, m3u8Url: string, artInstance: any) => {
          if (Hls.isSupported()) {
            if (artInstance.hls) {
              artInstance.hls.destroy();
            }
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90,
            });
            hls.loadSource(m3u8Url);
            hls.attachMedia(video);
            artInstance.hls = hls;
            artInstance.on('destroy', () => {
              hls.destroy();
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = m3u8Url;
          } else {
            artInstance.notice.show = 'Formato HLS não suportado neste navegador.';
          }
        },
      },
      layers: [
        {
          name: 'aniskip-layer',
          html: `
            <div id="art-aniskip-wrapper" style="display: none; position: absolute; bottom: 70px; right: 20px; z-index: 40;">
              <button id="art-aniskip-btn" style="
                display: flex;
                align-items: center;
                gap: 8px;
                background: linear-gradient(135deg, rgba(37,99,235,0.95), rgba(29,78,216,0.9));
                border: 1px solid rgba(255,255,255,0.25);
                color: #ffffff;
                font-family: inherit;
                font-size: 11px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                padding: 8px 16px;
                border-radius: 12px;
                cursor: pointer;
                box-shadow: 0 10px 25px -5px rgba(0,0,0,0.6), 0 0 15px rgba(37,99,235,0.4);
                backdrop-filter: blur(8px);
                transition: transform 0.15s ease, background 0.15s ease;
              ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="5 4 15 12 5 20 5 4"></polygon>
                  <line x1="19" y1="5" x2="19" y2="19"></line>
                </svg>
                <span id="art-aniskip-text">Pular Abertura</span>
              </button>
            </div>
          `,
          click: function () {
            if (currentSkipTargetRef.current > 0) {
              art.currentTime = currentSkipTargetRef.current;
              art.notice.show = 'Pulo realizado!';
              const wrapper = containerRef.current?.querySelector('#art-aniskip-wrapper') as HTMLElement;
              if (wrapper) wrapper.style.display = 'none';
              setSkipInfo({ visible: false, label: '', target: 0 });
            }
          },
        },
      ],
    });

    // Portuguese Translations
    art.i18n.update({
      pt: {
        Play: 'Reproduzir',
        Pause: 'Pausar',
        Volume: 'Volume',
        Mute: 'Silenciar',
        Fullscreen: 'Tela Cheia',
        'Exit Fullscreen': 'Sair da Tela Cheia',
        'Web Fullscreen': 'Modo Teatro',
        'Exit Web Fullscreen': 'Sair do Modo Teatro',
        'Mini Player': 'Mini Player',
        'PIP Mode': 'Picture-in-Picture',
        'Exit PIP Mode': 'Sair do PiP',
        Screenshot: 'Capturar Tela',
        'Play Speed': 'Velocidade',
        'Aspect Ratio': 'Proporção',
        Default: 'Padrão',
        Normal: 'Normal',
        'Video Load Failed': 'Falha ao carregar o vídeo',
        Close: 'Fechar',
        Reconnect: 'Reconectando...',
      },
    } as any);

    playerRef.current = art;

    // Wake Lock events
    art.on('video:play', requestWakeLock);
    art.on('video:pause', releaseWakeLock);

    // End event
    art.on('video:ended', () => {
      releaseWakeLock();
      if (onEndedRef.current) {
        onEndedRef.current();
      }
    });

    // AniSkip monitor
    art.on('video:timeupdate', () => {
      const currentSkips = aniskipRef.current;
      const wrapper = containerRef.current?.querySelector('#art-aniskip-wrapper') as HTMLElement;
      const textSpan = containerRef.current?.querySelector('#art-aniskip-text') as HTMLElement;

      if (!currentSkips || currentSkips.length === 0) {
        if (wrapper) wrapper.style.display = 'none';
        setSkipInfo({ visible: false, label: '', target: 0 });
        currentSkipTargetRef.current = 0;
        return;
      }

      const currentTime = art.currentTime;
      const activeSkip = currentSkips.find(
        (skip) => currentTime >= skip.interval.startTime && currentTime <= skip.interval.endTime
      );

      if (activeSkip) {
        const label = activeSkip.skipType === 'op' ? 'Pular Abertura' : 'Pular Encerramento';
        currentSkipTargetRef.current = activeSkip.interval.endTime;
        if (wrapper && textSpan) {
          textSpan.textContent = label;
          wrapper.style.display = 'block';
        }
        setSkipInfo({
          visible: true,
          label,
          target: activeSkip.interval.endTime,
        });
      } else {
        if (wrapper) wrapper.style.display = 'none';
        setSkipInfo({ visible: false, label: '', target: 0 });
        currentSkipTargetRef.current = 0;
      }
    });

    return () => {
      releaseWakeLock();
      if (art && art.destroy) {
        art.destroy(false);
      }
      playerRef.current = null;
    };
  }, [url, poster, autoPlay]);

  return (
    <div className={`relative w-full h-full bg-black ${className}`}>
      {/* Artplayer mount node */}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
