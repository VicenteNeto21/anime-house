'use client';

import { useEffect, useRef, useState } from 'react';

const BEST_TRACKERS = [
  'udp://tracker.publictracker.xyz:6969/announce',
  'http://tracker.opentrackr.org:1337/announce',
  'udp://open.demonii.com:1337/announce',
  'udp://open.stealth.si:80/announce',
  'udp://tracker.wildkat.net:6969/announce',
  'udp://tracker.qu.ax:6969/announce',
  'udp://tracker.peerfect.org:6969/announce',
  'udp://tracker.opentrackr.com:6969/announce',
  'udp://tracker.opentorrent.top:6969/announce',
  'udp://tracker.ilibr.org:6969/announce',
  'udp://tracker.filemail.com:6969/announce',
  'udp://tracker.ducks.party:1984/announce',
  'udp://tracker.corpscorp.online:80/announce',
  'udp://tracker.bittor.pw:1337/announce',
  'udp://tracker.auctor.tv:6969/announce',
  'udp://tracker.0x7c0.com:6969/announce',
  'udp://tracker-udp.gbitt.info:80/announce',
  'udp://tr4ck3r.duckdns.org:6969/announce',
  'udp://torrentclub.online:54123/announce',
  'udp://torrentclub.online:1984/announce',
  'udp://tracker.torrent.eu.org:451/announce',
  'udp://tracker.moeking.me:6969/announce',
  'udp://exodus.desync.com:6969/announce',
  'udp://tracker.tiny-vps.com:6969/announce',
  'udp://tracker.dler.org:6969/announce'
];

function enhanceMagnetWithTrackers(magnetUrl: string): string {
  let enhancedMagnet = magnetUrl;
  BEST_TRACKERS.forEach(tracker => {
    if (!enhancedMagnet.includes(encodeURIComponent(tracker))) {
      enhancedMagnet += `&tr=${encodeURIComponent(tracker)}`;
    }
  });
  return enhancedMagnet;
}

interface WebtorPlayerProps {
  magnet: string;
  poster?: string;
  title?: string;
}

export default function WebtorPlayer({ magnet, poster, title }: WebtorPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    setIsTransitioning(true);
    
    // Quando o magnet muda, limpamos o iframe suavemente (about:blank) 
    // ANTES de jogar a nova URL. Isso faz o navegador destruir os workers de vídeo antigos graciosamente.
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }

    const timer = setTimeout(() => {
      if (iframeRef.current) {
        const enhancedMagnet = enhanceMagnetWithTrackers(magnet);
        const url = new URL('/webtor.html', window.location.origin);
        url.searchParams.set('magnet', enhancedMagnet);
        url.searchParams.set('title', title || 'Anime House');
        
        iframeRef.current.src = url.toString();
        setIsTransitioning(false);
      }
    }, 300); // 300ms é tempo suficiente para o Chrome fazer o Garbage Collection do iframe anterior

    return () => clearTimeout(timer);
  }, [magnet, title]);

  return (
    <div className="absolute inset-0 w-full h-full bg-black relative">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0 outline-none"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      
      {/* Tela de carregamento/transição por cima do iframe para esconder o piscar de tela */}
      {isTransitioning && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50">
          <div className="text-blue-500 font-bold text-sm tracking-widest uppercase animate-pulse">
            Trocando de Servidor...
          </div>
        </div>
      )}
    </div>
  );
}
