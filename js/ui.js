/**
 * ANIME_HOUSE // UI_ENGINE v2.1 (Classic Restore)
 */

const UI = {
    // Calendar / Airing Item
    renderAiringItem(item) {
        const media = item.media;
        // Converte o timestamp para o horário de Brasília
        const airDate = new Date(item.airingAt * 1000);
        const airTime = airDate.toLocaleTimeString('pt-BR', { 
            timeZone: 'America/Sao_Paulo', 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const hasAired = (item.airingAt * 1000) < Date.now();

        return `
            <div class="flex-shrink-0 w-32 group cursor-pointer" onclick="App.navigateTo('${media.id}')">
                <div class="relative aspect-[2/3] rounded-md overflow-hidden border border-white/5 mb-2">
                    <img src="${media.coverImage.large}" class="w-full h-full object-cover transition-transform group-hover:scale-110" alt="${media.title.romaji}">
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <i class="fa-solid fa-play text-xl text-white"></i>
                    </div>
                    
                    ${hasAired ? `
                        <div class="absolute top-1 left-1 bg-green-500/90 px-1.5 py-0.5 rounded text-[7px] font-black text-white shadow-lg z-10">
                            LANÇADO
                        </div>
                    ` : ''}

                    <div class="absolute bottom-1 right-1 bg-blue-600 px-1.5 py-0.5 rounded text-[8px] font-black text-white">
                        ${airTime}
                    </div>
                </div>
                <h5 class="text-[10px] font-bold text-slate-300 line-clamp-1 group-hover:text-blue-400 transition-colors">${media.title.romaji}</h5>
            </div>
        `;
    },

    // Template for Top Highlights (Vertical Posters)
    renderHighlight(anime) {
        const airTime = anime.airingAt ? new Date(anime.airingAt * 1000).toLocaleTimeString('pt-BR', { 
            timeZone: 'America/Sao_Paulo', 
            hour: '2-digit', 
            minute: '2-digit' 
        }) : null;

        const hasAired = anime.airingAt ? (anime.airingAt * 1000) < Date.now() : false;

        return `
            <div class="relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer group border border-white/5 shadow-2xl" onclick="App.navigateTo('${anime.id}')">
                <img src="${anime.poster}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="${anime.title}">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
                
                <!-- Calendar Info -->
                ${airTime ? `
                    <div class="absolute top-2 right-2 flex flex-col items-end gap-1.5 z-20">
                        ${hasAired ? '<span class="px-2 py-0.5 bg-green-500/90 text-[8px] font-black rounded-md text-white shadow-lg">LANÇADO</span>' : ''}
                        <span class="px-2 py-0.5 bg-blue-600/90 text-[9px] font-black rounded-md text-white shadow-lg">${airTime}</span>
                    </div>
                ` : `
                    <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-blue-600/90 rounded text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        DESTAQUE
                    </div>
                `}

                <div class="absolute bottom-3 left-3 right-3">
                    <h4 class="text-[10px] md:text-[12px] font-black text-white line-clamp-2 leading-tight drop-shadow-lg group-hover:text-blue-400 transition-colors uppercase tracking-tighter">${anime.title}</h4>
                    ${anime.episode ? `<p class="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">Episódio ${anime.episode}</p>` : ''}
                </div>
            </div>
        `;
    },

    renderHero(anime) {
        const hero = document.getElementById('hero-section');
        if (!hero) return;

        hero.innerHTML = `
            <div class="absolute inset-0">
                <img src="${anime.banner}" 
                     class="w-full h-full object-cover object-center transition-all duration-700 brightness-[0.85] contrast-[1.1]" 
                     style="image-rendering: -webkit-optimize-contrast;" 
                     alt="Banner">
                <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            </div>
        `;
    },

    // Template for Anime Cards (Horizontal 16:9)
    renderCard(anime, isRecent = false) {
        const ep = anime.episodes || 1;
        const clickAction = (isRecent && typeof App.playEpisode === 'function') ? `App.playEpisode('${anime.id}', ${ep})` : `App.navigateTo('${anime.id}')`;
        return `
            <div class="anime-card group flex flex-col cursor-pointer" onclick="${clickAction}">
                <div class="img-container relative aspect-video overflow-hidden">
                    <img src="${anime.poster}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="${anime.title}" loading="lazy">
                    
                    <!-- Top Badges -->
                    <div class="absolute top-2 right-2 flex gap-1 z-20">
                        ${anime.status === 'finished' ? '<span class="px-1.5 py-0.5 badge-final text-[9px] font-black rounded text-white shadow-lg">FINAL</span>' : ''}
                        <span class="px-1.5 py-0.5 badge-leg text-[9px] font-black rounded text-white uppercase shadow-lg">LEG</span>
                        <span class="px-1.5 py-0.5 badge-hd text-[9px] font-black rounded text-white uppercase shadow-lg">FULL HD</span>
                    </div>

                    <!-- Duration Badge -->
                    <div class="absolute top-2 left-2 px-1.5 py-0.5 glass-badge rounded text-[9px] flex items-center gap-1 z-20 font-bold text-white/90">
                        <i class="fa-solid fa-clock text-[8px]"></i>
                        <span>24 min</span>
                    </div>

                    <!-- Hover Play Icon -->
                    <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <div class="w-12 h-12 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                            <i class="fa-solid fa-play text-lg text-white ml-1"></i>
                        </div>
                    </div>
                </div>
                
                <div class="py-2 px-1">
                    <h3 class="font-bold text-[13px] leading-tight text-slate-200 line-clamp-1 group-hover:text-blue-400 transition-colors duration-300 tracking-tight">${anime.title}</h3>
                    <p class="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">Episódio ${anime.episodes || '??'}</p>
                </div>
            </div>
        `;
    },

    // Template for Search Results
    renderSearchResult(anime) {
        return `
            <div class="flex items-center gap-5 p-4 bg-slate-800/30 rounded-2xl border border-transparent hover:border-blue-500/50 hover:bg-slate-800/60 cursor-pointer transition-all group" onclick="App.navigateTo('${anime.id}')">
                <img src="${anime.poster}" class="w-16 h-24 object-cover rounded-xl shadow-md" alt="">
                <div class="flex-1">
                    <h4 class="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">${anime.title}</h4>
                    <p class="text-[10px] text-brand-blue font-black uppercase tracking-widest">${anime.format} • ${anime.year} • ${anime.episodes || '??'} EPS</p>
                    <p class="text-sm text-slate-400 line-clamp-2 mt-2 font-medium">${anime.description || 'Sem descrição.'}</p>
                </div>
                <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <i data-lucide="chevron-right" class="w-5 h-5"></i>
                </div>
            </div>
        `;
    },

    // Loading Skeletons
    renderSkeleton() {
        return `
            <div class="flex flex-col gap-4">
                <div class="skeleton aspect-[2/3] rounded-xl"></div>
                <div class="skeleton h-4 w-3/4 rounded-md"></div>
                <div class="skeleton h-3 w-1/2 rounded-md"></div>
            </div>
        `;
    },

    // Ranking Item Component
    renderRankingCard(anime, index) {
        const rank = index + 1;
        const rankColor = rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-amber-600' : 'text-slate-500';
        
        return `
            <div class="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30 border border-white/5 hover:bg-slate-800/60 hover:border-blue-500/30 transition-all cursor-pointer group" onclick="App.navigateTo('${anime.id}')">
                <div class="text-2xl font-black ${rankColor} w-8 text-center">#${rank}</div>
                
                <div class="w-14 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-white/10">
                    <img src="${anime.poster}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="${anime.title}">
                </div>

                <div class="flex-grow">
                    <h4 class="text-sm font-bold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">${anime.title}</h4>
                    <div class="flex items-center gap-3 mt-1">
                        <div class="flex items-center gap-1 text-yellow-500 text-[10px] font-bold">
                            <i class="fa-solid fa-star fa-xs"></i>
                            <span>${anime.rating}</span>
                        </div>
                        <span class="text-[10px] text-slate-500 font-medium uppercase">${anime.format} • ${anime.year}</span>
                    </div>
                </div>

                <div class="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border border-white/5 group-hover:bg-blue-600 transition-colors">
                    <i class="fa-solid fa-chevron-right text-xs text-white"></i>
                </div>
            </div>
        `;
    },

    // Pagination System
    renderPagination(currentPage, totalPages = 50) { // Limit fixed for Kitsu stability
        let buttons = '';
        
        // Prev Button
        buttons += `
            <button onclick="App.changePage(${currentPage - 1})" 
                    class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 border border-white/5 hover:border-blue-500 transition-all ${currentPage === 1 ? 'opacity-30 pointer-events-none' : ''}">
                <i class="fa-solid fa-chevron-left text-xs"></i>
            </button>
        `;

        // Page Numbers
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, start + 4);

        for (let i = start; i <= end; i++) {
            buttons += `
                <button onclick="App.changePage(${i})" 
                        class="w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm transition-all border ${i === currentPage ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white hover:border-slate-600'}">
                    ${i}
                </button>
            `;
        }

        // Next Button
        buttons += `
            <button onclick="App.changePage(${currentPage + 1})" 
                    class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 border border-white/5 hover:border-blue-500 transition-all ${currentPage === totalPages ? 'opacity-30 pointer-events-none' : ''}">
                <i class="fa-solid fa-chevron-right text-xs"></i>
            </button>
        `;

        return `
            <div class="flex items-center justify-center gap-2 mt-12 py-8 border-t border-white/5">
                ${buttons}
            </div>
        `;
    },

    // Notification Toast
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        
        const configs = {
            success: { bg: 'bg-green-600', icon: 'fa-circle-check' },
            error: { bg: 'bg-red-600', icon: 'fa-circle-exclamation' },
            info: { bg: 'bg-blue-600', icon: 'fa-circle-info' }
        };
        
        const config = configs[type] || configs.info;
        
        toast.className = `fixed bottom-8 right-8 z-[200] px-6 py-4 ${config.bg} rounded-2xl shadow-2xl text-white font-bold text-sm slide-in-right flex items-center gap-3 border border-white/10`;
        toast.innerHTML = `
            <i class="fa-solid ${config.icon} text-lg"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-x-full');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    // Global Navbar Initialization
    initNavbar() {
        console.log('AH_UI: Initializing Navbar...');
        const saved = localStorage.getItem('ah_user_data');
        const userSection = document.getElementById('user-section');

        if (!saved && userSection) {
            console.log('AH_UI: No user found, showing login button.');
            userSection.innerHTML = `
                <a href="login.html" class="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black rounded-lg transition-all shadow-lg shadow-blue-500/20 uppercase tracking-tighter">
                    Entrar
                </a>
            `;
            return;
        }

        // Sync Avatar and Listeners
        try {
            const avatarNav = document.getElementById('user-avatar-nav');
            if (saved && avatarNav) {
                const data = JSON.parse(saved);
                const avatarUrl = data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=3b82f6&color=fff`;
                avatarNav.src = avatarUrl;
                console.log('AH_UI: Syncing avatar for', data.name);
            }

            // User Dropdown Toggle
            const userBtn = document.getElementById('user-menu-trigger');
            const userDropdown = document.getElementById('user-dropdown');
            
            if (userBtn && userDropdown) {
                console.log('AH_UI: Setting up dropdown listeners...');
                
                // Remove existing to avoid duplicates
                userBtn.onclick = null; 
                
                userBtn.onclick = (e) => {
                    console.log('AH_UI: Toggle dropdown');
                    e.preventDefault();
                    e.stopPropagation();
                    const isHidden = userDropdown.classList.contains('hidden');
                    
                    // Close all other dropdowns if any
                    userDropdown.classList.toggle('hidden');
                };

                // Close when clicking outside
                if (!window.ah_dropdown_listener_set) {
                    document.addEventListener('click', (e) => {
                        if (userDropdown && !userDropdown.classList.contains('hidden')) {
                            if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                                console.log('AH_UI: Auto-closing dropdown (click outside)');
                                userDropdown.classList.add('hidden');
                            }
                        }
                    });
                    window.ah_dropdown_listener_set = true;
                }
            } else {
                console.warn('AH_UI: User menu elements not found!');
            }
        } catch (err) {
            console.error('AH_UI: Error in initNavbar', err);
        }

        // Random Anime Logic
        const randomBtn = document.getElementById('random-anime');
        if (randomBtn) {
            randomBtn.onclick = async () => {
                const id = await AniListAPI.getRandomAnime();
                if (id) window.location.href = `anime.html?id=${id}`;
            };
        }
    },

    logout() {
        localStorage.removeItem('ah_user_data');
        localStorage.removeItem('ah_token');
        window.location.href = 'index.html';
    },

    // Standard Navbar HTML
    getNavbarHTML() {
        return `
            <div class="container-max h-16 flex items-center justify-between">
                <div class="flex items-center gap-10">
                    <a href="index.html" class="flex items-center gap-1 scale-90 md:scale-100 origin-left">
                        <span class="text-xl md:text-2xl font-black tracking-tighter uppercase text-white">ANIME</span>
                        <span class="text-xl md:text-2xl font-black tracking-tighter uppercase text-blue-500">HOUSE</span>
                    </a>

                    <div class="hidden lg:flex items-center gap-6 text-[13px] font-medium text-slate-300">
                        <a href="index.html" class="hover:text-white transition-colors">Início</a>
                        <a href="lista.html" class="hover:text-white transition-colors">Lista de Animes</a>
                        <a href="generos.html" class="hover:text-white transition-colors">Gêneros</a>
                        <a href="calendario.html" class="hover:text-white transition-colors">Calendário</a>
                        <a href="lista.html?sort=POPULARITY_DESC" class="hover:text-white transition-colors">Top 100</a>
                        <a href="lista.html?sort=TRENDING_DESC" class="hover:text-white transition-colors">Temporada</a>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <button id="search-trigger" class="w-9 h-9 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-brand-blue transition-all">
                        <i class="fa-solid fa-magnifying-glass text-sm"></i>
                    </button>
                    <button id="random-anime" class="w-9 h-9 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-brand-blue transition-all hidden sm:flex" title="Anime Aleatório">
                        <i class="fa-solid fa-shuffle text-sm"></i>
                    </button>
                    
                    <div id="user-section" class="relative">
                        <button id="user-menu-trigger" class="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 text-white border border-white/10 overflow-hidden hover:border-blue-500 transition-all focus:outline-none">
                            <img id="user-avatar-nav" src="https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff" class="w-full h-full object-cover pointer-events-none" alt="">
                        </button>
                        
                        <div id="user-dropdown" class="absolute right-0 mt-3 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-2 hidden z-[60]">
                            <a href="perfil.html" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                <i class="fa-solid fa-user text-xs text-blue-500"></i> Meu Perfil
                            </a>
                            <div class="h-px bg-white/5 my-1"></div>
                            <button onclick="UI.logout()" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors text-left">
                                <i class="fa-solid fa-right-from-bracket text-xs"></i> Sair
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Standard Footer HTML
    getFooterHTML() {
        return `
            <div class="container-max">
                <div class="grid md:grid-cols-4 gap-12 text-left">
                    <div class="col-span-2">
                        <span class="text-2xl font-black tracking-tighter uppercase mb-6 block">ANIME<span class="text-blue-500">HOUSE</span></span>
                        <p class="text-slate-400 max-w-sm mb-8">A melhor plataforma para você assistir seus animes favoritos em alta definição com a melhor experiência otaku.</p>
                        <div class="flex gap-4">
                            <a href="#" class="w-11 h-11 flex items-center justify-center bg-slate-800 hover:bg-blue-600 transition-all rounded-full">
                                <i class="fa-brands fa-instagram text-lg"></i>
                            </a>
                            <a href="#" class="w-11 h-11 flex items-center justify-center bg-slate-800 hover:bg-blue-600 transition-all rounded-full">
                                <i class="fa-brands fa-x-twitter text-lg"></i>
                            </a>
                            <a href="#" class="w-11 h-11 flex items-center justify-center bg-slate-800 hover:bg-blue-600 transition-all rounded-full">
                                <i class="fa-brands fa-github text-lg"></i>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-bold mb-6 text-sm uppercase tracking-widest text-slate-500">Navegação</h4>
                        <ul class="space-y-4 text-slate-400 text-sm">
                            <li><a href="index.html" class="hover:text-white transition-colors">Início</a></li>
                            <li><a href="lista.html" class="hover:text-white transition-colors">Lista de Animes</a></li>
                            <li><a href="generos.html" class="hover:text-white transition-colors">Gêneros</a></li>
                            <li><a href="calendario.html" class="hover:text-white transition-colors">Calendário</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-bold mb-6 text-sm uppercase tracking-widest text-slate-500">Legal</h4>
                        <ul class="space-y-4 text-slate-400 text-sm">
                            <li><a href="privacidade.html" class="hover:text-white transition-colors">Privacidade</a></li>
                            <li><a href="termos.html" class="hover:text-white transition-colors">Termos de Uso</a></li>
                            <li><a href="dmca.html" class="hover:text-white transition-colors">DMCA</a></li>
                        </ul>
                    </div>
                </div>
                <div class="mt-20 pt-8 border-t border-slate-800 text-center text-slate-600 text-xs">
                    © 2026 Anime House • Todos os direitos reservados.
                </div>
            </div>
        `;
    },

    // Standard Search Modal HTML
    getSearchModalHTML() {
        return `
            <div class="w-full max-w-3xl">
                <div class="flex items-center gap-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                    <i class="fa-solid fa-magnifying-glass w-6 h-6 text-blue-500"></i>
                    <input type="text" id="search-input" placeholder="O que você quer assistir hoje?"
                        class="w-full bg-transparent border-none text-xl focus:ring-0 outline-none">
                    <button id="close-search" class="p-2 hover:bg-slate-700 rounded-lg transition-all">
                        <i class="fa-solid fa-xmark w-6 h-6"></i>
                    </button>
                </div>
                <div id="search-results" class="mt-8 grid gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar"></div>
            </div>
        `;
    },
    // Global Search Setup
    setupSearch() {
        const trigger = document.getElementById('search-trigger');
        let modal = document.getElementById('search-modal');
        
        if (!trigger) return;

        // Ensure modal exists
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'search-modal';
            modal.className = 'fixed inset-0 z-[100] bg-brand-bg/95 backdrop-blur-lg flex items-start justify-center pt-32 px-6 hidden';
            modal.innerHTML = this.getSearchModalHTML();
            document.body.appendChild(modal);
        }

        const input = document.getElementById('search-input');
        const close = document.getElementById('close-search');
        const results = document.getElementById('search-results');

        trigger.onclick = () => {
            modal.classList.remove('hidden');
            input.focus();
        };

        const closeModal = () => modal.classList.add('hidden');
        if (close) close.onclick = closeModal;

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });

        // Search logic
        let timeout;
        input.oninput = (e) => {
            clearTimeout(timeout);
            const query = e.target.value.trim();
            
            if (!query) {
                results.innerHTML = '';
                return;
            }

            timeout = setTimeout(async () => {
                results.innerHTML = '<div class="col-span-full text-center py-10"><i class="fa-solid fa-spinner fa-spin text-2xl text-blue-500"></i></div>';
                try {
                    const searchData = await AniListAPI.search(query);
                    results.innerHTML = searchData.map(this.renderSearchResult).join('');
                } catch (err) {
                    results.innerHTML = '<p class="col-span-full text-center text-red-500">Erro na busca.</p>';
                }
            }, 500);
        };
    },

    // Global UI Initialization
    init() {
        const nav = document.querySelector('nav');
        // Se a nav existir e estiver vazia ou com a marca antiga, injeta
        if (nav && (!nav.innerHTML.trim() || nav.innerHTML.includes('BETTER'))) {
            nav.innerHTML = this.getNavbarHTML();
        }

        const footer = document.querySelector('footer');
        if (footer && (!footer.innerHTML.trim() || footer.innerHTML.includes('BETTER'))) {
            footer.innerHTML = this.getFooterHTML();
        }

        this.initNavbar();
        this.setupSearch();
    }
};

window.UI = UI;

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => UI.init());
