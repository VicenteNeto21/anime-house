'use client';

import { useMemo } from 'react';

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
  if (!magnetUrl) return '';
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
  tmdbId?: string; // Novo recurso para buscar legendas via OpenSubtitles
}

export default function WebtorPlayer({ magnet, poster, title, tmdbId }: WebtorPlayerProps) {
  const htmlSandbox = useMemo(() => {
    if (!magnet) return '';

    const enhancedMagnet = enhanceMagnetWithTrackers(magnet);

    // CRÍTICO: Precisamos escapar aspas simples e duplas para não quebrar a string JS no Iframe
    // Foi isso que causou a quebra anterior ao trocar de seed (títulos com apóstrofo no link magnet).
    const safeMagnet = enhancedMagnet.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
    const safeTitle = (title || 'Anime House').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
    
    // Se tiver tmdbId, passamos como imdbId para o Webtor para ele tentar buscar legendas
    const imdbProperty = tmdbId ? `imdbId: '${tmdbId}',` : '';

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script>
          // Oculta os erros internos do Webtor (como "Failed to find element with id webtor-xxx")
          // interceptando os logs de erro para que o Next.js não exiba a tela vermelha (Error Overlay).
          const origError = console.error;
          console.error = function(...args) {
            const msg = args.map(String).join(' ');
            if (msg.includes('webtor-')) return;
            origError.apply(console, args);
          };

          window.onerror = function(message, source, lineno, colno, error) {
            if (String(message).includes('webtor-') || (error && String(error.message).includes('webtor-'))) {
              return true; // Retornar true previne o erro de ir pro console (e pro Next.js)
            }
            return false;
          };

          window.addEventListener('unhandledrejection', function(e) {
            if (e.reason && String(e.reason.message).includes('webtor-')) {
              e.preventDefault();
            }
          });
        </script>
        <style>
          body, html { 
            margin: 0; padding: 0; width: 100%; height: 100%; 
            background: #000; overflow: hidden; font-family: system-ui, sans-serif;
          }
          #loader {
            position: absolute; inset: 0; z-index: 10; 
            display: flex; flex-direction: column; align-items: center; justify-content: center; 
            background: #020617; transition: opacity 0.5s ease;
          }
          .spinner {
            width: 4rem; height: 4rem; 
            border: 4px solid #3b82f6; border-top-color: transparent; 
            border-radius: 50%; animation: spin 1s linear infinite; 
            box-shadow: 0 0 15px rgba(59,130,246,0.5); margin-bottom: 1rem;
          }
          .text {
            color: #60a5fa; font-weight: bold; text-transform: uppercase; 
            letter-spacing: 0.1em; font-size: 0.875rem; 
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 50% { opacity: .5; } }
        </style>
      </head>
      <body>
        <div id="loader">
          <div class="spinner"></div>
          <div class="text">Conectando Servidores Torrent...</div>
        </div>
        
        <!-- A tag correta para o embed-sdk do Webtor é <video> -->
        <video id="player" controls style="width: 100%; height: 100%;"></video>

        <script>
          window.webtor = window.webtor || [];
          window.webtor.push({
              id: 'player', // É 'id' e não 'el' na versão embed-sdk-js
              magnet: '${safeMagnet}',
              lang: 'pt',
              theme: 'dark',
              title: '${safeTitle}',
              poster: '', // Fundo preto
              ${imdbProperty}
              features: {
                download: false,
                chromecast: true,
                subtitles: true,
                settings: true,
                opensubtitles: true // Nova feature: Busca legendas PT-BR automaticamente!
              },
              on: function(e) {
                  if (e.name === window.webtor.INITED) {
                      var loader = document.getElementById('loader');
                      if (loader) {
                        loader.style.opacity = '0';
                        setTimeout(function() { loader.style.display = 'none'; }, 500);
                      }
                  }
              }
          });
        </script>
        <script src="https://cdn.jsdelivr.net/npm/@webtor/embed-sdk-js/dist/index.min.js" async></script>
      </body>
      </html>
    `;
  }, [magnet, title, tmdbId]);

  if (!magnet) return null;

  return (
    <div className="absolute inset-0 w-full h-full bg-black relative">
      <iframe
        key={magnet}
        srcDoc={htmlSandbox}
        className="w-full h-full border-0 outline-none"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
