/**
 * ANIME_HOUSE // PROFILE_CONTROLLER v2.0
 * Redesenhado para visual premium e minimalista.
 */

const ProfileApp = {
    userData: {
        name: 'Otaku Master',
        avatar: '',
        favorites: [],
        history: []
    },

    async init() {
        this.loadLocalData();
        
        if (!this.userData.id) {
            window.location.href = 'index.html';
            return;
        }

        // Sync fresh data from AniList if connected
        if (this.userData.isAniList) {
            try {
                const freshUser = await AniListAPI.getViewer();
                if (freshUser) {
                    this.userData.stats = freshUser.statistics;
                    this.userData.favourites = freshUser.favourites;
                    this.userData.banner = freshUser.bannerImage;
                    localStorage.setItem('ah_user_data', JSON.stringify(this.userData));
                    
                    // Re-render overview if active
                    const overviewSection = document.getElementById('section-overview');
                    if (overviewSection && !overviewSection.classList.contains('hidden')) {
                        this.loadOverview();
                    }
                }
            } catch (error) {
                console.warn('SYNC_ERROR:', error);
            }
        }

        this.renderProfile();
        this.switchTab('history'); // Aba padrão
        UI.initNavbar();
        UI.setupSearch();
    },

    navigateTo(id) {
        window.location.href = `anime.html?id=${id}`;
    },

    loadLocalData() {
        const saved = localStorage.getItem('ah_user_data');
        if (saved) {
            this.userData = JSON.parse(saved);
        }
    },

    renderProfile() {
        const avatarUrl = this.userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.userData.name)}&background=3b82f6&color=fff&size=256`;
        
        document.getElementById('user-name').textContent = this.userData.name;
        document.getElementById('user-avatar-large').src = avatarUrl;
        
        const avatarNav = document.getElementById('user-avatar-nav');
        if (avatarNav) avatarNav.src = avatarUrl;

        // Banner
        if (this.userData.banner) {
            const bannerImg = document.querySelector('#profile-banner img');
            if (bannerImg) {
                bannerImg.src = this.userData.banner;
                bannerImg.classList.remove('opacity-40');
                bannerImg.classList.add('opacity-50');
            }
        }

        // Level System (Works for both AniList and Local)
        const episodes = this.userData.isAniList ? 
            (this.userData.stats?.anime?.episodesWatched || 0) : 
            (this.userData.history?.reduce((acc, curr) => acc + (parseInt(curr.progress) || 0), 0) || 0);

        const level = Math.floor(episodes / 50) + 1;
        const expInCurrentLevel = episodes % 50;
        const progress = (expInCurrentLevel / 50) * 100;

        const titles = [
            { min: 0, text: 'Iniciante', color: 'text-blue-400' },
            { min: 5, text: 'Aprendiz', color: 'text-cyan-400' },
            { min: 15, text: 'Maratoneiro', color: 'text-green-400' },
            { min: 30, text: 'Veterano', color: 'text-yellow-400' },
            { min: 50, text: 'Mestre Otaku', color: 'text-purple-400' },
            { min: 80, text: 'Lenda dos Animes', color: 'text-orange-400' },
            { min: 150, text: 'Entidade Transcendental', color: 'text-red-500' }
        ];

        const currentTitle = [...titles].reverse().find(t => level >= t.min) || titles[0];

        const levelTag = document.getElementById('user-level-tag');
        const levelTitle = document.getElementById('level-title');
        const levelProgressText = document.getElementById('level-progress-text');
        const levelBar = document.getElementById('level-bar');

        if (levelTag) levelTag.textContent = `LEVEL ${level}`;
        if (levelTitle) {
            levelTitle.textContent = currentTitle.text;
            levelTitle.className = `text-[10px] font-black uppercase tracking-widest mb-2 ${currentTitle.color}`;
        }
        if (levelProgressText) levelProgressText.textContent = `${expInCurrentLevel} / 50 EXP`;
        if (levelBar) levelBar.style.width = `${progress}%`;

        // About / Bio handling
        const aboutEl = document.getElementById('user-about');
        if (aboutEl) {
            if (this.userData.about) {
                aboutEl.innerHTML = this.userData.about;
                aboutEl.classList.remove('italic', 'opacity-80');
            } else {
                aboutEl.textContent = this.userData.isAniList ? "Nenhuma bio disponível no AniList." : "Clique em configurações para adicionar uma bio!";
                aboutEl.classList.add('italic', 'opacity-80');
            }
        }

        // AniList Specific Stats
        if (this.userData.isAniList && this.userData.stats) {
            const stats = this.userData.stats.anime;
            const count = stats.count || 0;
            const hours = stats.minutesWatched ? Math.round(stats.minutesWatched / 60) : 0;
            const mean = stats.meanScore ? (stats.meanScore / 10).toFixed(1) : "0.0";
            const days = stats.minutesWatched ? (stats.minutesWatched / 1440).toFixed(1) : "0.0";

            if (document.getElementById('stat-total-anime')) document.getElementById('stat-total-anime').textContent = count;
            if (document.getElementById('stat-total-hours')) document.getElementById('stat-total-hours').textContent = hours;
            if (document.getElementById('stat-mean-score')) document.getElementById('stat-mean-score').textContent = mean;
            if (document.getElementById('stat-total-days')) document.getElementById('stat-total-days').textContent = days;
        }
        
        // Settings inputs
        const userInp = document.getElementById('input-username');
        const avatarInp = document.getElementById('input-avatar');
        if (userInp) userInp.value = this.userData.name;
        if (avatarInp) avatarInp.value = this.userData.avatar || '';
        
        const settingsAvatar = document.getElementById('settings-avatar-preview');
        if (settingsAvatar) settingsAvatar.src = avatarUrl;
    },

    switchTab(tab) {
        // Update Buttons
        document.querySelectorAll('.profile-tab').forEach(btn => {
            if (btn.dataset.tab === tab) {
                btn.classList.add('border-blue-600', 'text-white');
                btn.classList.remove('border-transparent', 'text-slate-500');
            } else {
                btn.classList.remove('border-blue-600', 'text-white');
                btn.classList.add('border-transparent', 'text-slate-500');
            }
        });

        // Update Sections
        document.querySelectorAll('.profile-section').forEach(sec => {
            sec.classList.add('hidden');
        });
        const section = document.getElementById(`section-${tab}`);
        if (section) section.classList.remove('hidden');

        // Load content
        if (tab === 'overview') this.loadOverview();
        if (tab === 'favorites') this.loadFavorites();
        if (tab === 'history') this.loadHistory();
        if (tab === 'activity') this.loadActivity();
    },

    async loadActivity() {
        const feed = document.getElementById('activity-feed');
        if (!feed) return;

        if (!this.userData.id) {
            feed.innerHTML = '<p class="text-center text-slate-500 py-10">Conecte sua conta AniList.</p>';
            return;
        }

        feed.innerHTML = '<div class="col-span-full py-10 text-center text-blue-500 animate-pulse font-bold">Carregando feed...</div>';

        try {
            const activities = await AniListAPI.getUserActivity(this.userData.id);
            if (!activities || activities.length === 0) {
                feed.innerHTML = '<p class="text-center text-slate-500 py-10">Nenhuma atividade recente.</p>';
                return;
            }

            feed.innerHTML = activities.map(act => {
                const date = new Date(act.createdAt * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                let statusText = '';
                const status = act.status?.toLowerCase() || '';
                
                if (status.includes('watched')) statusText = `Assistiu o episódio ${act.progress} de`;
                else if (status.includes('completed')) statusText = `Completou`;
                else if (status.includes('dropped')) statusText = `Dropou`;
                else if (status.includes('paused')) statusText = `Pausou`;
                else if (status.includes('planning')) statusText = `Planeja assistir`;
                else statusText = `Atualizou`;

                return `
                <div class="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group cursor-pointer" onclick="App.navigateTo('${act.media.id}')">
                    <div class="w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10">
                        <img src="${act.media.coverImage.medium}" class="w-full h-full object-cover" alt="">
                    </div>
                    <div class="flex-1 min-w-0 text-left">
                        <p class="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">${statusText}</p>
                        <h4 class="font-bold text-white text-sm line-clamp-1 group-hover:text-blue-400 transition-colors">${act.media.title.romaji}</h4>
                        <p class="text-[9px] text-slate-500 font-medium mt-1 uppercase tracking-tighter">${date}</p>
                    </div>
                </div>
                `;
            }).join('');
        } catch (e) {
            feed.innerHTML = '<p class="text-center text-red-500 py-10">Erro ao carregar feed.</p>';
        }
    },

    async loadOverview() {
        console.log('PROFILE_DEBUG: Loading Overview...', this.userData.stats);
        
        const genreContainer = document.getElementById('genre-stats');
        const statusContainer = document.getElementById('status-stats');
        const charContainer = document.getElementById('favorite-characters');
        const studioContainer = document.getElementById('favorite-studios');

        if (!this.userData.isAniList) {
            if (genreContainer) genreContainer.innerHTML = '<div class="col-span-full py-10 text-center text-slate-500">Conecte sua conta AniList para ver estatísticas detalhadas.</div>';
            return;
        }

        if (!this.userData.stats) {
            if (genreContainer) genreContainer.innerHTML = '<div class="col-span-full py-10 text-center text-blue-500 animate-pulse font-bold">Sincronizando dados com AniList...</div>';
            return;
        }

        const stats = this.userData.stats.anime || this.userData.stats;
        console.log('PROFILE_DEBUG: Anime Stats:', stats);
        
        // Personalidade Otaku based on Top Genre
        if (stats.genres && stats.genres.length > 0) {
            const topGenre = stats.genres[0].genre;
            const personalities = {
                'Action': 'Guerreiro Shonen',
                'Romance': 'Eterno Romântico',
                'Comedy': 'Mestre do Riso',
                'Drama': 'Coração Sensível',
                'Slice of Life': 'Observador do Cotidiano',
                'Fantasy': 'Explorador de Mundos',
                'Horror': 'Caçador de Sombras',
                'Mystery': 'Detetive de Mistérios',
                'Psychological': 'Analista Mental',
                'Sci-Fi': 'Viajante do Tempo',
                'Sports': 'Atleta Determinado',
                'Supernatural': 'Médium Espiritual',
                'Thriller': 'Mestre do Suspense',
                'Ecchi': 'Apreciador de Cultura',
                'Adventure': 'Aventureiro Sem Fim'
            };

            const personality = personalities[topGenre] || 'Explorador de Histórias';
            const nameHeader = document.getElementById('user-name');
            if (nameHeader && !document.getElementById('user-personality')) {
                const badge = document.createElement('span');
                badge.id = 'user-personality';
                badge.className = 'ml-3 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 align-middle';
                badge.textContent = personality;
                nameHeader.parentElement.appendChild(badge);
            }
        }

        // Render Genres
        if (genreContainer) {
            if (stats.genres && stats.genres.length > 0) {
                const maxCount = Math.max(...stats.genres.map(g => g.count));
                genreContainer.innerHTML = stats.genres.slice(0, 8).map(g => {
                    const translated = AniListAPI.maps.genres[g.genre] || g.genre;
                    return `
                    <div class="space-y-2 group">
                        <div class="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span class="group-hover:text-blue-400 transition-colors">${translated}</span>
                            <span class="text-slate-400">${g.count}</span>
                        </div>
                        <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full group-hover:from-blue-500 group-hover:to-indigo-400 transition-all duration-500" style="width: ${(g.count / maxCount) * 100}%"></div>
                        </div>
                    </div>
                `}).join('');
            } else {
                genreContainer.innerHTML = '<p class="col-span-full text-slate-500 text-sm italic">Nenhum dado de gênero encontrado.</p>';
            }
        }

        // Render Status Stats
        if (statusContainer && stats.statuses) {
            statusContainer.innerHTML = stats.statuses.map(s => {
                const translated = AniListAPI.maps.statuses[s.status] || s.status;
                return `
                <div class="flex flex-col gap-1 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group cursor-default">
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-400 transition-colors">${translated}</span>
                    <span class="text-lg font-black text-white">${s.count}</span>
                </div>
            `}).join('');
        }

        // Render Characters
        if (charContainer && this.userData.favourites?.characters?.nodes) {
            const chars = this.userData.favourites.characters.nodes;
            if (chars.length === 0) {
                charContainer.parentElement.classList.add('hidden');
            } else {
                charContainer.innerHTML = chars.map(char => `
                    <div class="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 hover:border-pink-500/50 transition-all shadow-lg">
                        <img src="${char.image.large}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="${char.name.full}">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <span class="text-[10px] font-black text-white leading-tight uppercase tracking-tighter">${char.name.full}</span>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Render Studios
        if (studioContainer && this.userData.favourites?.studios?.nodes) {
            const studios = this.userData.favourites.studios.nodes;
            if (studios.length === 0) {
                studioContainer.parentElement.classList.add('hidden');
            } else {
                studioContainer.innerHTML = studios.map(studio => `
                    <span class="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-orange-600/20 hover:border-orange-500/30 transition-all cursor-pointer">
                        ${studio.name}
                    </span>
                `).join('');
            }
        }

        // Render Voice Actors
        const vaContainer = document.getElementById('voice-actors-stats');
        if (vaContainer && stats.voiceActors) {
            vaContainer.innerHTML = stats.voiceActors.slice(0, 6).map(va => `
                <div class="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl group hover:bg-white/10 transition-all cursor-pointer">
                    <div class="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        <img src="${va.voiceActor.image.large}" class="w-full h-full object-cover" alt="">
                    </div>
                    <div class="flex-1 min-w-0 text-left">
                        <h5 class="text-[11px] font-bold text-white line-clamp-1">${va.voiceActor.name.full}</h5>
                        <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">${va.count} Papéis</p>
                    </div>
                </div>
            `).join('');
        }

        // Render Tags
        const tagsContainer = document.getElementById('tags-stats');
        if (tagsContainer && stats.tags) {
            tagsContainer.innerHTML = stats.tags.slice(0, 10).map(t => `
                <span class="px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
                    #${t.tag.name}
                </span>
            `).join('');
        }

        // Render Years
        const yearsContainer = document.getElementById('years-stats');
        if (yearsContainer && stats.releaseYears) {
            const maxYearCount = Math.max(...stats.releaseYears.map(y => y.count));
            yearsContainer.innerHTML = stats.releaseYears.slice(0, 5).map(y => `
                <div class="flex items-center gap-4">
                    <span class="text-[10px] font-black text-slate-500 w-12 text-left">${y.releaseYear}</span>
                    <div class="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full bg-yellow-600 rounded-full" style="width: ${(y.count / maxYearCount) * 100}%"></div>
                    </div>
                    <span class="text-[10px] font-black text-white w-8 text-right">${y.count}</span>
                </div>
            `).join('');
        }

        // Render Favorite Staff
        const staffContainer = document.getElementById('favorite-staff');
        if (staffContainer && this.userData.favourites?.staff?.nodes) {
            const staff = this.userData.favourites.staff.nodes;
            if (staff.length > 0) {
                staffContainer.innerHTML = staff.map(s => `
                    <div class="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl group hover:bg-white/10 transition-all">
                        <div class="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                            <img src="${s.image.large}" class="w-full h-full object-cover" alt="">
                        </div>
                        <div class="flex-1 min-w-0 text-left">
                            <h5 class="text-[11px] font-bold text-white line-clamp-1">${s.name.full}</h5>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Render Achievements
        this.loadAchievements();
    },

    async loadFavorites() {
        const grid = document.getElementById('section-favorites');
        grid.innerHTML = Array(6).fill(0).map(() => `<div class="skeleton aspect-[2/3] rounded-[1.5rem]"></div>`).join('');
        
        try {
            let favs = [];
            if (this.userData.isAniList) {
                favs = await AniListAPI.getUserFavorites();
            } else {
                const promises = (this.userData.favorites || []).map(id => AniListAPI.getDetails(id));
                favs = await Promise.all(promises);
            }

            if (favs.length === 0) {
                grid.innerHTML = '<div class="col-span-full text-center py-20 text-slate-500 font-medium">Sua lista de favoritos está vazia.</div>';
                return;
            }

            grid.innerHTML = favs.map(anime => `
                <div class="relative group cursor-pointer animate-fade-in" onclick="App.navigateTo('${anime.id}')">
                    <div class="aspect-[2/3] rounded-[1.5rem] overflow-hidden border border-white/5 shadow-xl transition-all duration-500 group-hover:scale-105 group-hover:border-blue-500/50">
                        <img src="${anime.poster}" class="w-full h-full object-cover" alt="">
                        <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <h4 class="mt-4 font-bold text-sm text-slate-300 group-hover:text-white transition-colors truncate">${anime.title}</h4>
                </div>
            `).join('');
        } catch (e) {
            grid.innerHTML = '<p class="text-red-500 text-center col-span-full py-10">Erro ao carregar favoritos.</p>';
        }
    },

    async loadHistory(sort = 'UPDATED_TIME_DESC') {
        const grid = document.getElementById('history-grid');
        if (!grid) return;

        grid.innerHTML = Array(3).fill(0).map(() => `
            <div class="h-[130px] rounded-[2rem] bg-white/5 animate-pulse"></div>
        `).join('');

        try {
            let list = [];
            if (this.userData.isAniList) {
                list = await AniListAPI.getUserAnimeList('CURRENT', sort);
            } else {
                list = this.userData.history || [];
            }
            if (list.length === 0) {
                grid.innerHTML = '<p class="text-slate-500 text-center py-10 col-span-full">Nenhum anime em andamento.</p>';
                return;
            }

            grid.innerHTML = list.map(item => {
                const progress = item.episodes ? Math.round((item.progress / item.episodes) * 100) : 0;
                return `
                <div id="card-${item.id}" class="p-5 bg-white/5 border border-white/5 rounded-[2rem] flex items-center gap-5 group hover:bg-white/10 transition-all relative overflow-hidden min-h-[130px] cursor-pointer" onclick="App.navigateTo('${item.id}')">
                    <div class="w-20 h-28 rounded-xl overflow-hidden shrink-0 shadow-xl relative z-10">
                        <img src="${item.poster}" class="w-full h-full object-cover" alt="">
                    </div>
                    <div class="flex-1 min-w-0 py-1 relative z-10">
                        <h4 class="font-bold text-white text-base mb-1 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                            ${item.title}
                        </h4>
                        <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-3">
                            ${item.format} • EP <span id="progress-${item.id}">${item.progress}</span>/${item.episodes || '?'}
                        </p>
                        
                        <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-2">
                            <div id="bar-${item.id}" class="h-full bg-blue-600 transition-all duration-1000" style="width: ${progress}%"></div>
                        </div>
                        <span class="text-[9px] font-black text-slate-600 uppercase tracking-tighter">${progress}% Concluído</span>
                    </div>
                    <div class="flex flex-col gap-2 relative z-10">
                        <button onclick="event.stopPropagation(); App.incrementProgress('${item.id}', ${item.progress}, ${item.episodes || 999}, ${item.listId || 'null'})" class="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 hover:bg-green-600 hover:text-white transition-all shrink-0 cursor-pointer">
                            <i class="fa-solid fa-plus text-xs"></i>
                        </button>
                        <button onclick="event.stopPropagation(); App.decrementProgress('${item.id}', ${item.progress}, ${item.episodes || 999}, ${item.listId || 'null'})" class="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white transition-all shrink-0 cursor-pointer">
                            <i class="fa-solid fa-minus text-xs"></i>
                        </button>
                    </div>
                </div>
                `;
            }).join('');
        } catch (e) {
            grid.innerHTML = '<p class="text-red-500 text-center py-10">Erro ao carregar progresso.</p>';
        }
    },

    async incrementProgress(id, current, total, listId = null) {
        if (current >= total) {
            UI.showToast('Você já completou este anime!', 'info');
            return;
        }

        const mediaId = parseInt(id);
        const newProgress = parseInt(current) + 1;
        const card = document.getElementById(`card-${id}`);
        const progressText = document.getElementById(`progress-${id}`);
        const progressBar = document.getElementById(`bar-${id}`);

        // Visual Feedback (Borda Verde)
        if (card) {
            card.classList.add('ring-2', 'ring-green-500/50', 'border-green-500/30');
            setTimeout(() => {
                card.classList.remove('ring-2', 'ring-green-500/50', 'border-green-500/30');
            }, 2000);
        }

        try {
            if (this.userData.isAniList) {
                UI.showToast('Sincronizando com AniList...', 'info');
                const cleanListId = listId === 'null' ? null : listId;
                await AniListAPI.updateAnimeProgress(mediaId, newProgress, 'CURRENT', cleanListId);
            } else {
                // Local update
                const index = this.userData.history.findIndex(h => h.id == id);
                if (index !== -1) {
                    this.userData.history[index].progress = newProgress;
                    localStorage.setItem('ah_user_data', JSON.stringify(this.userData));
                }
            }

            // Update UI
            if (progressText) progressText.textContent = newProgress;
            if (progressBar) {
                const newPercent = Math.round((newProgress / total) * 100);
                progressBar.style.width = `${newPercent}%`;
            }

            UI.showToast(`Episódio ${newProgress} marcado como assistido!`, 'success');
            
            // Re-fetch statistics in background
            if (this.userData.isAniList) {
                // Update local storage too to avoid jumpy UI
                const updatedUser = await AniListAPI.getViewer();
                if (updatedUser) {
                    this.userData.stats = updatedUser.statistics;
                    localStorage.setItem('ah_user_data', JSON.stringify(this.userData));
                    this.loadAchievements(); // Silent refresh achievements
                }
            }
        } catch (e) {
            console.error('INCREMENT_ERROR:', e);
            UI.showToast(`Erro: ${e.message || 'Falha na sincronização'}`, 'error');
        }
    },

    async decrementProgress(id, current, total, listId = null) {
        if (current <= 0) return;

        const mediaId = parseInt(id);
        const newProgress = parseInt(current) - 1;
        const card = document.getElementById(`card-${id}`);
        const progressText = document.getElementById(`progress-${id}`);
        const progressBar = document.getElementById(`bar-${id}`);

        // Visual Feedback (Borda Vermelha)
        if (card) {
            card.classList.add('ring-2', 'ring-red-500/50', 'border-red-500/30');
            setTimeout(() => {
                card.classList.remove('ring-2', 'ring-red-500/50', 'border-red-500/30');
            }, 2000);
        }

        try {
            if (this.userData.isAniList) {
                UI.showToast('Sincronizando com AniList...', 'info');
                const cleanListId = listId === 'null' ? null : listId;
                await AniListAPI.updateAnimeProgress(mediaId, newProgress, 'CURRENT', cleanListId);
            } else {
                // Local update
                const index = this.userData.history.findIndex(h => h.id == id);
                if (index !== -1) {
                    this.userData.history[index].progress = newProgress;
                    localStorage.setItem('ah_user_data', JSON.stringify(this.userData));
                }
            }

            // Update UI
            if (progressText) progressText.textContent = newProgress;
            if (progressBar) {
                const newPercent = Math.round((newProgress / total) * 100);
                progressBar.style.width = `${newPercent}%`;
            }

            UI.showToast(`Episódio ${newProgress} removido!`, 'info');
            
            // Background update stats
            if (this.userData.isAniList) {
                const updatedUser = await AniListAPI.getViewer();
                if (updatedUser) {
                    this.userData.stats = updatedUser.statistics;
                    localStorage.setItem('ah_user_data', JSON.stringify(this.userData));
                    this.loadAchievements();
                }
            }
        } catch (e) {
            console.error('DECREMENT_ERROR:', e);
            UI.showToast(`Erro: ${e.message || 'Falha na sincronização'}`, 'error');
        }
    },

    loadAchievements() {
        const container = document.getElementById('achievements-grid');
        if (!container) return;

        const stats = this.userData.stats?.anime || {};
        const count = stats.count || 0;
        const hours = stats.minutesWatched ? Math.round(stats.minutesWatched / 60) : 0;

        const achievements = [
            {
                id: 'starter',
                title: 'Iniciante',
                desc: 'Assistiu seu primeiro anime.',
                icon: 'fa-seedling',
                color: 'text-green-400',
                unlocked: count >= 1
            },
            {
                id: 'marathon',
                title: 'Maratoneiro',
                desc: 'Mais de 100 horas assistidas.',
                icon: 'fa-fire',
                color: 'text-orange-500',
                unlocked: hours >= 100
            },
            {
                id: 'veteran',
                title: 'Veterano',
                desc: 'Assistiu mais de 50 animes.',
                icon: 'fa-medal',
                color: 'text-yellow-500',
                unlocked: count >= 50
            },
            {
                id: 'genre-master',
                title: 'Eclético',
                desc: 'Assistiu 5 ou mais gêneros diferentes.',
                icon: 'fa-masks-theater',
                color: 'text-purple-400',
                unlocked: stats.genres?.length >= 5
            },
            {
                id: 'legend',
                title: 'Lenda',
                desc: 'Mais de 1000 horas de vida dedicadas.',
                icon: 'fa-crown',
                color: 'text-amber-300',
                unlocked: hours >= 1000
            }
        ];

        container.innerHTML = achievements.map(ach => `
            <div class="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl ${ach.unlocked ? 'opacity-100' : 'opacity-30 grayscale'} transition-all hover:bg-white/10">
                <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${ach.color} text-xl">
                    <i class="fa-solid ${ach.icon}"></i>
                </div>
                <div>
                    <h4 class="font-bold text-white text-sm">${ach.title}</h4>
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">${ach.desc}</p>
                </div>
                ${ach.unlocked ? '<i class="fa-solid fa-check-circle text-blue-500 ml-auto"></i>' : ''}
            </div>
        `).join('');
    },

    saveSettings() {
        const newName = document.getElementById('input-username').value;
        const newAvatar = document.getElementById('input-avatar').value;

        if (!newName.trim()) return;

        this.userData.name = newName;
        this.userData.avatar = newAvatar;

        localStorage.setItem('ah_user_data', JSON.stringify(this.userData));
        this.renderProfile();
        UI.showToast('Perfil atualizado com sucesso!', 'success');
    },

    navigateTo(id) {
        window.location.href = `anime.html?id=${id}`;
    }
};

document.addEventListener('DOMContentLoaded', () => ProfileApp.init());
window.App = ProfileApp;
