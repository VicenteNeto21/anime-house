/**
 * ANIME_HOUSE // LIB_API v3.0 (Next.js/TypeScript)
 */

export interface Anime {
  id: string | number;
  malId?: number;
  title: string;
  titleEnglish?: string;
  titleRomaji?: string;
  titleNative?: string;
  poster: string;
  banner?: string;
  description?: string;
  synopsis?: string;
  rating: string;
  year: string | number;
  episodes: string | number;
  episodesReleased?: number;
  status: string;
  type?: string;
  format?: string;
  genres?: string[];
  season?: string;
  airingAt?: number;
  episode?: number;
  currentEpisode?: number;
  studios?: string[];
  recommendations?: Anime[];
  relations?: {
    relationType: string;
    id: number | string;
    title: string;
    poster: string;
    format: string;
    year: string | number;
    status: string;
  }[];
  trailer?: {
    id: string;
    site: string;
    thumbnail: string;
  };
  characters?: {
    role: string;
    name: string;
    image: string;
    voiceActor: {
      name: string;
      image: string;
    } | null;
  }[];
  streamingEpisodes?: {
    title: string;
    thumbnail: string;
    url: string;
  }[];
  tags?: string[];
  popularity?: number;
  favorites?: number;
  isFavourite?: boolean;
}



const KITSU_URL = process.env.NEXT_PUBLIC_KITSU_BASE_URL || 'https://kitsu.io/api/edge';
const ANILIST_URL = process.env.NEXT_PUBLIC_ANILIST_BASE_URL || 'https://graphql.anilist.co';

