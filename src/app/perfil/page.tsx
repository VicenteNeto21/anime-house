'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AniListAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const GENRE_MAP: { [key: string]: { label: string, color: string } } = {
  'Action': { label: 'Ação', color: 'bg-rose-500' },
  'Adventure': { label: 'Aventura', color: 'bg-amber-500' },
  'Comedy': { label: 'Comédia', color: 'bg-yellow-400' },
  'Drama': { label: 'Drama', color: 'bg-purple-500' },
  'Ecchi': { label: 'Ecchi', color: 'bg-pink-400' },
  'Fantasy': { label: 'Fantasia', color: 'bg-indigo-500' },
  'Horror': { label: 'Terror', color: 'bg-slate-800' },
  'Mahou Shoujo': { label: 'Garota Mágica', color: 'bg-pink-300' },
  'Mecha': { label: 'Mecha', color: 'bg-cyan-600' },
  'Music': { label: 'Música', color: 'bg-emerald-400' },
  'Mystery': { label: 'Mistério', color: 'bg-violet-600' },
  'Psychological': { label: 'Psicológico', color: 'bg-zinc-600' },
  'Romance': { label: 'Romance', color: 'bg-rose-400' },
  'Sci-Fi': { label: 'Ficção Científica', color: 'bg-blue-400' },
  'Slice of Life': { label: 'Cotidiano', color: 'bg-teal-400' },
  'Sports': { label: 'Esportes', color: 'bg-orange-500' },
  'Supernatural': { label: 'Sobrenatural', color: 'bg-indigo-400' },
  'Thriller': { label: 'Suspense', color: 'bg-red-600' },
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('CURRENT');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const fetchProfileData = async () => {
    const token = localStorage.getItem('anilist_token');
    
    // Se não houver token do AniList E não houver sessão do Google ativa (e não estiver carregando)
    if (!token && status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (!token && session?.user) {
      // É um usuário Google sem AniList vinculado
      setUser({
        name: session.user.name,
        avatar: { large: session.user.image || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' },
        bannerImage: null,
        statistics: { anime: { count: 0, episodesWatched: 0, meanScore: 0, minutesWatched: 0 } }
      });
      setLoading(false);
      return;
    }

    if (!token) return;

    setLoading(true);

    const userGql = `
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
              episodesWatched
              meanScore
              genres(sort: COUNT_DESC, limit: 10) {
                genre
                count
              }
            }
          }
          favourites {
            characters {
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

    try {
      const userData = await AniListAPI.query(userGql, {}, token);
      
      if (userData?.Viewer) {
        setUser(userData.Viewer);
        
        const listGql = `
          query ($userId: Int) {
            MediaListCollection(userId: $userId, type: ANIME, sort: UPDATED_TIME_DESC) {
              lists {
                name
                status
                entries {
                  id
                  progress
                  media {
                    id
                    title { romaji english }
                    coverImage { large }
                    episodes
                    format
                    averageScore
                    status
                  }
                }
              }
            }
          }
        `;

        const listData = await AniListAPI.query(listGql, { userId: userData.Viewer.id }, token, true);
        if (listData?.MediaListCollection?.lists) {
          setAnimeList(listData.MediaListCollection.lists);
        }
      } else {
        // Se o Viewer for null mas o token existe, o token pode estar expirado
        localStorage.removeItem('anilist_token');
        localStorage.removeItem('anilist_user');
        router.push('/login');
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== 'loading') {
      fetchProfileData();
    }
  }, [status, session]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handleUpdateProgress = async (mediaId: number, currentProgress: number, delta: number, entryId?: number) => {
    const token = localStorage.getItem('anilist_token');
    const newProgress = currentProgress + delta;
    if (!token || updatingId || newProgress < 0) return;

    setUpdatingId(mediaId);

    try {
      await AniListAPI.saveMediaListEntry(mediaId, activeTab, newProgress, token, undefined, entryId);
      fetchProfileData();
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveEntry = async (entryId: number) => {
    if (!confirm('Tem certeza que deseja remover este anime da sua lista?')) return;
    
    const token = localStorage.getItem('anilist_token');
    if (!token) return;

    try {
      await AniListAPI.deleteMediaListEntry(entryId, token);
      fetchProfileData();
    } catch (error) {
      console.error('Erro ao remover anime:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('anilist_token');
    localStorage.removeItem('anilist_user');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fa-solid fa-user text-blue-500 animate-pulse text-xs"></i>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] p-4">
        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-white/5">
          <i className="fa-solid fa-user-slash text-3xl text-slate-700"></i>
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Sessão Expirada</h2>
        <p className="text-slate-500 text-sm mb-8 text-center max-w-xs">Não conseguimos recuperar suas informações. Por favor, faça login novamente.</p>
        <Link href="/login" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs rounded-2xl transition-all shadow-lg shadow-blue-600/20">
          Fazer Login
        </Link>
      </div>
    );
  }

  const fullList = animeList.find(l => l.status === activeTab)?.entries || [];
  const totalPages = Math.ceil(fullList.length / itemsPerPage);
  const currentList = fullList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const topGenres = user.statistics?.anime?.genres?.slice(0, 3)?.map((g: any) => g.genre) || [];
  
  const allPossibleAchievements = [
    { id: 'romance', label: 'Eterno Romântico', hint: 'Tenha Romance no seu Top 3', icon: 'fa-heart', color: 'from-rose-400 to-pink-500', unlocked: topGenres.includes('Romance') },
    { id: 'action', label: 'Guerreiro Shounen', hint: 'Tenha Ação no seu Top 3', icon: 'fa-fire', color: 'from-orange-500 to-red-600', unlocked: topGenres.includes('Action') },
    { id: 'fantasy', label: 'Mestre da Magia', hint: 'Tenha Fantasia no seu Top 3', icon: 'fa-wand-magic-sparkles', color: 'from-indigo-500 to-purple-600', unlocked: topGenres.includes('Fantasy') },
    { id: 'adventure', label: 'Explorador', hint: 'Tenha Aventura no seu Top 3', icon: 'fa-map-location-dot', color: 'from-amber-500 to-orange-600', unlocked: topGenres.includes('Adventure') },
    { id: 'drama', label: 'Colecionador de Emoções', hint: 'Tenha Drama no seu Top 3', icon: 'fa-masks-theater', color: 'from-purple-500 to-indigo-700', unlocked: topGenres.includes('Drama') },
    { id: 'brain', label: 'Cérebro de Platina', hint: 'Tenha Mistério no seu Top 3', icon: 'fa-brain', color: 'from-zinc-500 to-slate-700', unlocked: topGenres.includes('Mystery') || topGenres.includes('Psychological') },
    { id: 'comedy', label: 'Rei da Comédia', hint: 'Tenha Comédia no seu Top 3', icon: 'fa-face-laugh-squint', color: 'from-yellow-400 to-orange-500', unlocked: topGenres.includes('Comedy') },
    { id: 'critic', label: 'Crítico de Elite', hint: 'Nota Média acima de 85%', icon: 'fa-star-half-stroke', color: 'from-amber-400 to-yellow-600', unlocked: (user.statistics?.anime?.meanScore || 0) >= 85 },
    { id: 'marathon', label: 'Maratonista Real', hint: 'Assista +1000 episódios', icon: 'fa-bolt', color: 'from-yellow-400 to-amber-600', unlocked: (user.statistics?.anime?.episodesWatched || 0) > 1000 },
    { id: 'legend', label: 'Lenda das Temporadas', hint: 'Tenha +200 animes na lista', icon: 'fa-crown', color: 'from-blue-500 to-indigo-700', unlocked: (user.statistics?.anime?.count || 0) > 200 },
  ];

  const unlockedAchievements = allPossibleAchievements.filter(a => a.unlocked);
  const lockedAchievements = allPossibleAchievements.filter(a => !a.unlocked);

  const tabs = [
    { id: 'CURRENT', label: 'Assistindo', icon: 'fa-play' },
    { id: 'REPEATING', label: 'Reassistindo', icon: 'fa-rotate-right' },
    { id: 'PLANNING', label: 'Planejando', icon: 'fa-clock' },
    { id: 'COMPLETED', label: 'Completos', icon: 'fa-check-double' },
    { id: 'PAUSED', label: 'Pausados', icon: 'fa-pause' },
    { id: 'DROPPED', label: 'Desistidos', icon: 'fa-trash' },
  ];

  return (
    <main className="min-h-screen bg-[#050505] pb-20">
      {/* Banner */}
      <div className="relative h-72 md:h-96 w-full overflow-hidden">
        {user.bannerImage ? (
          <img src={user.bannerImage} alt="Banner" className="w-full h-full object-cover opacity-30 brightness-50" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900/30 via-slate-900 to-indigo-900/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
      </div>

      <div className="container mx-auto px-4 lg:px-12 -mt-32 relative z-10">
        <div className="grid lg:grid-cols-4 gap-10">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            {/* User Card */}
            <div className="bg-slate-900/40 border border-white/5 rounded-[24px] md:rounded-[32px] p-6 md:p-8 text-center backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-colors"></div>
              
              <div className="relative w-32 h-32 mx-auto rounded-2xl overflow-hidden border-2 border-white/5 mb-6 group-hover:scale-105 transition-transform duration-500">
                <img src={user.avatar.large} alt={user.name} className="w-full h-full object-cover" />
              </div>
              
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 leading-none">{user.name}</h1>
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                   Usuário Elite
                </span>
              </div>
              
              <button 
                onClick={handleLogout}
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-[10px] font-black text-rose-500 uppercase tracking-widest transition-all group"
              >
                <i className="fa-solid fa-power-off mr-2 opacity-70 group-hover:opacity-100"></i> 
                Sair da Conta
              </button>
            </div>

            {/* Achievements Section */}
            <div className="bg-slate-900/20 border border-white/5 rounded-[20px] md:rounded-[24px] p-4 md:p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                  <i className="fa-solid fa-trophy text-amber-500"></i>
                  Conquistas
                </h3>
                <span className="text-[8px] font-black text-slate-500 bg-white/5 px-2 py-1 rounded-lg">
                  {unlockedAchievements.length}/{allPossibleAchievements.length}
                </span>
              </div>
              
              <div className="space-y-6">
                {/* Desbloqueadas */}
                {unlockedAchievements.length > 0 && (
                  <div className="grid grid-cols-5 sm:grid-cols-5 gap-2 md:gap-3">
                    {unlockedAchievements.map((ach) => (
                      <div 
                        key={ach.id} 
                        title={ach.label}
                        className={`aspect-square rounded-2xl bg-gradient-to-br ${ach.color} flex items-center justify-center hover:scale-110 transition-transform cursor-help`}
                      >
                        <i className={`fa-solid ${ach.icon} text-white text-sm`}></i>
                      </div>
                    ))}
                    {Array.from({ length: Math.max(0, 5 - unlockedAchievements.length) }).map((_, i) => (
                      <div key={i} className="aspect-square rounded-xl md:rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center opacity-30">
                        <i className="fa-solid fa-lock text-[10px] text-slate-600"></i>
                      </div>
                    ))}
                  </div>
                )}

                {/* Próximo Objetivo */}
                {lockedAchievements.length > 0 && (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3">Próximo Objetivo</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-white/5">
                        <i className={`fa-solid ${lockedAchievements[0].icon} text-slate-600`}></i>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{lockedAchievements[0].label}</h4>
                        <p className="text-[8px] font-bold text-blue-500/70 uppercase tracking-widest mt-0.5">{lockedAchievements[0].hint}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* DNA de Anime */}
            <div className="bg-slate-900/20 border border-white/5 rounded-[20px] md:rounded-[24px] p-4 md:p-6 backdrop-blur-sm">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-4 md:mb-6 flex items-center gap-3">
                <i className="fa-solid fa-dna text-blue-500"></i>
                DNA de Anime
              </h3>
              <div className="space-y-5">
                {user.statistics?.anime?.genres?.slice(0, 6).map((stat: any, i: number) => {
                  const genreInfo = GENRE_MAP[stat.genre] || { label: stat.genre, color: 'bg-slate-600' };
                  return (
                    <div key={i} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{genreInfo.label}</span>
                        <span className="text-[9px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-lg">{stat.count}</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${genreInfo.color} rounded-full transition-all duration-1000 ease-out`} 
                          style={{ width: `${(stat.count / user.statistics.anime.genres[0].count) * 100}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="lg:col-span-3 space-y-6 md:space-y-10">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {[
                { label: 'Animes Assistidos', value: user.statistics?.anime?.count || 0, icon: 'fa-tv', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'Total de Episódios', value: user.statistics?.anime?.episodesWatched || 0, icon: 'fa-film', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { label: 'Nota Média', value: `${user.statistics?.anime?.meanScore || 0}%`, icon: 'fa-star', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { label: 'Tempo Assistido', value: `${Math.floor((user.statistics?.anime?.minutesWatched || 0) / 1440)}d`, icon: 'fa-clock', color: 'text-rose-500', bg: 'bg-rose-500/10' },
              ].map((stat, i) => (
                <div key={i} className="p-4 md:p-6 bg-slate-900/30 border border-white/5 rounded-[20px] md:rounded-[24px] backdrop-blur-md hover:bg-slate-900/50 transition-all border-b-2 hover:border-b-blue-500/30">
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl ${stat.bg} flex items-center justify-center mb-2 md:mb-3 border border-white/5`}>
                      <i className={`fa-solid ${stat.icon} ${stat.color} text-sm`}></i>
                    </div>
                    <h3 className="text-xl font-black text-white leading-none tracking-tighter mb-1">{stat.value}</h3>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Favorite Characters */}
            {user.favourites?.characters?.nodes?.length > 0 && (
              <section className="bg-slate-900/20 border border-white/5 rounded-[24px] md:rounded-[32px] p-4 md:p-6 backdrop-blur-sm overflow-hidden">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-4 md:mb-6 flex items-center gap-3">
                   <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
                   Squad Favorito
                </h3>
                <div className="flex flex-wrap gap-4">
                  {user.favourites.characters.nodes.map((char: any) => (
                    <div key={char.id} className="w-20 md:w-24 flex-shrink-0 group">
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-slate-950 mb-2">
                        <img src={char.image.large} alt={char.name.full} className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-700 brightness-90 group-hover:brightness-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                      </div>
                      <h4 className="text-[8px] font-black text-center text-slate-500 uppercase truncate px-1 group-hover:text-blue-400 transition-colors">{char.name.full}</h4>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Tabs & List */}
            <div className="space-y-8">
              <div className="flex items-center gap-2 p-1.5 bg-slate-900/40 border border-white/5 rounded-[24px] backdrop-blur-md overflow-x-auto hide-scrollbar">
                {tabs.map((tab) => (
                  <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id)} 
                    className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-[18px] text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                  >
                    <i className={`fa-solid ${tab.icon} text-[10px]`}></i>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className={`text-[8px] ${activeTab === tab.id ? 'text-blue-200' : 'text-slate-600'}`}>
                      ({animeList.find(l => l.status === tab.id)?.entries?.length || 0})
                    </span>
                  </button>
                ))}
              </div>

              {/* Anime List */}
              <div className="flex flex-col gap-2">
                {currentList.length > 0 ? (
                  currentList.map((entry: any) => (
                    <div key={entry.id} className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-slate-900/30 hover:bg-slate-800/50 border border-white/5 hover:border-blue-500/20 rounded-2xl p-2.5 sm:p-3 transition-all duration-300">
                      
                      {/* Top part on mobile: Thumbnail + Info */}
                      <div className="flex items-center gap-3 sm:gap-4 flex-grow min-w-0">
                        {/* Thumbnail */}
                        <Link href={`/anime/${entry.media.id}`} className="relative w-12 h-16 sm:w-14 sm:h-20 flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden bg-slate-800">
                          <img src={entry.media.coverImage.large} alt={entry.media.title.romaji} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </Link>

                        {/* Info */}
                        <div className="flex-grow min-w-0">
                          <Link href={`/anime/${entry.media.id}`} className="block">
                            <h3 className="text-[11px] sm:text-[12px] font-black text-white uppercase tracking-tight truncate group-hover:text-blue-400 transition-colors leading-tight">
                              {entry.media.title.romaji}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[7px] sm:text-[8px] font-black text-slate-600 uppercase tracking-widest">{entry.media.format}</span>
                              {entry.media.averageScore && (
                                <span className="text-[7px] sm:text-[8px] font-black text-amber-500/70">★ {entry.media.averageScore}%</span>
                              )}
                            </div>
                          </Link>
                          {/* Progress Bar */}
                          <div className="flex items-center gap-3 mt-1.5 sm:mt-2">
                            <div className="flex-grow h-1.5 bg-slate-950 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                                style={{ width: `${(entry.progress / (entry.media.episodes || Math.max(entry.progress, 1))) * 100}%` }} 
                              />
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 whitespace-nowrap tabular-nums">
                              {entry.progress}<span className="text-slate-700">/{entry.media.episodes || '??'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 sm:gap-1 flex-shrink-0 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity justify-end ml-[60px] sm:ml-0 mt-1 sm:mt-0">
                        <button 
                          onClick={() => handleUpdateProgress(entry.media.id, entry.progress, 1, entry.id)}
                          disabled={updatingId === entry.media.id}
                          className="w-full sm:w-8 h-7 sm:h-8 flex-1 sm:flex-none flex items-center justify-center bg-blue-600/20 sm:bg-slate-950 hover:bg-blue-600 border border-blue-500/20 sm:border-white/5 text-blue-400 sm:text-slate-400 hover:text-white rounded-lg text-[10px] transition-all cursor-pointer active:scale-90"
                        >
                          <i className="fa-solid fa-plus"></i>
                        </button>
                        <button 
                          onClick={() => handleUpdateProgress(entry.media.id, entry.progress, -1, entry.id)}
                          disabled={updatingId === entry.media.id}
                          className="w-full sm:w-8 h-7 sm:h-8 flex-1 sm:flex-none flex items-center justify-center bg-slate-800 sm:bg-slate-950 hover:bg-slate-700 border border-white/5 text-slate-300 sm:text-slate-600 hover:text-white rounded-lg text-[10px] transition-all cursor-pointer active:scale-90"
                        >
                          <i className="fa-solid fa-minus"></i>
                        </button>
                        <button 
                          onClick={() => handleRemoveEntry(entry.id)}
                          className="w-full sm:w-8 h-7 sm:h-8 flex-1 sm:flex-none flex items-center justify-center bg-rose-500/10 sm:bg-slate-950 hover:bg-rose-600/20 border border-rose-500/20 sm:border-white/5 text-rose-500 sm:text-slate-700 hover:text-rose-400 rounded-lg text-[10px] transition-all cursor-pointer active:scale-90"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-white/5 opacity-50">
                      <i className="fa-solid fa-ghost text-2xl text-slate-700"></i>
                    </div>
                    <h3 className="text-lg font-black text-slate-600 uppercase tracking-tighter mb-1">Lista Vazia</h3>
                    <p className="text-slate-700 text-[10px] uppercase tracking-widest">Nenhum anime encontrado nesta categoria.</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pt-8 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    {currentPage > 1 && (
                      <button 
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="w-10 h-10 flex items-center justify-center bg-slate-900 border border-white/5 text-white/50 hover:text-white hover:border-blue-500/50 hover:scale-110 rounded-full transition-all duration-300 cursor-pointer"
                      >
                        <i className="fa-solid fa-chevron-left text-xs"></i>
                      </button>
                    )}

                    {(() => {
                      const pages = [];
                      const start = Math.max(1, currentPage - 2);
                      const end = Math.min(totalPages, start + 4);
                      for (let i = start; i <= end; i++) pages.push(i);
                      return pages;
                    })().map(p => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-10 h-10 flex items-center justify-center rounded-full text-[12px] font-black transition-all duration-300 border cursor-pointer ${
                          p === currentPage 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30 scale-110 z-10' 
                            : 'bg-slate-900 border-white/5 text-white/50 hover:bg-slate-800 hover:text-white hover:scale-105'
                        }`}
                      >
                        {p}
                      </button>
                    ))}

                    {currentPage < totalPages && (
                      <button 
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="w-10 h-10 flex items-center justify-center bg-slate-900 border border-white/5 text-white/50 hover:text-white hover:border-blue-500/50 hover:scale-110 rounded-full transition-all duration-300 cursor-pointer"
                      >
                        <i className="fa-solid fa-chevron-right text-xs"></i>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
