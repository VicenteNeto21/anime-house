'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import SearchModal from '@/components/search/SearchModal';
import { AniListAPI } from '@/lib/api';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, status } = useSession();

  useEffect(() => {
    console.log('Session Status:', status);
    console.log('Session Data:', session);

    if (session?.user) {
      setUser({
        name: session.user.name,
        avatar: { large: session.user.image || 'https://placehold.co/100x100/0a0f1c/ffffff?text=User' },
        isGoogle: true
      });
      return;
    }

    const token = localStorage.getItem('anilist_token');
    const cachedUser = localStorage.getItem('anilist_user');

    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) { }
    }

    if (token) {
      AniListAPI.getCurrentUser(token)
        .then(data => {
          if (data?.Viewer) {
            setUser(data.Viewer);
            localStorage.setItem('anilist_user', JSON.stringify(data.Viewer));
          } else {
            localStorage.removeItem('anilist_token');
            localStorage.removeItem('anilist_user');
          }
        })
        .catch(() => {
          localStorage.removeItem('anilist_token');
          localStorage.removeItem('anilist_user');
        });
    } else {
      setUser(null);
    }
  }, [session]);

  const handleLogout = async () => {
    if (session) {
      await signOut({ redirect: false });
    }
    localStorage.removeItem('anilist_token');
    localStorage.removeItem('anilist_token_expiry');
    localStorage.removeItem('anilist_user');
    router.push('/');
    router.refresh();
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month < 3) return 'WINTER';
    if (month < 6) return 'SPRING';
    if (month < 9) return 'SUMMER';
    return 'FALL';
  };

  const currentYear = new Date().getFullYear();
  const currentSeason = getCurrentSeason();

  const desktopLinks = [
    { href: '/', label: 'Início' },
    { href: '/lista', label: 'Lista de Animes' },
    { href: '/generos', label: 'Gêneros' },
    { href: '/calendario', label: 'Calendário' },
    { href: '/lista?sort=POPULARITY_DESC', label: 'Top 100' },
    { href: `/lista?year=${currentYear}&season=${currentSeason}`, label: 'Temporada' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#0a0f1c]/90 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto h-16 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-1.5 group">
              <span className="font-display text-xl md:text-2xl font-black uppercase text-white">ANIME</span>
              <span className="font-display text-xl md:text-2xl font-black uppercase text-[#3b82f6] group-hover:text-blue-400 transition-colors">HOUSE</span>
            </Link>

            <div className="hidden lg:flex items-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-400">
              {desktopLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`transition-colors ${pathname === link.href ? 'text-[#3b82f6]' : 'hover:text-white'}`}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-5">
            <div className="flex items-center gap-3 md:gap-4 text-white/80 md:border-r border-white/5 md:pr-5">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hover:text-[#3b82f6] transition-all hover:scale-110 cursor-pointer p-1"
              >
                <i className="fa-solid fa-search text-sm"></i>
              </button>
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 p-1 pr-3 rounded-full bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-white/5 relative z-[110]"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-blue-500/50 bg-slate-800 flex items-center justify-center">
                    {user?.avatar?.large ? (
                      <Image
                        src={user.avatar.large}
                        alt={user?.name || 'User'}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    ) : (
                      <i className="fa-solid fa-user text-xs text-slate-400"></i>
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase text-white tracking-widest hidden md:block">
                    {user?.name || 'User'}
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
              <Link href="/login" className="px-3.5 md:px-6 py-2 md:py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-[8px] md:text-[10px] font-black rounded-xl transition-all uppercase tracking-widest cursor-pointer active:scale-95 whitespace-nowrap">
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
                className={`flex items-center gap-4 text-lg font-black uppercase tracking-widest transition-colors ${pathname === link.href ? 'text-[#3b82f6]' : 'text-slate-300 hover:text-blue-400'}`}
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
