const PlayerApp = {
    state: {
        anime: null,
        currentEp: 1
    },

    async init() {
        const urlParams = new URLSearchParams(window.location.search);
        const animeId = urlParams.get('id');
        const ep = parseInt(urlParams.get('ep')) || 1;

        if (!animeId) {
            window.location.href = 'index.html';
            return;
        }

        this.state.currentEp = ep;
        await this.loadAnimeData(animeId);
        this.setupEventListeners();
    },

    async loadAnimeData(id) {
        try {
            const anime = await AniListAPI.getDetails(id);
            this.state.anime = anime;
            this.renderPlayerInfo();
            this.renderEpisodeList();
            this.renderRecommendations();
            this.loadVideo();
        } catch (err) {
            console.error("PLAYER_LOAD_ERROR:", err);
            UI.showToast("Erro ao carregar dados do player", "error");
        }
    },

    renderPlayerInfo() {
        const { anime, currentEp } = this.state;
        if (!anime) return;

        document.title = `Assistindo: ${anime.title} - EP ${currentEp} - Anime House`;
        document.getElementById('player-title').textContent = `Episódio ${currentEp.toString().padStart(2, '0')}`;
        document.getElementById('player-anime-name').textContent = anime.title;
    },

    renderEpisodeList() {
        const { anime, currentEp } = this.state;
        const container = document.getElementById('episodes-list');
        const total = anime.episodes || 0;

        let html = '';
        // Mostra os episódios em ordem (1 ao final)
        for (let i = 1; i <= total; i++) {
            const isActive = i === currentEp;
            html += `
                <div class="flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all group ${isActive ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5 border border-transparent'}" 
                     onclick="PlayerApp.changeEpisode(${i})">
                    <div class="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                        ${isActive ? '<i class="fa-solid fa-play text-[10px] text-white"></i>' : `<span class="text-xs font-bold ${isActive ? 'text-white' : 'text-slate-500'}">${i}</span>`}
                    </div>
                    <div class="flex-grow">
                        <h4 class="text-xs font-bold ${isActive ? 'text-blue-400' : 'text-slate-300'} group-hover:text-white transition-colors">Episódio ${i.toString().padStart(2, '0')}</h4>
                        <p class="text-[9px] text-slate-500 font-bold uppercase">Legenda PT-BR</p>
                    </div>
                    ${isActive ? '<span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>' : ''}
                </div>
            `;
        }
        container.innerHTML = html;

        // Auto-scroll para o episódio ativo
        setTimeout(() => {
            const active = container.querySelector('.bg-blue-600\\/20');
            if (active) active.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    },

    renderRecommendations() {
        const grid = document.getElementById('recommendations-grid');
        const recs = this.state.anime.recommendations || [];
        
        grid.innerHTML = recs.slice(0, 5).map(rec => UI.renderCard(rec)).join('');
    },

    loadVideo() {
        const placeholder = document.getElementById('video-placeholder');
        const frame = document.getElementById('player-frame');
        
        // Simulação de carregamento
        placeholder.classList.remove('hidden');
        frame.innerHTML = '';

        setTimeout(() => {
            placeholder.classList.add('hidden');
            // Usando um player de vídeo fake ou um trailer como exemplo
            frame.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center bg-slate-900">
                    <div class="text-center p-10">
                        <i class="fa-solid fa-circle-play text-6xl text-blue-500/20 mb-6"></i>
                        <h3 class="text-xl font-black mb-2 uppercase tracking-tighter">O Player está pronto!</h3>
                        <p class="text-slate-500 text-sm max-w-sm mx-auto mb-8">Esta é uma demonstração da interface de player premium da Anime House.</p>
                        <button class="px-8 py-3 bg-blue-600 rounded-xl font-bold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30">
                            INICIAR STREAMING
                        </button>
                    </div>
                </div>
            `;
        }, 1500);
    },

    changeEpisode(ep) {
        if (ep === this.state.currentEp) return;
        
        // Atualiza a URL sem recarregar a página completamente (opcional)
        // Por simplicidade agora, vamos recarregar
        window.location.href = `player.html?id=${this.state.anime.id}&ep=${ep}`;
    },

    setupEventListeners() {
        const btnPrev = document.getElementById('btn-prev');
        const btnNext = document.getElementById('btn-next');
        const btnLights = document.getElementById('btn-lights');

        btnPrev.onclick = () => {
            if (this.state.currentEp > 1) {
                this.changeEpisode(this.state.currentEp - 1);
            }
        };

        btnNext.onclick = () => {
            const total = this.state.anime.episodes || 999;
            if (this.state.currentEp < total) {
                this.changeEpisode(this.state.currentEp + 1);
            }
        };

        let lightsOff = false;
        btnLights.onclick = () => {
            lightsOff = !lightsOff;
            document.body.classList.toggle('brightness-50', lightsOff);
            btnLights.classList.toggle('bg-blue-600', lightsOff);
            btnLights.classList.toggle('text-white', lightsOff);
            UI.showToast(lightsOff ? "Modo Cinema Ativado" : "Modo Normal Ativado");
        };

        const btnNyaa = document.getElementById('btn-nyaa');
        if (btnNyaa) {
            btnNyaa.onclick = () => this.searchOnNyaa();
        }
    },

    async searchOnNyaa() {
        const { anime, currentEp } = this.state;
        const section = document.getElementById('nyaa-section');
        const resultsGrid = document.getElementById('nyaa-results');

        section.classList.remove('hidden');
        resultsGrid.innerHTML = '<div class="py-4 text-center"><i class="fa-solid fa-spinner fa-spin text-blue-500"></i></div>';

        // Buscar por Título + Episódio
        const query = `${anime.title} ${currentEp.toString().padStart(2, '0')}`;
        const results = await NyaaAPI.search(query);

        if (results.length === 0) {
            resultsGrid.innerHTML = '<p class="text-xs text-slate-500 italic py-4">Nenhum torrent encontrado no Nyaa.</p>';
            return;
        }

        resultsGrid.innerHTML = results.map(res => `
            <div class="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:border-blue-500/30 transition-all group">
                <div class="flex-grow pr-4">
                    <h4 class="text-[11px] font-bold text-slate-300 line-clamp-1 group-hover:text-white">${res.title}</h4>
                    <div class="flex items-center gap-3 mt-1">
                        <span class="text-[9px] text-slate-500 font-bold uppercase"><i class="fa-solid fa-database mr-1"></i>${res.size}</span>
                        <span class="text-[9px] text-green-500 font-bold uppercase"><i class="fa-solid fa-arrow-up mr-1"></i>${res.seeders}</span>
                    </div>
                </div>
                <button onclick="PlayerApp.playTorrent('${res.magnet}')" class="px-4 py-2 bg-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                    <i class="fa-solid fa-play"></i>
                </button>
            </div>
        `).join('');
    },

    async playTorrent(magnet) {
        UI.showToast("Iniciando motor WebTorrent...", "info");
        NyaaPlayer.play(magnet, 'player-frame');
        document.getElementById('video-placeholder').classList.add('hidden');
        
        // Scroll para o player
        document.querySelector('.player-container').scrollIntoView({ behavior: 'smooth' });
    }
};

document.addEventListener('DOMContentLoaded', () => PlayerApp.init());
