'use client';

import { useEffect, useState } from 'react';

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
  const [activeUrl, setActiveUrl] = useState<string>('');

  useEffect(() => {
    // 1. Ao invés de remover o Iframe do DOM (o que causa o crash fatal do Chromium),
    // nós forçamos o navegador a navegar para uma página vazia. Isso fecha as conexões 
    // WebRTC e de Mídia graciosamente, acionando o Garbage Collector corretamente!
    setActiveUrl('about:blank');
    
    // 2. Após o navegador limpar a memória, injetamos a URL do novo torrent.
    const timer = setTimeout(() => {
      const enhancedMagnet = enhanceMagnetWithTrackers(magnet);
      const url = new URL('/webtor.html', window.location.origin);
      url.searchParams.set('magnet', enhancedMagnet);
      url.searchParams.set('title', title || 'Anime House');
      setActiveUrl(url.toString());
    }, 150);

    return () => clearTimeout(timer);
  }, [magnet, title]);

  return (
    <div className="absolute inset-0 w-full h-full bg-black relative">
      {/* O Iframe NUNCA sai do DOM. Ele é a fundação para evitar crash do Chrome */}
      <iframe
        src={activeUrl}
        className="w-full h-full border-0 outline-none"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />

      {/* Tela de loading por cima do iframe quando estamos desconectando */}
      {(!activeUrl || activeUrl === 'about:blank') && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
            <div className="text-blue-500 font-bold text-sm tracking-widest uppercase animate-pulse">
              Desconectando Servidores Anteriores...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
