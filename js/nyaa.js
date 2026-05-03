/**
 * NYAA_INTEGRATION_EXPERIMENTAL
 * Nota: Devido a restrições de CORS e protocolo Torrent no navegador,
 * esta implementação é experimental e depende de WebRTC seeds.
 */

const NyaaAPI = {
    // Proxy para contornar o bloqueio de CORS do Nyaa.si
    PROXY: 'https://corsproxy.io/?',
    
    async search(query) {
        const targetUrl = `https://nyaa.si/?page=rss&q=${encodeURIComponent(query)}&c=1_2&f=0`;
        const proxiedUrl = `${this.PROXY}${encodeURIComponent(targetUrl)}`;

        try {
            const response = await fetch(proxiedUrl);
            const data = await response.text(); // CorsProxy retorna o conteúdo direto
            
            // Parse XML RSS
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            const items = xmlDoc.getElementsByTagName("item");
            
            const results = [];
            for (let i = 0; i < Math.min(items.length, 10); i++) {
                const item = items[i];
                const title = item.getElementsByTagName("title")[0]?.textContent;
                const infoHash = item.getElementsByTagName("nyaa:infoHash")[0]?.textContent;
                
                // Construir Magnet Link (Crucial para evitar erro de CORS do arquivo .torrent)
                // Incluímos trackers WebRTC (wss://) para que o WebTorrent funcione no navegador
                // Lista de trackers otimizada para 2026
                const trackers = [
                    'wss://tracker.openwebtorrent.com',
                    'wss://tracker.webtorrent.dev',
                    'wss://tracker.files.fm:7073/announce',
                    'wss://tracker.gbitt.info/announce',
                    'wss://qbt.jp:443/announce',
                    'wss://tracker.fastcast.nz'
                ].map(t => `&tr=${encodeURIComponent(t)}`).join('');

                const magnet = `magnet:?xt=urn:btih:${infoHash}&dn=${encodeURIComponent(title)}${trackers}`;

                results.push({
                    title: title,
                    magnet: magnet,
                    seeders: item.getElementsByTagName("nyaa:seeders")[0]?.textContent || '?',
                    leechers: item.getElementsByTagName("nyaa:leechers")[0]?.textContent || '?',
                    size: item.getElementsByTagName("nyaa:size")[0]?.textContent || '?'
                });
            }
            return results;
        } catch (error) {
            console.error("NYAA_SEARCH_ERROR:", error);
            return [];
        }
    }
};

const NyaaPlayer = {
    client: null,

    init() {
        if (!window.WebTorrent) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js';
            document.head.appendChild(script);
        }
    },

    async play(magnetUrl, containerId) {
        if (!window.WebTorrent) {
            UI.showToast("Carregando motor de torrent...", "info");
            await new Promise(r => setTimeout(r, 2000));
        }

        if (!this.client) this.client = new WebTorrent();

        const container = document.getElementById(containerId);
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full bg-slate-900 p-8 text-center">
                <div class="loader-ring mb-4"></div>
                <h3 class="text-lg font-bold mb-2">Conectando aos Peers...</h3>
                <p class="text-xs text-slate-500 max-w-xs">Torrents de navegador dependem de WebRTC. Se não houver seeds compatíveis, o carregamento pode falhar.</p>
                <div id="torrent-stats" class="mt-4 text-[10px] font-mono text-blue-400"></div>
            </div>
        `;

        this.client.add(magnetUrl, (torrent) => {
            let hasFoundPeers = false;

            // Timeout de 30 segundos para encontrar peers
            const connectionTimeout = setTimeout(() => {
                if (torrent.numPeers === 0) {
                    UI.showToast("Dificuldade em encontrar peers WebRTC. Tente outro torrent.", "warning");
                    const stats = document.getElementById('torrent-stats');
                    if (stats) stats.innerHTML = '<span class="text-red-500">Sem seeds compatíveis com navegador.</span>';
                }
            }, 30000);

            // Encontrar o arquivo de vídeo (maior arquivo geralmente)
            const file = torrent.files.find(f => f.name.endsWith('.mp4') || f.name.endsWith('.mkv') || f.name.endsWith('.webm'));
            
            if (file) {
                container.innerHTML = '';
                file.appendTo(container, { autoplay: true, muted: false });
                
                // Aplicar classes de estilo ao vídeo gerado
                const video = container.querySelector('video');
                if (video) {
                    video.className = 'w-full h-full rounded-xl';
                    video.controls = true;
                }
            }

            torrent.on('download', () => {
                const stats = document.getElementById('torrent-stats');
                if (stats) {
                    stats.textContent = `DL: ${(torrent.downloadSpeed / 1024 / 1024).toFixed(2)} MB/s | Peers: ${torrent.numPeers}`;
                }
            });
        });
    }
};

window.NyaaAPI = NyaaAPI;
window.NyaaPlayer = NyaaPlayer;
document.addEventListener('DOMContentLoaded', () => NyaaPlayer.init());
