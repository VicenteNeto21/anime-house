const DetailsApp = {
    state: {
        anime: null,
        episodes: []
    },

    async init() {
        console.log("AH_DETAILS_INIT...");
        this.setupHeaderListeners();
        this.setupFavoriteListener();
        const urlParams = new URLSearchParams(window.location.search);
        const animeId = urlParams.get('id');

        if (!animeId) {
            window.location.href = 'index.html';
            return;
        }

        this.setupTrailer();
        await this.loadAnimeDetails(animeId);
    },

    async loadAnimeDetails(id) {
        try {
            const anime = await AniListAPI.getDetails(id);
            this.state.anime = anime;
            this.renderDetails();
            this.renderEpisodes();
            this.renderCharacters();
            this.renderRecommendations();
            this.renderTags();
            this.renderRelations();
            this.addToHistory(anime);
            this.updateFavoriteButton();
        } catch (error) {
            console.error("LOAD_DETAILS_ERROR:", error);
        }
    },

    renderDetails() {
        const anime = this.state.anime;
        if (!anime) return;

        // Document Title
        document.title = `${anime.title} - Better Anime`;

        // Banner & Poster
        const banner = document.getElementById('hero-banner');
        banner.style.backgroundImage = `url(${anime.banner || anime.poster})`;
        
        document.getElementById('anime-poster').src = anime.poster;

        // Title & Description
        document.getElementById('anime-title').textContent = anime.title;
        document.getElementById('anime-description').innerHTML = anime.description || "Sem sinopse disponível.";

        // Genres
        const genresContainer = document.getElementById('anime-genres');
        genresContainer.innerHTML = (anime.genres || []).map(g => `
            <span class="px-3 py-1 bg-blue-600/20 text-blue-400 text-[10px] font-bold uppercase rounded-full border border-blue-500/20">
                ${g}
            </span>
        `).join('');

        // Rating
        document.getElementById('anime-rating').textContent = anime.rating || "N/A";

        // Meta Info
        const meta = document.getElementById('anime-meta');
        meta.innerHTML = `
            <span>${anime.year}</span>
            <span class="w-1 h-1 bg-slate-500 rounded-full"></span>
            <span>${anime.format}</span>
            <span class="w-1 h-1 bg-slate-500 rounded-full"></span>
            <span class="text-green-400">${anime.status}</span>
        `;

        // Sidebar Stats
        const sidebar = document.getElementById('sidebar-stats');
        sidebar.innerHTML = `
            <div class="flex justify-between text-xs">
                <span class="text-slate-500">Episódios</span>
                <span class="font-bold">${anime.episodes || '??'}</span>
            </div>
            <div class="flex justify-between text-xs border-t border-white/5 pt-3">
                <span class="text-slate-500">Temporada</span>
                <span class="font-bold capitalize text-blue-400">${(anime.season || "N/A").toLowerCase()}</span>
            </div>
            <div class="flex justify-between text-xs border-t border-white/5 pt-3">
                <span class="text-slate-500">Estúdio</span>
                <span class="font-bold text-slate-300">${anime.studios?.[0] || "N/A"}</span>
            </div>
        `;

        // Trailer Button
        const btnTrailer = document.getElementById('btn-trailer');
        if (anime.trailer) {
            btnTrailer.classList.remove('hidden');
            btnTrailer.onclick = () => this.openTrailer(anime.trailer);
        } else {
            btnTrailer.classList.add('hidden');
        }

        // Watch Button
        const btnWatch = document.getElementById('btn-watch');
        if (btnWatch) {
            btnWatch.onclick = () => window.location.href = `player.html?id=${anime.id}&ep=1`;
        }
    },

    renderCharacters() {
        const grid = document.getElementById('characters-grid');
        const characters = this.state.anime.characters || [];
        
        if (characters.length === 0) {
            grid.parentElement.classList.add('hidden');
            return;
        }

        grid.innerHTML = characters.map(char => `
            <div class="flex flex-col items-center text-center group">
                <div class="w-full aspect-[3/4] rounded-xl overflow-hidden border border-white/5 mb-3">
                    <img src="${char.image}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500" alt="${char.name}">
                </div>
                <span class="text-[10px] font-black uppercase text-slate-400 group-hover:text-white transition-colors line-clamp-2">${char.name}</span>
            </div>
        `).join('');
    },

    renderRecommendations() {
        const grid = document.getElementById('recommendations-grid');
        const section = document.getElementById('recommendations-section');
        const recs = this.state.anime.recommendations || [];

        if (recs.length === 0) {
            section.classList.add('hidden');
            return;
        }

        section.classList.remove('hidden');
        grid.innerHTML = recs.map(rec => `
            <div class="group cursor-pointer" onclick="window.location.href='anime.html?id=${rec.id}'">
                <div class="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 mb-3">
                    <img src="${rec.poster}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <i class="fa-solid fa-link text-white"></i>
                    </div>
                    <div class="absolute top-2 right-2 px-2 py-1 bg-blue-600 rounded text-[9px] font-black text-white">
                        ${rec.rating}
                    </div>
                </div>
                <h4 class="text-xs font-bold text-slate-300 line-clamp-1 group-hover:text-blue-400 transition-colors">${rec.title}</h4>
                <p class="text-[10px] text-slate-500 font-bold uppercase mt-1">${rec.year}</p>
            </div>
        `).join('');
    },

    renderTags() {
        const container = document.getElementById('tags-container');
        const grid = document.getElementById('anime-tags');
        const tags = this.state.anime.tags || [];

        if (tags.length === 0) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');
        grid.innerHTML = tags.slice(0, 15).map(tag => `
            <span class="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white hover:border-white/20 cursor-default transition-all">
                #${tag}
            </span>
        `).join('');
    },

    renderRelations() {
        const grid = document.getElementById('relations-grid');
        const section = document.getElementById('relations-section');
        const relations = this.state.anime.relations || [];

        if (relations.length === 0) {
            section.classList.add('hidden');
            return;
        }

        section.classList.remove('hidden');
        grid.innerHTML = relations.map(rel => `
            <div class="flex-shrink-0 w-32 group cursor-pointer" onclick="window.location.href='anime.html?id=${rel.id}'">
                <div class="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/10 mb-2">
                    <img src="${rel.poster}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                    <div class="absolute top-1 left-1 px-1.5 py-0.5 bg-brand-blue/90 rounded text-[8px] font-black text-white uppercase">
                        ${rel.type}
                    </div>
                </div>
                <h5 class="text-[10px] font-bold text-slate-300 line-clamp-2 group-hover:text-brand-blue transition-colors leading-tight">${rel.title}</h5>
                <div class="flex flex-col mt-1 gap-0.5">
                    <p class="text-[9px] text-brand-blue/80 font-black uppercase tracking-tighter">${rel.season}</p>
                    <p class="text-[8px] text-slate-500 font-bold uppercase">${rel.format}</p>
                </div>
            </div>
        `).join('');
    },

    setupTrailer() {
        const modal = document.getElementById('trailer-modal');
        const close = document.getElementById('close-trailer');

        close.onclick = () => {
            modal.classList.add('hidden');
            document.getElementById('trailer-container').innerHTML = '';
            document.body.style.overflow = 'auto';
        };

        modal.onclick = (e) => {
            if (e.target === modal) close.onclick();
        };
    },

    openTrailer(id) {
        const modal = document.getElementById('trailer-modal');
        const container = document.getElementById('trailer-container');

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        container.innerHTML = `
            <iframe 
                src="https://www.youtube.com/embed/${id}?autoplay=1" 
                class="w-full h-full" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    },

    renderEpisodes(pageIndex = 0) {
        const grid = document.getElementById('episodes-grid');
        const pagination = document.getElementById('episodes-pagination');
        const total = this.state.anime.episodes || 0;
        const perPage = 24;

        if (total === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-12 text-slate-500 italic">Nenhum episódio encontrado.</div>';
            return;
        }

        if (total > perPage) {
            const numPages = Math.ceil(total / perPage);
            let tabsHtml = '';
            for (let i = 0; i < numPages; i++) {
                const end = total - (i * perPage);
                const start = Math.max(1, total - ((i + 1) * perPage) + 1);
                const isActive = i === pageIndex;
                tabsHtml += `
                    <button onclick="DetailsApp.renderEpisodes(${i})" class="whitespace-nowrap px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${isActive ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20 hover:text-white'}">
                        ${start} - ${end}
                    </button>
                `;
            }
            pagination.innerHTML = tabsHtml;
        } else {
            pagination.innerHTML = `<span class="text-xs bg-slate-900/50 border border-white/5 px-4 py-2 rounded-xl text-slate-400 font-bold">${total} Episódios</span>`;
        }

        const pageStart = total - (pageIndex * perPage);
        const pageEnd = Math.max(1, total - ((pageIndex + 1) * perPage) + 1);

        let html = '';
        for (let i = pageStart; i >= pageEnd; i--) {
            html += `
                <div class="relative group cursor-pointer bg-slate-800/40 border border-white/5 rounded-xl p-3 hover:bg-blue-600/20 hover:border-blue-500/30 transition-all"
                     onclick="window.location.href='player.html?id=${this.state.anime.id}&ep=${i}'">
                    <div class="flex items-center justify-between">
                        <div class="flex flex-col">
                            <span class="text-[10px] text-slate-500 font-bold uppercase">Episódio</span>
                            <span class="text-sm font-black text-white">${i.toString().padStart(2, '0')}</span>
                        </div>
                        <div class="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                            <i class="fa-solid fa-play text-[10px] text-white"></i>
                        </div>
                    </div>
                </div>
            `;
        }
        grid.innerHTML = html;
        
        // Inicializa o arraste sempre que renderizar
        setTimeout(() => this.initDragToScroll(), 100);
    },

    initDragToScroll() {
        const slider = document.getElementById('episodes-pagination');
        if (!slider || slider.dataset.dragInit) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        slider.style.cursor = 'grab';
        slider.dataset.dragInit = "true";

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.style.cursor = 'grabbing';
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.style.cursor = 'grab';
        });

        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.style.cursor = 'grab';
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2;
            slider.scrollLeft = scrollLeft - walk;
        });
    },

    // Header Actions (Common)
    setupHeaderListeners() {
        const searchTrigger = document.getElementById('search-trigger');
        const searchClose = document.getElementById('search-close');
        const searchModal = document.getElementById('search-modal');
        const searchInput = document.getElementById('search-input');
        const randomBtn = document.getElementById('random-anime');

        searchTrigger?.addEventListener('click', () => {
            searchModal?.classList.remove('hidden');
            searchInput?.focus();
        });

        searchClose?.addEventListener('click', () => {
            searchModal?.classList.add('hidden');
        });

        let debounceTimer;
        searchInput?.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => this.handleSearch(e.target.value), 400);
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') searchModal?.classList.add('hidden');
        });

        randomBtn?.addEventListener('click', async () => {
            randomBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            const id = await AniListAPI.getRandomAnime();
            window.location.href = `anime.html?id=${id}`;
        });
    },

    async handleSearch(query) {
        const resultsContainer = document.getElementById('search-results');
        if (!query.trim()) {
            resultsContainer.innerHTML = '';
            return;
        }

        resultsContainer.innerHTML = '<div class="flex justify-center py-8"><i class="fa-solid fa-spinner fa-spin text-3xl text-blue-500"></i></div>';

        try {
            const results = await AniListAPI.search(query);
            if (results.length === 0) {
                resultsContainer.innerHTML = '<div class="text-center py-8 text-slate-500">Nenhum resultado encontrado.</div>';
            } else {
                resultsContainer.innerHTML = results.map(UI.renderSearchResult).join('');
            }
        } catch (error) {
            resultsContainer.innerHTML = '<div class="text-center py-8 text-red-500">Erro na busca AniList.</div>';
        }
    },

    // --- DATA MANAGEMENT (Local Persistence) ---
    
    getUserData() {
        const saved = localStorage.getItem('ah_user_data');
        const data = saved ? JSON.parse(saved) : { name: 'Visitante', avatar: '', favorites: [], history: [] };
        
        // Ensure arrays exist
        if (!data.history) data.history = [];
        if (!data.favorites) data.favorites = [];
        if (!data.favourites) data.favourites = data.favorites; // Sync names
        
        return data;
    },

    saveUserData(data) {
        localStorage.setItem('ah_user_data', JSON.stringify(data));
    },

    addToHistory(anime) {
        const data = this.getUserData();
        const historyItem = {
            id: anime.id,
            title: anime.title,
            poster: anime.poster,
            date: new Date().toISOString()
        };

        // Remove if already exists to move to top
        data.history = data.history.filter(item => item.id !== anime.id);
        data.history.push(historyItem);

        // Keep last 50
        if (data.history.length > 50) data.history.shift();

        this.saveUserData(data);
    },

    setupFavoriteListener() {
        const btn = document.getElementById('btn-favorite');
        if (btn) {
            btn.onclick = () => this.toggleFavorite();
        }
    },

    toggleFavorite() {
        const anime = this.state.anime;
        if (!anime) return;

        const data = this.getUserData();
        const isFavorite = data.favorites.includes(anime.id);

        if (isFavorite) {
            data.favorites = data.favorites.filter(id => id !== anime.id);
            UI.showToast('Removido dos favoritos');
        } else {
            data.favorites.push(anime.id);
            UI.showToast('Adicionado aos favoritos!');
        }

        this.saveUserData(data);
        this.updateFavoriteButton();
    },

    updateFavoriteButton() {
        const btn = document.getElementById('btn-favorite');
        if (!btn || !this.state.anime) return;

        const data = this.getUserData();
        const isFavorite = data.favorites.includes(this.state.anime.id);
        const icon = btn.querySelector('i');

        if (isFavorite) {
            icon.className = 'fa-solid fa-heart text-red-500 scale-110';
        } else {
            icon.className = 'fa-regular fa-heart';
        }
    }
};

window.DetailsApp = DetailsApp;
document.addEventListener('DOMContentLoaded', () => {
    DetailsApp.init();
});