export const AnimeAPI = {
  async fetchKitsu(endpoint: string) {
    try {
      const response = await fetch(`${KITSU_URL}${endpoint}`, {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json'
        },
        next: { revalidate: 3600 } // Cache por 1 hora
      });

      if (!response.ok) throw new Error(`KITSU_FAILURE: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('KITSU_SYNC_ERROR:', error);
      return null;
    }
  },

  mapKitsuToInternal(item: any): Anime | null {
    if (!item) return null;
    const attr = item.attributes;
    return {
      id: item.id,
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
  }
};

export const AniListAPI = {
  cache: new Map<string, { data: any, timestamp: number }>(),
  CACHE_TTL: 1000 * 60 * 5, // 5 minutos — respeita rate limit do AniList (90 req/min)
  CACHE_TTL_MUTATION: 1000 * 10, // 10s para mutações (precisa refletir rápido)

  // Deduplicação de requisições em voo — evita chamadas duplicadas simultâneas
  _inflight: new Map<string, Promise<any>>(),

  // Fila de rate-limit — se receber 429, pausa e reenfileira
  _rateLimitUntil: 0,

  maps: {
    genres: {
      'Action': 'Ação', 'Adventure': 'Aventura', 'Comedy': 'Comédia', 'Drama': 'Drama',
      'Fantasy': 'Fantasia', 'Horror': 'Terror', 'Mahou Shoujo': 'Garotas Mágicas',
      'Mecha': 'Mecha', 'Music': 'Música', 'Mystery': 'Mistério', 'Psychological': 'Psicológico',
      'Romance': 'Romance', 'Sci-Fi': 'Ficção Científica', 'Slice of Life': 'Cotidiano',
      'Sports': 'Esportes', 'Supernatural': 'Sobrenatural', 'Thriller': 'Suspense',
      'Ecchi': 'Ecchi', 'Super Power': 'Super Poderes', 'Military': 'Militar', 'Space': 'Espaço',
      'Hentai': 'Hentai'
    } as Record<string, string>,
    seasons: {
      'WINTER': 'Inverno', 'SPRING': 'Primavera', 'SUMMER': 'Verão', 'FALL': 'Outono'
    } as Record<string, string>,
    formats: {
      'TV': 'Anime', 'TV_SHORT': 'Anime Curto', 'MOVIE': 'Filme', 'OVA': 'OVA', 'ONA': 'ONA', 'SPECIAL': 'Especial', 'MUSIC': 'Clipe'
    } as Record<string, string>
  },

  slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .normalize('NFD') // Remove acentos
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/[\s_-]+/g, '-') // Substitui espaços e underscores por hífens
      .replace(/^-+|-+$/g, ''); // Remove hífens no início e fim
  },

  getPreferredTitle(title?: { romaji?: string | null; english?: string | null; native?: string | null }) {
    if (!title) return 'Sem titulo';
    return title.romaji || title.english || title.native || 'Sem titulo';
  },

  async query(query: string, variables: any = {}, token?: string, forceRefresh = false) {
    const isMutation = query.trimStart().startsWith('mutation');
    const cacheKey = JSON.stringify({ query, variables, token: token ? 'auth' : 'public' });
    const cached = this.cache.get(cacheKey);
    const ttl = isMutation ? this.CACHE_TTL_MUTATION : this.CACHE_TTL;

    // Retorna cache válido (mutações sempre passam direto)
    if (!isMutation && !forceRefresh && cached && (Date.now() - cached.timestamp < ttl)) {
      return cached.data;
    }

    // Deduplicação: se já existe uma requisição idêntica em voo, espera por ela
    if (!isMutation && this._inflight.has(cacheKey)) {
      return this._inflight.get(cacheKey);
    }

    const execute = async (retryCount = 0): Promise<any> => {
      // Rate limit global: se fomos bloqueados recentemente, espera
      const waitTime = this._rateLimitUntil - Date.now();
      if (waitTime > 0) {
        await new Promise(r => setTimeout(r, waitTime));
      }

      try {
        const headers: any = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const fetchOptions: any = {
          method: 'POST',
          headers,
          body: JSON.stringify({ query, variables }),
          // No Next.js 15, 'force-cache' reduz muito os erros 429 no servidor
          cache: forceRefresh ? 'no-store' : 'force-cache',
        };

        // Só adiciona a propriedade 'next' se estiver no servidor (Next.js server-side)
        if (typeof window === 'undefined') {
          fetchOptions.next = forceRefresh ? undefined : { revalidate: 3600 };
        }

        if (!ANILIST_URL || typeof ANILIST_URL !== 'string') {
          console.error('ANILIST_URL_ERROR: URL da API não configurada corretamente.');
          return cached?.data || null;
        }

        const response = await fetch(ANILIST_URL, fetchOptions);

        // 429 — Rate Limited: backoff exponencial e retry
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '0') || 0;
          const backoff = Math.max(retryAfter * 1000, 1000 * Math.pow(2, retryCount));
          this._rateLimitUntil = Date.now() + backoff;
          console.warn(`ANILIST_RATE_LIMIT: Aguardando ${backoff}ms antes de retry (tentativa ${retryCount + 1}/3)`);

          if (retryCount < 2) {
            await new Promise(r => setTimeout(r, backoff));
            return execute(retryCount + 1);
          }
          // Após 3 tentativas, retorna cache expirado ou null
          console.warn('ANILIST_RATE_LIMIT: Esgotou retries, usando cache.');
          return cached?.data || null;
        }

        if (!response.ok) {
          // 404 é esperado para MediaList (anime não está na lista do usuário)
          if (response.status === 404) {
            return null;
          }
          // Não logar erros de rede transitórios para não poluir o console
          if (response.status >= 500) {
            return cached?.data || null;
          }
          return cached?.data || null;
        }

        const result = await response.json();
        if (result.errors) {
          if (result.errors[0].message.includes('Too Many Requests')) {
            this._rateLimitUntil = Date.now() + 2000;
            if (retryCount < 2) {
              await new Promise(r => setTimeout(r, 2000));
              return execute(retryCount + 1);
            }
            return cached?.data || null;
          }
          if (result.errors[0]?.message?.toLowerCase().includes('not found')) {
            return null;
          }
          console.error('ANILIST_QUERY_ERROR:', result.errors[0].message);
          throw new Error(result.errors[0].message);
        }

        this.cache.set(cacheKey, { data: result.data, timestamp: Date.now() });
        return result.data;
      } catch (error: any) {
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
          console.error('ANILIST_NETWORK_ERROR: A requisição foi bloqueada ou falhou.', ANILIST_URL);
        } else if (!error.message?.includes('not found')) {
          console.error('ANILIST_QUERY_EXCEPTION:', error);
        }
        return cached?.data || null;
      }
    };

    // Registra a promise de execução para deduplicação
    const promise = execute().finally(() => {
      this._inflight.delete(cacheKey);
    });

    if (!isMutation) {
      this._inflight.set(cacheKey, promise);
    }

    return promise;
  },

  async toggleFavourite(animeId: number, token: string) {
    const gql = `
      mutation ($id: Int) {
        ToggleFavourite (animeId: $id) {
          anime {
            nodes {
              id
            }
          }
        }
      }
    `;
    return this.query(gql, { id: animeId }, token);
  },

  mapAniListToInternal(media: any, currentEpisode?: number): Anime | null {
    if (!media) return null;

    const translatedGenres = (media.genres || []).map((g: string) => this.maps.genres[g] || g);
    const seasonDisplay = this.maps.seasons[media.season] || media.season || "N/A";

    const recommendations = (media.recommendations?.nodes || [])
      .map((node: any) => node.mediaRecommendation ? {
        id: node.mediaRecommendation.id,
        title: this.getPreferredTitle(node.mediaRecommendation.title),
        poster: node.mediaRecommendation.coverImage?.large,
        rating: node.mediaRecommendation.averageScore ? (node.mediaRecommendation.averageScore / 10).toFixed(1) : "N/A",
        year: node.mediaRecommendation.seasonYear || "N/A",
        status: node.mediaRecommendation.status === 'RELEASING' ? 'Lançando' : 'Finalizado',
        type: this.maps.formats[node.mediaRecommendation.format] || node.mediaRecommendation.format || "Anime",
        episodes: node.mediaRecommendation.episodes || "??"
      } : null)
      .filter(Boolean);

    const nextAiring = media.nextAiringEpisode;
    const episodesReleased = media.status === 'RELEASING'
      ? (nextAiring ? nextAiring.episode - 1 : media.episodes)
      : (media.episodes || 0);

    return {
      id: media.id,
      malId: media.idMal,
      title: this.getPreferredTitle(media.title),
      titleEnglish: media.title.english,
      titleRomaji: media.title.romaji,
      poster: media.coverImage.extraLarge || media.coverImage.large,
      banner: media.bannerImage,
      description: media.description,
      rating: media.averageScore ? (media.averageScore / 10).toFixed(1) : "N/A",
      year: media.seasonYear || media.startDate?.year || "N/A",
      season: seasonDisplay,
      format: this.maps.formats[media.format] || media.format || "Série",
      status: media.status === 'RELEASING' ? 'Em Lançamento' : 'Finalizado',
      episodes: media.episodes || '??',
      episodesReleased: episodesReleased || 0,
      genres: translatedGenres,
      currentEpisode: currentEpisode,
      studios: media.studios?.nodes?.map((s: any) => s.name),
      recommendations: recommendations,
      characters: (media.characters?.edges || []).map((edge: any) => ({
        role: edge.role,
        name: edge.node.name.full,
        image: edge.node.image.large,
        voiceActor: edge.voiceActors?.[0] ? {
          name: edge.voiceActors[0].name.full,
          image: edge.voiceActors[0].image.large
        } : null
      })),
      streamingEpisodes: media.streamingEpisodes?.map((ep: any) => {
        // Tenta limpar o título (remover 'Episode X - ')
        let cleanTitle = ep.title.replace(/^Episode \d+ - /i, '').replace(/^Ep \d+ - /i, '');
        return {
          title: cleanTitle,
          thumbnail: ep.thumbnail,
          url: ep.url
        };
      }),
      relations: (media.relations?.edges || [])
        .map((edge: any) => ({
          relationType: edge.relationType,
          id: edge.node.id,
          type: edge.node.type,
          title: this.getPreferredTitle(edge.node.title),
          poster: edge.node.coverImage?.large,
          format: this.maps.formats[edge.node.format] || edge.node.format,
          year: edge.node.seasonYear || '??',
          startDate: edge.node.startDate,
          status: edge.node.status === 'RELEASING' ? 'Lançando' : 'Finalizado'
        }))
        .filter((r: any) => r.relationType !== 'CHARACTER' && r.type === 'ANIME')
        .sort((a: any, b: any) => {
          const dateA = (a.startDate?.year || 0) * 10000 + (a.startDate?.month || 0) * 100 + (a.startDate?.day || 0);
          const dateB = (b.startDate?.year || 0) * 10000 + (b.startDate?.month || 0) * 100 + (b.startDate?.day || 0);
          return dateA - dateB;
        }),
      tags: media.tags?.map((t: any) => t.name).slice(0, 10),
      popularity: media.popularity,
      favorites: media.favourites,
      isFavourite: media.isFavourite,
      titleNative: media.title?.native
    };
  },



  async getTrending(limit = 6): Promise<Anime[]> {
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
    return (data?.Page?.media || []).map((m: any) => this.mapAniListToInternal(m)).filter(Boolean);
  },

  async getRecent(page = 1, perPage = 20): Promise<{ animes: Anime[], pageInfo: any }> {
    const gql = `
    query ($page: Int, $perPage: Int) {
      Page (page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
        }
        airingSchedules (notYetAired: false, sort: TIME_DESC) {
          episode
          airingAt
          media {
            id title { romaji english } coverImage { extraLarge large } bannerImage
            description averageScore season seasonYear episodes status format genres
            startDate { year }
          }
        }
      }
    }`;

    const data = await this.query(gql, { page, perPage });
    const animes = (data?.Page?.airingSchedules || []).map((item: any) => {
      const anime = this.mapAniListToInternal(item.media);
      if (anime) {
        anime.episode = item.episode;
        anime.airingAt = item.airingAt;
      }
      return anime;
    }).filter(Boolean);

    return {
      animes,
      pageInfo: data?.Page?.pageInfo
    };
  },

  async getDetails(id: string | number): Promise<Anime | null> {
        const idStr = String(id);
    const isIdNumeric = !isNaN(Number(idStr));
    const isCombinedId = /^\d+-/.test(idStr);

    const gql = `
    query ($id: Int, $search: String) {
      Media (id: $id, search: $search, type: ANIME) {
        id idMal title { romaji english native } isFavourite
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
        tags { name }
        popularity
        favourites
        studios(isMain: true) { nodes { name } }
        trailer { id site }
        nextAiringEpisode { episode }
        characters(sort: ROLE, perPage: 6) {
          edges {
            role
            node {
              name { full }
              image { large }
            }
            voiceActors(language: JAPANESE, sort: ROLE) {
              name { full }
              image { large }
            }
          }
        }
        recommendations(sort: RATING_DESC, perPage: 10) {
          nodes {
            mediaRecommendation {
              id title { romaji english } coverImage { large } averageScore seasonYear format status
            }
          }
        }
        streamingEpisodes {
          title
          thumbnail
          url
        }
        relations {
          edges {
            relationType
            node {
              id type title { romaji english } coverImage { large } format status seasonYear
              startDate { year month day }
            }
          }
        }
      }
    }`;
        let variables: any = {};
    if (isIdNumeric) {
      variables = { id: Number(idStr) };
    } else if (isCombinedId) {
      const numericPart = idStr.split('-')[0];
      variables = { id: Number(numericPart) };
    } else {
      variables = { search: idStr.replace(/-/g, ' ') };
    }

    const data = await this.query(gql, variables, undefined, true); // Force refresh para garantir novos campos (Seasons)
    const anime = this.mapAniListToInternal(data?.Media);

    if (anime && data?.Media) {
      if (anime.description) {
        anime.description = await this.translateText(anime.description);
      }
      // Adicionar trailer e elenco ao objeto
      anime.trailer = data.Media.trailer;
      anime.characters = data.Media.characters?.edges?.map((edge: any) => ({
        role: edge.role,
        name: edge.node.name.full,
        image: edge.node.image.large,
        voiceActor: edge.voiceActors?.[0] ? {
          name: edge.voiceActors[0].name.full,
          image: edge.voiceActors[0].image.large
        } : null
      }));
    }
    return anime;
  },


  async search(query: string): Promise<Anime[]> {
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
    return (data?.Page?.media || []).map((m: any) => this.mapAniListToInternal(m)).filter(Boolean);
  },

  async translateText(text: string): Promise<string> {
    if (!text) return "";
    try {
      // Limpar HTML básico antes de traduzir
      const cleanText = text.replace(/<[^>]*>?/gm, '');
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q=${encodeURIComponent(cleanText)}`;
      
      const response = await fetch(url);
      if (!response.ok) return text;
      
      const data = await response.json();
      if (!data || !data[0]) return text;
      
      const translated = data[0].map((item: any) => item[0]).join('');
      return translated || text;
    } catch (error) {
      console.error('TRANSLATION_ERROR:', error);
      return text;
    }
  },

  async browse(filters: any = {}): Promise<{ media: Anime[], pageInfo: any }> {
    const { page = 1, perPage = 24, genre, year, season, sort = 'TRENDING_DESC', search, status } = filters;

    const variables: any = { page, perPage };
    if (genre) variables.genre = genre;
    if (year) variables.year = year;

    // Validar se o season é um MediaSeason válido para evitar erros de query
    const validSeasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
    if (season && validSeasons.includes(season.toUpperCase())) {
      variables.season = season.toUpperCase();
    }
    if (search) variables.search = search;
    if (status) variables.status = status;
    variables.sort = Array.isArray(sort) ? sort : [sort];

    const gql = `
    query ($page: Int, $perPage: Int, $genre: String, $year: Int, $season: MediaSeason, $sort: [MediaSort], $search: String, $status: MediaStatus) {
      Page (page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media (type: ANIME, isAdult: false, genre: $genre, seasonYear: $year, season: $season, sort: $sort, search: $search, status: $status) {
          id title { romaji english } coverImage { extraLarge large } bannerImage
          description averageScore season seasonYear episodes status format genres
          startDate { year }
        }
      }
    }`;

    const data = await this.query(gql, variables);
    return {
      media: (data?.Page?.media || []).map((m: any) => this.mapAniListToInternal(m)).filter(Boolean),
      pageInfo: data?.Page?.pageInfo
    };
  },


  async getGenres(): Promise<string[]> {
    const gql = `query { GenreCollection }`;
    const data = await this.query(gql, {});
    return data?.GenreCollection || [];
  },

  async getGenreStats(genre: string): Promise<{ total: number, topMedia: Anime | null }> {

    const gql = `
    query ($genre: String) {
      Page (perPage: 1) {
        pageInfo { total }
        media (genre: $genre, sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
          id title { romaji english } coverImage { extraLarge large } bannerImage
          description averageScore season seasonYear episodes status format genres
          startDate { year }
        }
      }
    }`;
    const data = await this.query(gql, { genre });
    return {
      total: data?.Page?.pageInfo?.total || 0,
      topMedia: data?.Page?.media?.[0] ? this.mapAniListToInternal(data.Page.media[0]) : null
    };
  },


  async getAiringSchedule(): Promise<any[]> {
    const start = Math.floor(Date.now() / 1000) - (3600 * 24 * 3.5); // 3.5 dias atrás
    const end = Math.floor(Date.now() / 1000) + (3600 * 24 * 3.5); // 3.5 dias à frente

    const gql = `
    query ($start: Int, $end: Int, $page: Int) {
      Page (page: $page, perPage: 50) {
        airingSchedules (airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
          id episode airingAt
          media {
            id title { romaji english } coverImage { large } format status episodes
          }
        }
      }
    }`;

    let allSchedules: any[] = [];

    // Buscar 3 páginas para cobrir a semana toda (~150 animes)
    for (let p = 1; p <= 3; p++) {
      const data = await this.query(gql, { start, end, page: p });
      const pageSchedules = data?.Page?.airingSchedules || [];
      allSchedules = [...allSchedules, ...pageSchedules];
      if (pageSchedules.length < 50) break;
    }

    return allSchedules
      .filter((item: any) => item.media)
      .map((item: any) => ({
        id: item.id,
        airingAt: item.airingAt,
        episode: item.episode,
        media: {
          id: item.media.id,
          title: this.getPreferredTitle(item.media.title),
          poster: item.media.coverImage.large,
          format: this.maps.formats[item.media.format] || item.media.format,
          status: item.media.status === 'RELEASING' ? 'Em Lançamento' : 'Finalizado',
          episodes: item.media.episodes || '??'
        }
      }));
  },

  userIdCache: new Map<string, any>(),

  async getCurrentUser(token: string) {
    if (this.userIdCache.has(token)) {
      return { Viewer: this.userIdCache.get(token) };
    }

    const gql = `
      query {
        Viewer {
          id
          name
          avatar {
            large
          }
          bannerImage
        }
      }
    `;
    const res = await this.query(gql, {}, token);
    if (res?.Viewer?.id) {
      this.userIdCache.set(token, res.Viewer);
    }
    return res;
  },

  async getMediaListStatus(mediaId: number, token: string, forceRefresh = false) {
    try {
      const userRes = await this.getCurrentUser(token);
      const userId = userRes?.Viewer?.id;

      if (!userId) return null;

      const gql = `
        query ($mediaId: Int, $userId: Int) {
          MediaList(mediaId: $mediaId, userId: $userId) {
            id
            status
            progress
            score
          }
        }
      `;
      return await this.query(gql, { mediaId, userId }, token, forceRefresh);
    } catch (error: any) {
      // Se não encontrou (Not Found), apenas retorna null - é o comportamento esperado para animes novos
      if (error.message?.toLowerCase().includes('not found')) {
        return null;
      }
      // Outros erros (como token expirado) também não devem quebrar o player
      console.warn('GET_MEDIA_STATUS_SILENT_FAIL:', error.message);
      return null;
    }
  },

  async saveMediaListEntry(mediaId: number, status: string, progress: number, token: string, score?: number, entryId?: number) {
    if (!mediaId && !entryId) {
      console.error('SAVE_MEDIA_LIST_ENTRY_ERROR: mediaId or entryId is required');
      return null;
    }

    const gql = `
      mutation ($id: Int, $mediaId: Int, $status: MediaListStatus, $progress: Int, $score: Float) {
        SaveMediaListEntry(id: $id, mediaId: $mediaId, status: $status, progress: $progress, score: $score) {
          id
          status
          progress
          score
        }
      }
    `;

    // Garantir que os tipos estão corretos e remover nulos/NaN
    const variables: any = {
      status: status,
      progress: Math.floor(progress || 0),
    };

    if (entryId) variables.id = Number(entryId);
    if (mediaId && !isNaN(Number(mediaId))) variables.mediaId = Number(mediaId);
    if (score !== undefined && !isNaN(Number(score))) variables.score = Number(score);

    return await this.query(gql, variables, token, true);
  },

  async deleteMediaListEntry(id: number, token: string) {
    const gql = `
      mutation ($id: Int) {
        DeleteMediaListEntry (id: $id) {
          deleted
        }
      }
    `;
    return await this.query(gql, { id }, token, true);
  },

  async getUserWatchingList(token: string, page = 1, perPage = 12) {
    // Primeiro pegamos o ID do usuário
    const userRes = await this.getCurrentUser(token);
    const userId = userRes?.Viewer?.id;

    if (!userId) return [];

    const gql = `
      query ($userId: Int, $page: Int, $perPage: Int) {
        MediaListCollection(userId: $userId, type: ANIME, status_in: [CURRENT, REPEATING], sort: UPDATED_TIME_DESC, chunk: $page, perChunk: $perPage) {
          lists {
            entries {
              media {
                id
                title {
                  romaji
                  english
                  native
                }
                coverImage {
                  large
                }
                format
                episodes
              }
              progress
              updatedAt
            }
          }
        }
      }
    `;
    const data = await this.query(gql, { userId, page, perPage }, token);

    // Flatten all entries from all lists (AniList returns one list per status)
    const allEntries = data?.MediaListCollection?.lists?.flatMap((list: any) => list.entries) || [];

    return allEntries.map((entry: any) => ({
      id: entry.media.id,
      title: this.getPreferredTitle(entry.media.title),
      cover: entry.media.coverImage.large,
      format: entry.media.format,
      progress: entry.progress,
      totalEpisodes: entry.media.episodes,
      updatedAt: entry.updatedAt
    }));
  },
};



