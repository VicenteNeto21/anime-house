'use client';

import { useEffect, useState } from 'react';

const BEST_TRACKERS = [
  'udp://zer0day.ch:1337/announce',
  'udp://tracker.publictracker.xyz:6969/announce',
  'udp://open.demonii.com:1337/announce',
  'http://tracker.opentrackr.org:1337/announce',
  'udp://open.tracker.cl:1337/announce',
  'udp://open.stealth.si:80/announce',
  'udp://tracker2.dler.org:80/announce',
  'udp://tracker.wildkat.net:6969/announce',
  'udp://tracker.torrent.eu.org:451/announce',
  'udp://tracker.qu.ax:6969/announce',
  'udp://tracker.peerfect.org:6969/announce',
  'udp://tracker.opentrackr.com:6969/announce',
  'udp://tracker.opentorrent.top:6969/announce',
  'udp://tracker.ilibr.org:6969/announce',
  'udp://tracker.ducks.party:1984/announce',
  'udp://tracker.corpscorp.online:80/announce',
  'udp://tracker.bittor.pw:1337/announce',
  'udp://tracker.auctor.tv:6969/announce',
  'udp://tracker-udp.gbitt.info:80/announce',
  'udp://tr4ck3r.duckdns.org:6969/announce',
  'udp://torrentclub.online:54123/announce',
  'udp://torrentclub.online:1984/announce',
  'udp://t.overflow.biz:6969/announce',
  'udp://seedpeer.net:6969/announce',
  'udp://retracker01-msk-virt.corbina.net:80/announce',
  'udp://rekcart.duckdns.org:15480/announce',
  'udp://open.demonoid.ch:6969/announce',
  'udp://ns575949.ip-51-222-82.net:6969/announce',
  'udp://mail.segso.net:6969/announce',
  'udp://leet-tracker.moe:1337/announce',
  'udp://ipv4announce.sktorrent.eu:6969/announce',
  'udp://explodie.org:6969/announce',
  'udp://exodus.desync.com:6969/announce',
  'udp://evan.im:6969/announce',
  'udp://bittorrent-tracker.e-n-c-r-y-p-t.net:1337/announce',
  'udp://admin.52ywp.com:6969/announce',
  'https://tracker.zhuqiy.com:443/announce',
  'https://tracker.pmman.tech:443/announce',
  'https://tracker.nekomi.cn:443/announce',
  'https://tracker.leechshield.link:443/announce',
  'https://tracker.gcrenwp.top:443/announce',
  'https://tracker.bt4g.com:443/announce',
  'https://tracker.7471.top:443/announce',
  'https://tr.zukizuki.org:443/announce',
  'https://tr.nyacat.pw:443/announce',
  'https://shahidrazi.online:443/announce',
  'https://pybittrack.retiolus.net:443/announce',
  'https://open.ftorrent.com:443/announce',
  'https://ht.therarbg.to:443/announce',
  'https://edgev.duckdns.org:443/announce',
  'https://004430.xyz:443/announce',
  'http://tracker810.xyz:11450/announce',
  'http://tracker2.dler.org:80/announce',
  'http://tracker.zhuqiy.dgj055.icu:80/announce',
  'http://tracker.zhuqiy.com:80/announce',
  'http://tracker.waaa.moe:6969/announce',
  'http://tracker.tritan.gg:8080/announce',
  'http://tracker.renfei.net:8080/announce',
  'http://tracker.qu.ax:6969/announce',
  'http://tracker.privateseedbox.xyz:2710/announce',
  'http://tracker.mywaifu.best:6969/announce',
  'http://tracker.ipv6tracker.org:80/announce',
  'http://tracker.dler.org:6969/announce',
  'http://tracker.dler.com:6969/announce',
  'http://tracker.dhitechnical.com:6969/announce',
  'http://tracker.corpscorp.online:80/announce',
  'http://tracker.bt4g.com:2095/announce',
  'http://tracker.bittor.pw:1337/announce',
  'http://tracker.23794.top:6969/announce',
  'http://tr.nyacat.pw:80/announce',
  'http://tr.kxmp.cf:80/announce',
  'http://t.overflow.biz:6969/announce',
  'http://shubt.net:2710/announce',
  'http://lucke.fenesisu.moe:6969/announce',
  'http://ipv4announce.sktorrent.eu:6969/announce',
  'http://buny.uk:6969/announce',
  'http://bittorrent-tracker.e-n-c-r-y-p-t.net:1337/announce',
  'http://aboutbeautifulgallopinghorsesinthegreenpasture.online:80/announce',
  'http://1337.abcvg.info:80/announce',
  'http://0123456789nonexistent.com:80/announce',
  'http://004430.xyz:80/announce',
  'udp://tracker.therarbg.to:6969/announce',
  'udp://tracker.teambelgium.net:6969/announce',
  'udp://tracker.skynetcloud.site:6969/announce',
  'udp://tracker.playground.ru:6969/announce',
  'udp://tracker.nyaa.vc:6969/announce',
  'udp://tracker.nexusstream.eu:6969/announce',
  'udp://tracker.gmi.gd:6969/announce',
  'udp://tracker.dler.org:6969/announce',
  'udp://tracker.ddunlimited.net:6969/announce',
  'udp://tracker.aruku.ovh:8081/announce',
  'udp://tracker.0x7c0.com:6969/announce',
  'udp://tr.btube3.com:2010/announce',
  'udp://open.ftorrent.com:443/announce',
  'udp://martin-gebhardt.eu:25/announce',
  'udp://anime-tracker.aruku.kro.kr:8081/announce',
  'https://t.213891.xyz:443/announce',
  'http://tracker.nexusstream.eu:6969/announce'
];

function enhanceMagnetWithTrackers(magnetUrl: string): string {
  let enhancedMagnet = magnetUrl;
  
  // O SEGREDO DO CRASH: Passar 100 trackers de uma vez faz o Webtor abrir 100 conexões UDP/WebSocket simultâneas.
  // Isso esgota os sockets do navegador e causa o crash "Aw, Snap!" (Sad Face) instantâneo por falta de memória.
  // Solução: Pegamos todos os trackers bons que você listou, embaralhamos, e injetamos no máximo 20 por vez.
  const shuffledTrackers = [...BEST_TRACKERS].sort(() => 0.5 - Math.random());
  const selectedTrackers = shuffledTrackers.slice(0, 20);

  selectedTrackers.forEach(tracker => {
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
    // Aumentado para 400ms para dar tempo absoluto do Chromium matar os WebRTCs
    const timer = setTimeout(() => {
      const enhancedMagnet = enhanceMagnetWithTrackers(magnet);
      const url = new URL('/webtor.html', window.location.origin);
      url.searchParams.set('magnet', enhancedMagnet);
      url.searchParams.set('title', title || 'Anime House');
      setActiveUrl(url.toString());
    }, 400);

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
