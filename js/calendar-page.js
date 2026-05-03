/**
 * ANIME_HOUSE // CALENDAR_CONTROLLER v1.0
 */

const CalendarApp = {
    currentOffset: 0,

    async init() {
        UI.initNavbar();
        UI.setupSearch();
        this.renderDayTabs();
        await this.loadAiring(0);
    },



    renderDayTabs() {
        const daysContainer = document.getElementById('calendar-days');
        const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
        const today = new Date();

        daysContainer.innerHTML = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(today.getDate() + (i - today.getDay())); // Start from Sunday
            const dayName = dayNames[date.getDay()];
            const isToday = date.toDateString() === today.toDateString();
            const offset = i - today.getDay();

            return `
                <button onclick="CalendarApp.loadAiring(${offset})" 
                        class="day-tab px-6 py-2.5 rounded-xl text-[12px] font-black transition-all whitespace-nowrap ${isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 active' : 'text-slate-400 hover:text-white hover:bg-white/5'}"
                        data-offset="${offset}">
                    ${dayName}
                </button>
            `;
        }).join('');
    },

    async loadAiring(offset) {
        this.currentOffset = offset;
        const grid = document.getElementById('airing-grid');
        
        // Update UI Tabs
        document.querySelectorAll('.day-tab').forEach(tab => {
            if (parseInt(tab.dataset.offset) === offset) {
                tab.classList.add('bg-blue-600', 'text-white', 'shadow-lg', 'shadow-blue-600/20', 'active');
                tab.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-white/5');
            } else {
                tab.classList.remove('bg-blue-600', 'text-white', 'shadow-lg', 'shadow-blue-600/20', 'active');
                tab.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-white/5');
            }
        });

        // Loading state
        grid.innerHTML = Array(12).fill(0).map(() => `<div class="skeleton aspect-[2/3] rounded-2xl"></div>`).join('');

        try {
            const airingSchedules = await AniListAPI.getAiringByDay(offset);
            if (airingSchedules.length > 0) {
                // Map the airing schedule to a flat anime object for UI.renderHighlight
                const animes = airingSchedules.map(item => {
                    const anime = AniListAPI.mapAniListToInternal(item.media);
                    anime.airingAt = item.airingAt;
                    anime.episode = item.episode;
                    return anime;
                });
                grid.innerHTML = animes.map(anime => UI.renderHighlight(anime)).join('');
            } else {
                grid.innerHTML = '<div class="col-span-full text-center py-20 text-slate-500">Nenhum lançamento previsto para este dia.</div>';
            }
        } catch (error) {
            grid.innerHTML = '<div class="col-span-full text-center py-20 text-red-500">Erro ao carregar calendário.</div>';
        }
    },

    navigateTo(id) {
        window.location.href = `anime.html?id=${id}`;
    }
};

document.addEventListener('DOMContentLoaded', () => CalendarApp.init());
window.App = CalendarApp;
