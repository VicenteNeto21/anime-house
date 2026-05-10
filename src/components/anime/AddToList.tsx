'use client';

import { useState, useEffect } from 'react';
import { AniListAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AddToListProps {
  animeId: number;
  totalEpisodes?: number;
}

const STATUS_MAP = [
  { id: 'CURRENT', label: 'Assistindo', icon: 'fa-play', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'PLANNING', label: 'Lista de Desejos', icon: 'fa-bookmark', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'COMPLETED', label: 'Concluído', icon: 'fa-check-double', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'REPEATING', label: 'Reassistindo', icon: 'fa-rotate-right', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'PAUSED', label: 'Em Pausa', icon: 'fa-pause', color: 'text-slate-400', bg: 'bg-slate-500/10' },
  { id: 'DROPPED', label: 'Desistido', icon: 'fa-xmark', color: 'text-red-500', bg: 'bg-red-500/10' },
];

export default function AddToList({ animeId, totalEpisodes }: AddToListProps) {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userList, setUserList] = useState<any>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('anilist_token');
    if (token) {
      setIsLogged(true);
      fetchStatus(token, false);
    } else {
      setLoading(false);
    }

    // Escuta o evento de sync para atualizar quando o usuário muda algo
    const handleSync = () => {
      const t = localStorage.getItem('anilist_token');
      if (t) fetchStatus(t, true);
    };
    window.addEventListener('anilist-sync', handleSync);
    return () => window.removeEventListener('anilist-sync', handleSync);
  }, [animeId]);

  async function fetchStatus(token: string, force = false) {
    try {
      const data = await AniListAPI.getMediaListStatus(animeId, token, force);
      if (data?.MediaList) {
        setUserList(data.MediaList);
      }
    } catch {
      // AniList indisponível — não é crítico, o botão funciona sem sync
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(status: string, progress?: number, score?: number) {
    const token = localStorage.getItem('anilist_token');
    if (!token) {
      router.push('/login');
      return;
    }

    setUpdating(true);
    try {
      let currentProgress = progress !== undefined ? progress : (userList?.progress || 0);
      let targetStatus = status;
      let currentScore = score !== undefined ? score : (userList?.score || 0);

      // Regras de negócio automáticas
      if (totalEpisodes && currentProgress >= totalEpisodes && targetStatus !== 'COMPLETED') {
        targetStatus = 'COMPLETED';
      }

      const data = await AniListAPI.saveMediaListEntry(animeId, targetStatus, currentProgress, token, currentScore, userList?.id);
      if (data?.SaveMediaListEntry) {
        setUserList(data.SaveMediaListEntry);
        setShowDropdown(false);
        setShowScoreModal(false);
        window.dispatchEvent(new CustomEvent('anilist-sync'));
      }
    } catch (error) {
      console.error('UPDATE_STATUS_ERROR:', error);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return <div className="w-full h-14 bg-slate-900/50 rounded-2xl animate-pulse border border-white/5"></div>;
  }

  if (!isLogged) {
    return (
      <button 
        onClick={() => router.push('/login')}
        className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-600/20 group"
      >
        <i className="fa-solid fa-sync group-hover:rotate-180 transition-transform duration-700"></i>
        Conectar AniList
      </button>
    );
  }

  const currentStatus = STATUS_MAP.find(s => s.id === userList?.status);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sincronização</span>
        <div className="flex items-center gap-1.5 opacity-40 grayscale hover:grayscale-0 transition-all cursor-default">
          <img src="https://anilist.co/img/icons/icon.svg" className="w-3 h-3" alt="AniList" />
          <span className="text-[8px] font-black text-[#3DB4F2]">AniList</span>
        </div>
      </div>
      
      <div className="relative">
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={updating}
          className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border group/btn ${
            userList 
              ? `${currentStatus?.bg} ${currentStatus?.color} border-white/10 hover:border-white/20 hover:brightness-110 shadow-lg shadow-black/20` 
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-5 h-5">
              <i className={`fa-solid ${currentStatus?.icon || 'fa-plus'} text-[10px]`}></i>
            </div>
            <span className="truncate">{currentStatus?.label || 'Adicionar à Lista'}</span>
          </div>
          <i className={`fa-solid fa-chevron-down text-[8px] opacity-50 transition-transform duration-500 group-hover/btn:scale-110 ${showDropdown ? 'rotate-180' : ''}`}></i>
        </button>

        {showDropdown && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setShowDropdown(false)}></div>
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl p-2 z-[70] shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest px-3 py-2 mb-1 opacity-50">Alterar Status</div>
              {STATUS_MAP.map((status) => (
                <button
                  key={status.id}
                  onClick={() => updateStatus(status.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    userList?.status === status.id 
                      ? `${status.bg} ${status.color}` 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <i className={`fa-solid ${status.icon} w-4 text-center`}></i>
                    {status.label}
                  </div>
                  {userList?.status === status.id && <i className="fa-solid fa-check text-[8px]"></i>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {userList && (
        <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
          {/* Progress Control */}
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Progresso</span>
              <span className="text-[8px] font-black text-blue-500">
                {Math.round((userList.progress / (totalEpisodes || 1)) * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between bg-slate-950/50 rounded-xl px-2 py-2 border border-white/5">
              <button 
                onClick={() => updateStatus(userList.status, Math.max(0, userList.progress - 1))}
                className="text-slate-500 hover:text-white transition-colors w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/5"
                disabled={updating}
              >
                <i className="fa-solid fa-minus text-[8px]"></i>
              </button>
              <span className="text-[10px] font-black text-white w-8 text-center">{userList.progress}</span>
              <button 
                onClick={() => updateStatus(userList.status, Math.min(totalEpisodes || 999, userList.progress + 1))}
                className="text-slate-500 hover:text-white transition-colors w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/5"
                disabled={updating}
              >
                <i className="fa-solid fa-plus text-[8px]"></i>
              </button>
            </div>
          </div>

          {/* Score Control */}
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Sua Nota</span>
              {userList.score > 0 && (
                <div className="flex items-center gap-1 text-amber-500">
                  <i className="fa-solid fa-star text-[7px]"></i>
                  <span className="text-[8px] font-black">{userList.score}</span>
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowScoreModal(!showScoreModal)}
              className="w-full flex items-center justify-center bg-slate-950/50 rounded-xl py-2 border border-white/5 text-[10px] font-black text-white hover:border-amber-500/30 transition-all group"
            >
              {userList.score > 0 ? (
                <span className="text-amber-500">
                  {userList.score > 10 ? userList.score / 10 : userList.score}/10
                </span>
              ) : (
                <span className="text-slate-500 group-hover:text-slate-300">Nota</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Score Popup */}
      {showScoreModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowScoreModal(false)}></div>
          <div className="relative bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200">
            <h4 className="text-sm font-black text-white uppercase tracking-widest text-center mb-8">Como você avalia?</h4>
            <div className="grid grid-cols-5 gap-3 mb-8">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button
                  key={n}
                  onClick={() => updateStatus(userList.status, userList.progress, n)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                    userList.score === n 
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button 
              onClick={() => updateStatus(userList.status, userList.progress, 0)}
              className="w-full py-3 text-[9px] font-black text-slate-500 hover:text-red-500 uppercase tracking-widest transition-colors"
            >
              Remover Nota
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
