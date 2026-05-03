/**
 * ANIME_HOUSE // LIST_CONTROLLER v1.0
 */

const ListApp = {
    filters: {
        page: 1,
        perPage: 24,
        genre: null,
        year: null,
        sort: 'TRENDING_DESC'
    },

    async init() {
        this.setupEventListeners();
        UI.initNavbar();
        UI.setupSearch();
        this.loadFromURL();
        await this.loadAnimes();
    },

    setupEventListeners() {
        // Filter changes
        document.getElementById('filter-sort').onchange = (e) => {
            this.filters.sort = e.target.value;
            this.filters.page = 1;
            this.updateURL();
            this.loadAnimes();
        };

        document.getElementById('filter-genre').onchange = (e) => {
            this.filters.genre = e.target.value || null;
            this.filters.page = 1;
            this.updateURL();
            this.loadAnimes();
        };

        document.getElementById('filter-year').onchange = (e) => {
            this.filters.year = e.target.value ? parseInt(e.target.value) : null;
            this.filters.page = 1;
            this.updateURL();
            this.loadAnimes();
        };
    },

    async loadAnimes() {
        const grid = document.getElementById('list-grid');
        grid.innerHTML = Array(12).fill(0).map(() => `<div class="skeleton aspect-[2/3] rounded-2xl"></div>`).join('');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });

        try {
            const response = await AniListAPI.browse(this.filters);
            
            if (response.media.length > 0) {
                // Use UI.renderHighlight for consistent vertical card look
                grid.innerHTML = response.media.map(UI.renderHighlight).join('');
                this.renderPagination(response.pageInfo);
            } else {
                grid.innerHTML = '<div class="col-span-full text-center py-20 text-slate-500">Nenhum anime encontrado com esses filtros.</div>';
                document.getElementById('pagination-container').innerHTML = '';
            }
        } catch (error) {
            grid.innerHTML = '<div class="col-span-full text-center py-20 text-red-500">Erro ao carregar lista.</div>';
        }
    },

    renderPagination(pageInfo) {
        const container = document.getElementById('pagination-container');
        container.innerHTML = UI.renderPagination(pageInfo.currentPage, pageInfo.lastPage);
    },

    changePage(page) {
        this.filters.page = page;
        this.updateURL();
        this.loadAnimes();
    },

    updateURL() {
        const params = new URLSearchParams();
        if (this.filters.page > 1) params.set('page', this.filters.page);
        if (this.filters.genre) params.set('genre', this.filters.genre);
        if (this.filters.year) params.set('year', this.filters.year);
        if (this.filters.sort !== 'TRENDING_DESC') params.set('sort', this.filters.sort);
        
        const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.pushState({}, '', newURL);
    },

    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        this.filters.page = parseInt(params.get('page')) || 1;
        this.filters.genre = params.get('genre') || null;
        this.filters.year = params.get('year') ? parseInt(params.get('year')) : null;
        this.filters.sort = params.get('sort') || 'TRENDING_DESC';

        // Update selects
        if (this.filters.genre) document.getElementById('filter-genre').value = this.filters.genre;
        if (this.filters.year) document.getElementById('filter-year').value = this.filters.year;
        if (this.filters.sort) document.getElementById('filter-sort').value = this.filters.sort;
    },

    navigateTo(id) {
        window.location.href = `anime.html?id=${id}`;
    }
};

document.addEventListener('DOMContentLoaded', () => ListApp.init());
// Global callback for UI pagination
window.App = ListApp;
