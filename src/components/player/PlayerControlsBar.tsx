'use client';

import { useRef, useEffect } from 'react';
import { EmbedSource, AudioOption } from '@/lib/embeds';
import {
  SkipBack,
  SkipForward,
  Magnet,
  Server,
  ChevronDown,
  Check,
  Subtitles,
  Mic,
  Maximize,
  Minimize,
  ChevronsRight,
  ChevronsLeft,
} from 'lucide-react';

interface PlayerControlsBarProps {
  currentEp: number;
  totalEps: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrevEp: () => void;
  onNextEp: () => void;
  // Torrent
  onOpenTorrentModal: () => void;
  hasActiveTorrent: boolean;
  // Sources & Server
  sources: EmbedSource[];
  activeSourceId: string;
  onSelectSource: (sourceId: string) => void;
  showServerMenu: boolean;
  onToggleServerMenu: () => void;
  onCloseServerMenu: () => void;
  // Audio
  audio: AudioOption;
  onAudioChange: (audio: AudioOption) => void;
  // View Modes
  isTheaterMode: boolean;
  onToggleTheaterMode: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function PlayerControlsBar({
  currentEp,
  totalEps,
  hasPrev,
  hasNext,
  onPrevEp,
  onNextEp,
  onOpenTorrentModal,
  hasActiveTorrent,
  sources,
  activeSourceId,
  onSelectSource,
  showServerMenu,
  onToggleServerMenu,
  onCloseServerMenu,
  audio,
  onAudioChange,
  isTheaterMode,
  onToggleTheaterMode,
  sidebarOpen,
  onToggleSidebar,
}: PlayerControlsBarProps) {
  const serverMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (serverMenuRef.current && !serverMenuRef.current.contains(e.target as Node)) {
        onCloseServerMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCloseServerMenu]);

  const currentSource = sources.find((s) => s.id === activeSourceId) || sources[0];

  return (
    <div className="relative z-30 flex flex-wrap items-center gap-2 md:gap-3 bg-slate-900/60 p-2.5 md:p-3 rounded-2xl border border-white/5 backdrop-blur-md">
      {/* Episode Navigation */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onPrevEp}
          disabled={!hasPrev}
          className="w-9 h-9 flex items-center justify-center bg-slate-800/80 border border-white/5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          title="Episódio anterior"
          aria-label="Episódio anterior"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <div className="px-3.5 py-2 bg-slate-800/80 border border-white/5 rounded-xl flex items-center select-none">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
            EP {currentEp.toString().padStart(2, '0')}
          </span>
          <span className="text-[10px] text-slate-600 mx-1.5">/</span>
          <span className="text-[10px] font-bold text-slate-400">
            {totalEps || '??'}
          </span>
        </div>

        <button
          onClick={onNextEp}
          disabled={!hasNext}
          className="w-9 h-9 flex items-center justify-center bg-slate-800/80 border border-white/5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          title="Próximo episódio"
          aria-label="Próximo episódio"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-white/10 hidden md:block" />

      {/* Torrent Button */}
      <button
        onClick={onOpenTorrentModal}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
          hasActiveTorrent
            ? 'bg-indigo-600 border border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
            : 'bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 hover:text-white'
        }`}
        title="Buscar torrents via Webtor P2P"
      >
        <Magnet className="w-3.5 h-3.5 text-indigo-400" />
        {hasActiveTorrent ? 'Trocar Torrent/Seed' : 'Buscar Torrent'}
      </button>

      {/* Server Selector Dropdown */}
      {sources.length > 0 && (
        <div className="relative" ref={serverMenuRef}>
          <button
            onClick={onToggleServerMenu}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800/80 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all"
            aria-expanded={showServerMenu}
            aria-haspopup="true"
          >
            <Server className="w-3 h-3 text-blue-500" />
            <span className="truncate max-w-[120px] md:max-w-none">{currentSource?.name || 'Servidor'}</span>
            <ChevronDown
              className={`w-3 h-3 text-slate-400 transition-transform ${showServerMenu ? 'rotate-180' : ''}`}
            />
          </button>

          {showServerMenu && (
            <div className="absolute bottom-full mb-2 left-0 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl py-2 z-50 max-h-80 overflow-y-auto">
              <div className="px-3 py-2 border-b border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                  Selecionar Servidor
                </p>
              </div>
              <div className="p-1">
                {sources.map((s) => {
                  const isSelected = s.id === activeSourceId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => onSelectSource(s.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            s.provider === 'webtor' ? 'bg-indigo-400' : 'bg-blue-500'
                          }`}
                        />
                        <span className="truncate">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {s.audioLabel && (
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                            {s.audioLabel}
                          </span>
                        )}
                        {isSelected && <Check className="w-3 h-3 text-blue-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audio Selector Tabs */}
      <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-white/5">
        <button
          onClick={() => onAudioChange('leg')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
            audio === 'leg'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Subtitles className="w-3 h-3" />
          <span className="hidden sm:inline">Legendado</span>
          <span className="sm:hidden">LEG</span>
        </button>

        <button
          onClick={() => onAudioChange('dub')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
            audio === 'dub'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mic className="w-3 h-3" />
          <span className="hidden sm:inline">Dublado</span>
          <span className="sm:hidden">DUB</span>
        </button>
      </div>

      {/* Right side tools */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Theater Mode Button */}
        <button
          onClick={onToggleTheaterMode}
          className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all ${
            isTheaterMode
              ? 'bg-blue-600 text-white border-blue-400/40 shadow-lg shadow-blue-500/20'
              : 'bg-slate-800/80 border-white/5 text-slate-400 hover:text-white hover:bg-slate-700/80'
          }`}
          title={isTheaterMode ? 'Sair do Modo Teatro' : 'Modo Teatro'}
          aria-label={isTheaterMode ? 'Sair do Modo Teatro' : 'Modo Teatro'}
        >
          {isTheaterMode ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Sidebar Toggle for Desktop */}
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex w-9 h-9 items-center justify-center bg-slate-800/80 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all"
          title={sidebarOpen ? 'Recolher barra de episódios' : 'Expandir barra de episódios'}
          aria-label={sidebarOpen ? 'Recolher barra de episódios' : 'Expandir barra de episódios'}
        >
          {sidebarOpen ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
