/**
 * ANIME_HOUSE // CORE_CONTROLLER v2.1 (Classic Restore)
 */

const App = {
    state: {
        trending: [],
        recent: [],
        ranking: [],
        currentPage: 1,
        currentHeroIndex: 0
    },

    async init() {
        window.App = this;
        console.log('AH_SYSTEM_RESTORE_INIT...');
        
        // Handle AniList OAuth
        await this.handleAuth();
        
        // Setup Event Listeners for Home specific elements
        this.setupEventListeners();
        
        // Initial Data Sync
        await this.syncData();
    },

    async handleAuth() {
        const hash = window.location.hash;
        if (hash.includes('access_token=')) {
            const token = hash.split('access_token=')[1].split('&')[0];
            AniListAPI.setToken(token);
            
            // Limpar hash da URL
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
            
            // Buscar dados do usuário
            const user = await AniListAPI.getViewer();
            if (user) {
                const userData = {
                    id: user.id,
                    name: user.name,
                    about: user.about,
                    avatar: user.avatar.large,
                    banner: user.bannerImage,
                    isAniList: true,
                    stats: user.statistics,
                    favourites: user.favourites,
                    joinedAt: new Date().toISOString()
                };
                localStorage.setItem('ah_user_data', JSON.stringify(userData));
                // Notificar sucesso
                console.log('ANILIST_AUTH_SUCCESS:', user.name);
            }
        }
    },

    setupEventListeners() {
        const calendarBar = document.getElementById('calendar-bar');
        if (calendarBar) {
            calendarBar.addEventListener('click', () => this.toggleCalendar());
        }
    },

    async syncData() {
        const grid = document.getElementById('anime-grid');
        if (grid) grid.innerHTML = Array(10).fill(0).map(UI.renderSkeleton).join('');

        // Tentar Trending
        try {
            this.state.trending = await AniListAPI.getTrending(6);
            this.renderHero();
        } catch (e) {
            console.warn('TRENDING_SYNC_ERROR:', e);
            // Fallback Trending Kitsu
            AnimeAPI.getTrending(6).then(data => {
                this.state.trending = data;
                this.renderHero();
            }).catch(err => console.error('TRENDING_FALLBACK_FAILURE:', err));
        }

        // Tentar Recentes
        try {
            this.state.recent = await AniListAPI.getRecent(1, 20);
            this.renderRecent();
        } catch (e) {
            console.warn('RECENT_SYNC_ERROR:', e);
            // Fallback Recentes Kitsu
            AnimeAPI.getRecent(20, 1).then(data => {
                this.state.recent = data;
                this.renderRecent();
            }).catch(err => console.error('RECENT_FALLBACK_FAILURE:', err));
        }

        // Tentar Ranking
        try {
            this.state.ranking = await AniListAPI.getTopRated(10);
            this.renderRanking();
        } catch (e) {
            console.warn('RANKING_SYNC_ERROR:', e);
        }
    },

    renderHero() {
        const grid = document.getElementById('highlights-grid');
        if (!grid) return;

        // Render first 6 trending as highlights
        grid.innerHTML = this.state.trending.slice(0, 6).map(UI.renderHighlight).join('');
        this.refreshIcons();
    },

    renderRecent() {
        const grid = document.getElementById('anime-grid');
        const pagination = document.getElementById('pagination-container');
        
        grid.innerHTML = this.state.recent.map(anime => UI.renderCard(anime, true)).join('');
        pagination.innerHTML = UI.renderPagination(this.state.currentPage);
        
        this.refreshIcons();
    },

    renderRanking() {
        const grid = document.getElementById('ranking-grid');
        if (!grid) return;
        
        grid.innerHTML = this.state.ranking.map((anime, index) => UI.renderRankingCard(anime, index)).join('');
    },

    async changePage(page) {
        if (page < 1) return;
        this.state.currentPage = page;
        
        // Scroll to content section
        document.querySelector('#highlights-grid')?.scrollIntoView({ behavior: 'smooth' });
        
        // Show skeletons while loading
        const grid = document.getElementById('anime-grid');
        grid.innerHTML = Array(10).fill(0).map(UI.renderSkeleton).join('');
        
        try {
            this.state.recent = await AniListAPI.getRecent(page, 20);
            this.renderRecent();
        } catch (error) {
            UI.showToast('Erro ao carregar nova página.');
        }
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
                this.refreshIcons();
            }
        } catch (error) {
            resultsContainer.innerHTML = '<div class="text-center py-8 text-red-500">Erro na busca AniList.</div>';
        }
    },

    navigateTo(id) {
        window.location.href = `anime.html?id=${id}`;
    },

    playEpisode(id, ep) {
        window.location.href = `player.html?id=${id}&ep=${ep}`;
    },

    async toggleCalendar() {
        const content = document.getElementById('calendar-content');
        const icon = document.getElementById('calendar-icon');
        const isHidden = content.classList.contains('hidden');

        if (isHidden) {
            content.classList.remove('hidden');
            icon.style.transform = 'rotate(180deg)';
            this.renderCalendarTabs();
            await this.loadCalendar();
        } else {
            content.classList.add('hidden');
            icon.style.transform = 'rotate(0deg)';
        }
    },

    renderCalendarTabs(activeOffset = 0) {
        const container = document.getElementById('calendar-days');
        if (!container) return;

        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const today = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
        let html = '';

        // Mostra 3 dias antes, hoje e 3 dias depois
        for (let i = -3; i <= 3; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dayName = i === 0 ? 'Hoje' : days[date.getDay()];
            const isActive = i === activeOffset;

            html += `
                <button onclick="event.stopPropagation(); App.loadCalendarByDay(${i})" 
                        class="px-2.5 py-1 rounded-md transition-all ${isActive ? 'bg-white text-blue-600 font-black shadow-sm' : 'hover:bg-white/10 text-white/70'}">
                    ${dayName}
                </button>
            `;
        }
        container.innerHTML = html;
    },

    async loadCalendarByDay(offset) {
        this.renderCalendarTabs(offset);
        await this.loadCalendar(offset);
    },

    async loadCalendar(dayOffset = 0) {
        const grid = document.getElementById('airing-grid');
        grid.innerHTML = Array(5).fill(0).map(() => `<div class="flex-shrink-0 w-32 aspect-[2/3] skeleton rounded-md"></div>`).join('');
        
        try {
            const airing = await AniListAPI.getAiringByDay(dayOffset);
            if (airing && airing.length > 0) {
                grid.innerHTML = airing.map(UI.renderAiringItem).join('');
            } else {
                grid.innerHTML = '<div class="text-slate-500 text-xs py-8 px-4">Nenhum lançamento programado para este dia.</div>';
            }
        } catch (error) {
            grid.innerHTML = '<div class="text-red-500 text-xs py-4">Erro ao carregar calendário.</div>';
        }
    },

    refreshIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
};

window.App = App;
window.addEventListener('DOMContentLoaded', () => App.init());
