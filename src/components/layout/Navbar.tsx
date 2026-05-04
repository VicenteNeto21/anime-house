'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SearchModal from '@/components/search/SearchModal';
import { AniListAPI } from '@/lib/api';

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('anilist_token');
    if (token) {
      AniListAPI.getCurrentUser(token)
        .then(data => {
          if (data?.Viewer) {
            setUser(data.Viewer);
          } else {
            localStorage.removeItem('anilist_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('anilist_token');
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('anilist_token');
    localStorage.removeItem('anilist_token_expiry');
    window.location.reload();
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#0a0f1c]/90 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto h-16 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-1.5 group">
              <span className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white">ANIME</span>
              <span className="text-xl md:text-2xl font-black tracking-tighter uppercase text-[#3b82f6] group-hover:text-blue-400 transition-colors">HOUSE</span>
            </Link>

            <div className="hidden lg:flex items-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-400">
              <Link href="/" className="hover:text-white transition-colors">Início</Link>
              <Link href="/lista" className="hover:text-white transition-colors">Lista de Animes</Link>
              <Link href="/generos" className="hover:text-white transition-colors">Gêneros</Link>
              <Link href="/calendario" className="hover:text-white transition-colors">Calendário</Link>
              <Link href="/lista?sort=POPULARITY_DESC" className="hover:text-white transition-colors">Top 100</Link>
              <Link href="/lista?season=2024" className="hover:text-white transition-colors">Temporada</Link>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="flex items-center gap-3 md:gap-4 text-white/80 md:border-r border-white/5 md:pr-5">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="hover:text-[#3b82f6] transition-all hover:scale-110 cursor-pointer"
              >
                <i className="fa-solid fa-search"></i>
              </button>
            </div>
            
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 p-1 pr-3 rounded-full bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-white/5 relative z-[110]"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-blue-500/50">
                    <img 
                      src={user.avatar.large} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase text-white tracking-widest hidden md:block">
                    {user.name}
                  </span>
                  <i className={`fa-solid fa-chevron-down text-[8px] text-slate-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}></i>
                </button>

                {isUserMenuOpen && (
                  <>
                    {/* Overlay agora atrás do menu mas na frente do resto */}
                    <div 
                      className="fixed inset-0 z-[105] bg-transparent" 
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    
                    <div className="absolute right-0 mt-3 w-48 bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl py-2 z-[110]">
                      <div className="px-4 py-3 border-b border-white/5 mb-2">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Conectado como</p>
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      </div>
                      <Link 
                        href="/perfil" 
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <i className="fa-solid fa-user text-xs w-4"></i>
                        Meu Perfil
                      </Link>
                      <Link 
                        href="/configuracoes" 
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <i className="fa-solid fa-gear text-xs w-4"></i>
                        Configurações
                      </Link>
                      <div className="h-px bg-white/5 my-2"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                      >
                        <i className="fa-solid fa-right-from-bracket text-xs w-4"></i>
                        Sair da Conta
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login" className="px-4 md:px-6 py-2 md:py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-[9px] md:text-[10px] font-black rounded-xl transition-all uppercase tracking-widest cursor-pointer active:scale-95">
                Entrar
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/5 text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-sm`}></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[99] bg-[#0a0f1c]/98 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col items-center justify-center h-full gap-6 pt-16">
            {[
              { href: '/', label: 'Início', icon: 'fa-home' },
              { href: '/lista', label: 'Lista de Animes', icon: 'fa-list' },
              { href: '/generos', label: 'Gêneros', icon: 'fa-tags' },
              { href: '/calendario', label: 'Calendário', icon: 'fa-calendar' },
              { href: '/lista?sort=POPULARITY_DESC', label: 'Top 100', icon: 'fa-trophy' },
              { href: '/perfil', label: 'Meu Perfil', icon: 'fa-user' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 text-lg font-black text-slate-300 hover:text-blue-400 uppercase tracking-widest transition-colors"
              >
                <i className={`fa-solid ${link.icon} text-blue-500 w-6 text-center`}></i>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}
