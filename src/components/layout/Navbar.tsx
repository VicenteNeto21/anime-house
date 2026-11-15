'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import SearchModal from '@/components/search/SearchModal';
import { useSession, signOut } from 'next-auth/react';
import {
  Search,
  User,
  ChevronDown,
  Settings,
  LogOut,
  LogIn,
  Menu,
  X,
  Home,
  Newspaper,
  List,
  Tags,
  Calendar,
  Trophy,
} from 'lucide-react';

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string | null; avatar?: { large?: string | null }; provider?: unknown } | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.user) {
      setUser({
        name: session.user.name,
        avatar: { large: session.user.image || 'https://placehold.co/100x100/0a0f1c/ffffff?text=User' },
        provider: (session as { provider?: unknown }).provider,
      });
    } else {
      setUser(null);
    }
  }, [session]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
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
    { href: '/noticias', label: 'Notícias' },
    { href: '/lista', label: 'Lista de Animes' },
    { href: '/generos', label: 'Gêneros' },
    { href: '/calendario', label: 'Calendário' },
    { href: '/lista?sort=POPULARITY_DESC', label: 'Top 100' },
    { href: `/lista?year=${currentYear}&season=${currentSeason}`, label: 'Temporada' },
  ];

  const mobileNavLinks = [
    { href: '/', label: 'Início', icon: Home },
    { href: '/noticias', label: 'Notícias', icon: Newspaper },
    { href: '/lista', label: 'Lista de Animes', icon: List },
    { href: '/generos', label: 'Gêneros', icon: Tags },
    { href: '/calendario', label: 'Calendário', icon: Calendar },
    { href: '/lista?sort=POPULARITY_DESC', label: 'Top 100', icon: Trophy },
    ...(user
      ? [{ href: '/perfil', label: 'Meu Perfil', icon: User }]
      : [{ href: '/login', label: 'Entrar / Criar Conta', icon: LogIn }]),
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#0a0f1c]/90 backdrop-blur-md border-b border-white/5 pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto h-16 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-1.5 group">
              <span className="font-display text-xl md:text-2xl font-black uppercase text-white">ANIME</span>
              <span className="font-display text-xl md:text-2xl font-black uppercase text-[#3b82f6] group-hover:text-blue-400 transition-colors">HOUSE</span>
            </Link>

            <div className="hidden lg:flex items-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-400">
              {desktopLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors ${pathname === link.href ? 'text-[#3b82f6]' : 'hover:text-white'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-5">
            <div className="flex items-center gap-3 md:gap-4 text-white/80 md:border-r border-white/5 md:pr-5">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hover:text-[#3b82f6] transition-all hover:scale-110 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg"
                aria-label="Abrir busca de animes (Cmd+K)"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 p-1 pr-3 rounded-full bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-white/5 relative z-[110]"
                  aria-label="Menu do usuário"
                  aria-expanded={isUserMenuOpen}
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
                      <User className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase text-white tracking-widest hidden md:block">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <>
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
                        <User className="w-3.5 h-3.5" />
                        Meu Perfil
                      </Link>
                      <Link
                        href="/configuracoes"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Configurações
                      </Link>
                      <div className="h-px bg-white/5 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sair da Conta
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-3.5 py-1.5 md:px-4 md:py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer min-h-[38px]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/5 text-white/70 hover:text-white transition-all cursor-pointer"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[99] bg-[#0a0f1c]/98 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col items-center justify-center h-full gap-6 pt-16">
            {mobileNavLinks.map((link) => {
              const IconComp = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 text-lg font-black uppercase tracking-widest transition-colors ${
                    pathname === link.href ? 'text-[#3b82f6]' : 'text-slate-300 hover:text-blue-400'
                  }`}
                >
                  <IconComp className="w-5 h-5 text-blue-500" />
                  {link.label}
                </Link>
              );
            })}
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
