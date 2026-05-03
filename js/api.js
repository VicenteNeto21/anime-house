/**
 * ANIME_HOUSE // API_CORE v2.0
 * Protocol: Kitsu_Edge_v1
 */

const API_CONFIG = {
    Kitsu: {
        BASE_URL: 'https://kitsu.io/api/edge',
        CACHE_PREFIX: 'AH_V2_CACHE_',
    },
    AniList: {
        BASE_URL: 'https://graphql.anilist.co',
        CLIENT_ID: 10978,
        CLIENT_SECRET: 'CFkVCn7lfW0t6J8DHEKtfdSAD5I5iDBaBHWkShPD'
    },
    DEFAULT_TTL: 3600000 // 1 hour
};

const AnimeAPI = {
    async request(endpoint, options = {}) {
        const cacheKey = `${API_CONFIG.Kitsu.CACHE_PREFIX}${btoa(endpoint)}`;

        // Skip cache if requested
        if (!options.skipCache) {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < (options.ttl || API_CONFIG.DEFAULT_TTL)) {
                    return data;
                }
            }
        }

        try {
            const response = await fetch(`${API_CONFIG.Kitsu.BASE_URL}${endpoint}`, {
                headers: {
                    'Accept': 'application/vnd.api+json',
                    'Content-Type': 'application/vnd.api+json'
                }
            });

            if (!response.ok) throw new Error(`CORE_PROTOCOL_FAILURE: ${response.status}`);

            const data = await response.json();

            // Background cache update
            localStorage.setItem(cacheKey, JSON.stringify({
                data,
                timestamp: Date.now()
            }));

            return data;
        } catch (error) {
            console.error('API_SYNC_ERROR:', error);
            throw error;
        }
    },

    // Protocol: Transform Kitsu data to Internal Format
    mapKitsuToInternal(kitsuItem) {
        if (!kitsuItem) return null;
        const attr = kitsuItem.attributes;
        return {
            id: kitsuItem.id,
            title: attr.canonicalTitle || attr.titles.en || attr.titles.en_jp,
            synopsis: attr.synopsis,
            poster: attr.posterImage?.large || attr.posterImage?.original,
            banner: attr.coverImage?.large || attr.posterImage?.large,
            rating: attr.averageRating ? (parseFloat(attr.averageRating) / 10).toFixed(1) : 'N/A',
            year: attr.startDate ? new Date(attr.startDate).getFullYear() : 'N/A',
            episodes: attr.episodeCount || '??',
            status: attr.status,
            type: attr.subtype
        };
    },

    async getTrending(limit = 10) {
        const data = await this.request(`/trending/anime?limit=${limit}`);
        return (data.data || []).map(this.mapKitsuToInternal);
    },

    async getRecent(limit = 20, page = 1) {
        const offset = (page - 1) * limit;
        const data = await this.request(`/anime?sort=-createdAt&page[limit]=${limit}&page[offset]=${offset}`);
        return (data.data || []).map(this.mapKitsuToInternal);
    },

    async search(query) {
        if (!query) return [];
        const data = await this.request(`/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=12`);
        return (data.data || []).map(this.mapKitsuToInternal);
    },

    async getAnimeDetails(id) {
        const data = await this.request(`/anime/${id}`);
        return this.mapKitsuToInternal(data.data);
    }
};