export const TMDBAPI = {
  async findIdByTitle(title: string) {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const cleanTitle = title.replace(/\(\d{4}\)/g, '').trim();
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(cleanTitle)}&language=pt-BR`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const result = data.results?.find((r: any) => r.media_type === 'tv' || r.media_type === 'movie');
      return result ? result.id : null;
    } catch (e) {
      console.error('TMDB_SEARCH_ERROR:', e);
      return null;
    }
  }
};

export const MeusAnimesAPI = {
  baseUrl: 'https://meusanimes.blog',

  async search(query: string) {
    const url = `${this.baseUrl}/?s=${encodeURIComponent(query)}`;
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;

    try {
      const response = await fetch(proxyUrl);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const items = doc.querySelectorAll('div.result-item');
      return Array.from(items).map(item => {
        const link = item.querySelector('.details .title a') as HTMLAnchorElement;
        return {
          title: link?.textContent?.trim(),
          url: link?.href,
          poster: item.querySelector('.image img')?.getAttribute('src')
        };
      });
    } catch (e) {
      console.error('MEUSANIMES_SEARCH_ERROR:', e);
      return [];
    }
  },

  async getEpisodeIframe(animeUrl: string, episode: number, isDubbed: boolean) {
    let slug = animeUrl.split('/').filter(Boolean).pop() || '';
    slug = slug.replace(/^anime-/, '');

    const season = 1;
    const versionSuffix = isDubbed ? '-dublado' : '';
    const epUrl = `${this.baseUrl}/e/${slug}${versionSuffix}-${season}-episodio-${episode}/`;

    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(epUrl)}`;

    try {
      const response = await fetch(proxyUrl);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const iframe = doc.querySelector('iframe[src*="meusdoramas"]') as HTMLIFrameElement;
      return iframe ? iframe.src : null;
    } catch (e) {
      console.error('MEUSANIMES_IFRAME_ERROR:', e);
      return null;
    }
  }
};

export const BetterFlixAPI = {
  baseUrl: 'https://betterflix.click/api/player',

  generateUrl(id: string | number, type: 'movie' | 'tv' = 'tv', season = 1, episode = 1) {
    if (type === 'movie') {
      return `${this.baseUrl}?id=${id}&type=movie`;
    }
    return `${this.baseUrl}?id=${id}&type=tv&season=${season}&episode=${episode}`;
  }
};