const AniListAPI = {
    // Translation Maps
    maps: {
        genres: {
            'Action': 'Ação', 'Adventure': 'Aventura', 'Comedy': 'Comédia', 'Drama': 'Drama',
            'Fantasy': 'Fantasia', 'Horror': 'Terror', 'Mahou Shoujo': 'Garotas Mágicas',
            'Mecha': 'Mecha', 'Music': 'Música', 'Mystery': 'Mistério', 'Psychological': 'Psicológico',
            'Romance': 'Romance', 'Sci-Fi': 'Ficção Científica', 'Slice of Life': 'Cotidiano',
            'Sports': 'Esportes', 'Supernatural': 'Sobrenatural', 'Thriller': 'Suspense',
            'Ecchi': 'Ecchi', 'Super Power': 'Super Poderes', 'Military': 'Militar', 'Space': 'Espaço',
            'Hentai': 'Hentai', 'Comedy': 'Comédia'
        },
        seasons: {
            'WINTER': 'Inverno', 'SPRING': 'Primavera', 'SUMMER': 'Verão', 'FALL': 'Outono'
        },
        formats: {
            'TV': 'Anime', 'TV_SHORT': 'Anime Curto', 'MOVIE': 'Filme', 'OVA': 'OVA', 'ONA': 'ONA', 'SPECIAL': 'Especial', 'MUSIC': 'Clipe'
        },
        statuses: {
            'WATCHING': 'Assistindo', 'CURRENT': 'Assistindo', 'COMPLETED': 'Completado', 
            'PAUSED': 'Pausado', 'DROPPED': 'Dropado', 'PLANNING': 'Planejado', 'REPEATING': 'Reassistindo'
        }
    },

    setToken(token) {
        localStorage.setItem('ah_anilist_token', token);
    },

    getToken() {
        return localStorage.getItem('ah_anilist_token');
    },

    getUserData() {
        const saved = localStorage.getItem('ah_user_data');
        if (!saved) return null;
        try {
            const data = JSON.parse(saved);
            if (!data.history) data.history = [];
            if (!data.favorites) data.favorites = [];
            return data;
        } catch (e) {
            return null;
        }
    },

    async query(query, variables = {}, options = {}) {
        // Safe key generation without btoa risk
        const queryStr = JSON.stringify({ query, variables });
        const cacheKey = `AH_ANILIST_${this.hashString(queryStr)}`;

        if (!options.skipCache) {
            try {
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < (options.ttl || API_CONFIG.DEFAULT_TTL)) {
                        return data;
                    }
                }
            } catch (e) {
                console.warn('CACHE_READ_ERROR:', e);
            }
        }

        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(API_CONFIG.AniList.BASE_URL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ query, variables })
            });

            const result = await response.json();

            if (result.errors) {
                console.error('GRAPHQL_ERRORS:', result.errors);
                throw new Error(result.errors[0].message);
            }

            // Update Cache (Safe)
            try {
                localStorage.setItem(cacheKey, JSON.stringify({
                    data: result.data,
                    timestamp: Date.now()
                }));
            } catch (e) {
                console.warn('CACHE_WRITE_ERROR:', e);
                // Clear old cache if full
                if (e.name === 'QuotaExceededError') {
                    this.clearOldCache();
                }
            }

            return result.data;
        } catch (error) {
            console.error('ANILIST_FETCH_FAILURE:', error);
            throw error;
        }
    },

    async getViewer() {
        const gql = `
        query {
          Viewer {
            id
            name
            about
            avatar { large }
            bannerImage
            statistics {
              anime {
                count
                minutesWatched
                meanScore
                episodesWatched
                genres(limit: 10, sort: COUNT_DESC) {
                  genre
                  count
                }
                tags(limit: 10, sort: COUNT_DESC) {
                  tag { name }
                  count
                }
                voiceActors(limit: 10, sort: COUNT_DESC) {
                  voiceActor { 
                    name { full }
                    image { large }
                  }
                  count
                }
                statuses(sort: COUNT_DESC) {
                  status
                  count
                }
                releaseYears(limit: 10, sort: COUNT_DESC) {
                  releaseYear
                  count
                }
              }
            }
            favourites {
              characters(perPage: 6) {
                nodes {
                  id
                  name { full }
                  image { large }
                }
              }
              studios(perPage: 12) {
                nodes {
                  id
                  name
                }
              }
              staff(perPage: 6) {
                nodes {
                  id
                  name { full }
                  image { large }
                }
              }
            }
          }
        }
        `;
        const result = await this.query(gql);
        return result.Viewer;
    },

    async getUserActivity(userId) {
        if (!userId) {
            const user = JSON.parse(localStorage.getItem('ah_user_data'));
            userId = user?.id;
        }
        if (!userId) return [];

        const gql = `
        query ($userId: Int) {
          Page (perPage: 10) {
            activities (userId: $userId, type: MEDIA_LIST, sort: ID_DESC) {
              ... on ListActivity {
                id
                type
                status
                progress
                media {
                  id
                  title { romaji }
                  coverImage { medium }
                }
                createdAt
              }
            }
          }
        }
        `;
        try {
            const result = await this.query(gql, { userId });
            return result.Page.activities;
        } catch (e) {
            console.error('ACTIVITY_ERROR:', e);
            return [];
        }
    },

    // Simple hash for cache keys
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return hash.toString(36);
    },

    clearOldCache() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('AH_')) {
                localStorage.removeItem(key);
            }
        }
    },

    async getUserAnimeList(status = 'CURRENT', sort = 'UPDATED_TIME_DESC') {
        const gql = `
        query ($userId: Int, $status: MediaListStatus, $sort: [MediaListSort]) {
          MediaListCollection(userId: $userId, status: $status, type: ANIME, sort: $sort) {
            lists {
              entries {
                id
                progress
                media {
                  id
                  title { romaji english native }
                  coverImage { large extraLarge }
                  bannerImage
                  averageScore
                  format
                  episodes
                  genres
                  seasonYear
                }
              }
            }
          }
        }`;
        
        try {
            const userData = this.getUserData();
            if (!userData?.id) throw new Error('User not logged in or ID missing.');
            
            const data = await this.query(gql, { userId: userData.id, status, sort }, { skipCache: true });
            const list = data.MediaListCollection.lists[0];
            if (!list) return [];

            return list.entries.map(entry => ({
                ...this.mapAniListToInternal(entry.media),
                progress: entry.progress,
                listId: entry.id
            }));
        } catch (error) {
            console.error('USER_LIST_ERROR:', error);
            return [];
        }
    },

    async getUserFavorites() {
        const gql = `
        query ($userId: Int) {
          User(id: $userId) {
            favourites {
              anime {
                nodes {
                  id
                  title { romaji english native }
                  coverImage { large extraLarge }
                  bannerImage
                  averageScore
                  format
                  episodes
                  genres
                  seasonYear
                }
              }
            }
          }
        }`;

        try {
            const userData = this.getUserData();
            if (!userData?.id) throw new Error('User not logged in or ID missing.');

            const data = await this.query(gql, { userId: userData.id }, { skipCache: true });
            const nodes = data.User.favourites.anime.nodes || [];
            return nodes.map(m => this.mapAniListToInternal(m));
        } catch (error) {
            console.error('USER_FAV_ERROR:', error);
            return [];
        }
    },

    async updateAnimeProgress(mediaId, progress, status = 'CURRENT', listId = null) {
        const gql = `
        mutation ($mediaId: Int, $progress: Int, $status: MediaListStatus, $listId: Int) {
          SaveMediaListEntry (mediaId: $mediaId, progress: $progress, status: $status, id: $listId) {
            id
            progress
            status
          }
        }
        `;
        try {
            const result = await this.query(gql, { mediaId, progress, status, listId });
            return result.SaveMediaListEntry;
        } catch (e) {
            console.error('UPDATE_PROGRESS_ERROR:', e);
            throw e;
        }
    },

    mapAniListToInternal(media) {
        if (!media) return null;

        const translatedGenres = (media.genres || []).map(g => this.maps.genres[g] || g);
        const seasonName = this.maps.seasons[media.season] || media.season || "";
        const seasonDisplay = seasonName ? `${seasonName} ${media.seasonYear}` : String(media.seasonYear || "N/A");

        return {
            id: media.id,
            title: media.title.romaji || media.title.english,
            poster: media.coverImage.extraLarge || media.coverImage.large,
            banner: media.bannerImage,
            description: media.description,
            rating: media.averageScore ? (media.averageScore / 10).toFixed(1) : "N/A",
            year: media.seasonYear || media.startDate?.year || "2024",
            season: seasonDisplay,
            format: this.maps.formats[media.format] || media.format || "Série",
            status: media.status === 'RELEASING' ? 'Lançando' : 'Finalizado',
            episodes: media.episodes || (media.nextAiringEpisode ? media.nextAiringEpisode.episode - 1 : 12),
            genres: translatedGenres,
            studios: media.studios?.nodes?.map(s => s.name) || [],
            tags: media.tags?.map(t => t.name) || [],
            characters: media.characters?.nodes?.map(c => ({
                name: c.name.full,
                image: c.image.large
            })) || [],
            recommendations: media.recommendations?.nodes?.map(r => {
                const rec = r.mediaRecommendation;
                if (!rec) return null;
                return {
                    id: rec.id,
                    title: rec.title.romaji || rec.title.english,
                    poster: rec.coverImage.large,
                    rating: rec.averageScore ? (rec.averageScore / 10).toFixed(1) : "N/A",
                    year: rec.seasonYear || "N/A"
                };
            }).filter(Boolean) || [],
            trailer: media.trailer?.site === 'youtube' ? media.trailer.id : null,
            relations: media.relations?.edges?.map(edge => {
                const node = edge.node;
                const relationTypeMap = {
                    'PREQUEL': 'Anterior',
                    'SEQUEL': 'Continuação',
                    'PARENT': 'Original',
                    'SIDE_STORY': 'História Paralela',
                    'SPIN_OFF': 'Spin-off',
                    'SUMMARY': 'Resumo',
                    'ALTERNATIVE': 'Versão Alternativa'
                };
                const seasonName = this.maps.seasons[node.season] || node.season || "";
                const seasonDisplay = seasonName ? `${seasonName} ${node.seasonYear}` : String(node.seasonYear || "");

                return {
                    id: node.id,
                    title: node.title.romaji || node.title.english,
                    poster: node.coverImage.large,
                    type: relationTypeMap[edge.relationType] || 'Relacionado',
                    format: this.maps.formats[node.format] || node.format || 'Anime',
                    season: seasonDisplay
                };
            }) || []
        };
    },

    async getTrending(limit = 6) {
        const gql = `
        query ($limit: Int) {
          Page (perPage: $limit) {
            media (sort: TRENDING_DESC, type: ANIME, isAdult: false) {
              id title { romaji english } coverImage { extraLarge large } bannerImage
              description averageScore season seasonYear episodes status format genres
              startDate { year }
            }
          }
        }`;
        const data = await this.query(gql, { limit });
        return (data.Page.media || []).map(m => this.mapAniListToInternal(m));
    },

    async getTopRated(limit = 10) {
        const gql = `
        query ($limit: Int) {
          Page (perPage: $limit) {
            media (sort: SCORE_DESC, type: ANIME, isAdult: false) {
              id title { romaji english } coverImage { extraLarge large } bannerImage
              description averageScore season seasonYear episodes status format genres
              startDate { year }
            }
          }
        }`;
        const data = await this.query(gql, { limit });
        return (data.Page.media || []).map(m => this.mapAniListToInternal(m));
    },

    async getAiringByDay(dayOffset = 0) {
        // Calcula o dia com base no offset (0 = hoje, 1 = amanhã, etc.)
        const date = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + dayOffset);
        
        const startUnix = Math.floor(date.getTime() / 1000);
        const endUnix = startUnix + 86400;

        const gql = `
        query ($start: Int, $end: Int) {
          Page (perPage: 30) {
            airingSchedules (airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
              episode
              airingAt
              media {
                id title { romaji english } coverImage { large }
              }
            }
          }
        }`;

        try {
            const data = await this.query(gql, { start: startUnix, end: endUnix }, { skipCache: true });
            return data.Page.airingSchedules || [];
        } catch (error) {
            console.error('AIRING_FETCH_ERROR:', error);
            throw error;
        }
    },

    async getRandomAnime() {
        // Sorteia uma página entre as 500 mais populares para garantir qualidade
        const randomPage = Math.floor(Math.random() * 500) + 1;
        const gql = `
        query ($page: Int) {
          Page (page: $page, perPage: 1) {
            media (type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
              id
            }
          }
        }`;
        
        try {
            const data = await this.query(gql, { page: randomPage }, { skipCache: true });
            return data.Page.media[0]?.id;
        } catch (e) {
            return 150672; // Fallback para Solo Leveling se falhar
        }
    },

    async browse(filters = {}) {
        const { page = 1, perPage = 24, genre, year, season, sort = 'TRENDING_DESC' } = filters;
        
        // Clean variables to avoid sending null/undefined which can break GQL
        const variables = { page, perPage };
        if (genre) variables.genre = genre;
        if (year) variables.year = year;
        if (season) variables.season = season;
        variables.sort = Array.isArray(sort) ? sort : [sort];

        const gql = `
        query ($page: Int, $perPage: Int, $genre: String, $year: Int, $season: MediaSeason, $sort: [MediaSort]) {
          Page (page: $page, perPage: $perPage) {
            pageInfo { total currentPage lastPage hasNextPage }
            media (type: ANIME, isAdult: false, genre: $genre, seasonYear: $year, season: $season, sort: $sort) {
              id title { romaji english } coverImage { extraLarge large } bannerImage
              description averageScore season seasonYear episodes status format genres
              startDate { year }
            }
          }
        }`;

        try {
            const data = await this.query(gql, variables);
            return {
                media: (data.Page.media || []).map(m => this.mapAniListToInternal(m)),
                pageInfo: data.Page.pageInfo
            };
        } catch (error) {
            console.error('BROWSE_ERROR:', error);
            throw error;
        }
    },

    async getGenres() {
        const gql = `query { GenreCollection }`;
        const data = await this.query(gql, {}, { ttl: 86400000 }); // Cache por 24h
        return data.GenreCollection || [];
    },

    async getRecent(page = 1, perPage = 20) {
        const gql = `
        query ($page: Int, $perPage: Int) {
          Page (page: $page, perPage: $perPage) {
            media (sort: TRENDING_DESC, type: ANIME, isAdult: false) {
              id title { romaji english } coverImage { extraLarge large } bannerImage
              description averageScore season seasonYear episodes status format genres
              startDate { year }
            }
          }
        }`;
        const data = await this.query(gql, { page, perPage });
        return (data.Page.media || []).map(m => this.mapAniListToInternal(m));
    },

    async search(query) {
        const gql = `
        query ($search: String) {
          Page (perPage: 20) {
            media (search: $search, type: ANIME, isAdult: false) {
              id title { romaji english } coverImage { extraLarge large } bannerImage
              description averageScore seasonYear episodes status format genres
            }
          }
        }`;
        const data = await this.query(gql, { search: query });
        return (data.Page.media || []).map(m => this.mapAniListToInternal(m));
    },

    async getDetails(id) {
        const gql = `
        query ($id: Int) {
          Media (id: $id) {
            id title { romaji english native }
            coverImage { extraLarge large }
            bannerImage
            description
            averageScore
            season
            seasonYear
            episodes
            status
            format
            genres
            studios(isMain: true) { nodes { name } }
            nextAiringEpisode { episode }
            trailer { id site }
            tags { name }
            characters(role: MAIN, perPage: 6) {
              nodes {
                name { full }
                image { large }
              }
            }
            recommendations(sort: RATING_DESC, perPage: 10) {
              nodes {
                mediaRecommendation {
                  id
                  title { romaji english }
                  coverImage { large }
                  averageScore
                  seasonYear
                }
              }
            }
            relations {
              edges {
                relationType
                node {
                  id
                  title { romaji english }
                  coverImage { large }
                  format
                  season
                  seasonYear
                }
              }
            }
          }
        }`;
        const data = await this.query(gql, { id: parseInt(id) });
        const anime = this.mapAniListToInternal(data.Media);
        if (anime && anime.description) {
            anime.description = await this.translateText(anime.description);
        }
        return anime;
    },

    async translateText(text) {
        try {
            const cleanText = text.replace(/<[^>]*>?/gm, '');
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q=${encodeURIComponent(cleanText)}`;
            const response = await fetch(url);
            const data = await response.json();
            return data[0].map(item => item[0]).join('');
        } catch (error) {
            return text;
        }
    }
};

// Export Globally
window.AnimeAPI = AnimeAPI;
window.AniListAPI = AniListAPI;
