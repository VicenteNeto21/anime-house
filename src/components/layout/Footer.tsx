import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare } from 'lucide-react';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-slate-950 pt-20 pb-10 border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 text-left">
          <div className="col-span-2">
            <span className="font-display text-2xl font-black uppercase mb-6 block text-white">
              ANIME<span className="text-blue-500">HOUSE</span>
            </span>
            <p className="text-slate-400 max-w-sm mb-8 text-sm leading-relaxed">
              A melhor plataforma para você assistir seus animes favoritos em alta definição com a melhor experiência otaku.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-11 h-11 flex items-center justify-center bg-slate-900 hover:bg-blue-600 transition-all rounded-full text-white border border-white/5"
                aria-label="Instagram oficial"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-11 h-11 flex items-center justify-center bg-slate-900 hover:bg-blue-600 transition-all rounded-full text-white border border-white/5"
                aria-label="Twitter oficial"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-11 h-11 flex items-center justify-center bg-slate-900 hover:bg-blue-600 transition-all rounded-full text-white border border-white/5"
                aria-label="Servidor no Discord"
              >
                <MessageSquare className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-[10px] uppercase tracking-[0.2em] text-slate-500">Navegação</h4>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              <li><Link href="/" className="hover:text-blue-500 transition-colors">Início</Link></li>
              <li><Link href="/noticias" className="hover:text-blue-500 transition-colors">Notícias</Link></li>
              <li><Link href="/sobre" className="hover:text-blue-500 transition-colors">Sobre Nós</Link></li>
              <li><Link href="/lista" className="hover:text-blue-500 transition-colors">Lista de Animes</Link></li>
              <li><Link href="/generos" className="hover:text-blue-500 transition-colors">Gêneros</Link></li>
              <li><Link href="/calendario" className="hover:text-blue-500 transition-colors">Calendário</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-[10px] uppercase tracking-[0.2em] text-slate-500">Legal</h4>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              <li><Link href="/privacidade" className="hover:text-blue-500 transition-colors">Privacidade</Link></li>
              <li><Link href="/termos" className="hover:text-blue-500 transition-colors">Termos de Uso</Link></li>
              <li><Link href="/dmca" className="hover:text-blue-500 transition-colors">DMCA</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col items-center gap-4 text-center">
          <p className="text-slate-600 text-[11px] max-w-2xl leading-relaxed italic">
            Esse site não hospeda nenhum vídeo em seu servidor. Todo o conteúdo é disponibilizado por terceiros não afiliados.
          </p>
          <div className="text-slate-500 text-[11px] font-medium flex flex-col items-center gap-6">
            <div className="flex items-center gap-4 bg-white/5 px-5 py-2.5 rounded-full border border-white/5 grayscale hover:grayscale-0 transition-all cursor-pointer group">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-400 transition-colors mr-1">Dados via</span>
              <div className="flex items-center gap-4">
                <a href="https://anilist.co" target="_blank" rel="noopener noreferrer" title="AniList">
                  <Image src="https://anilist.co/img/icons/icon.svg" alt="AniList" width={20} height={20} />
                </a>
                <a href="https://myanimelist.net" target="_blank" rel="noopener noreferrer" title="MyAnimeList">
                  <Image src="https://cdn.myanimelist.net/images/favicon.ico" alt="MAL" width={16} height={16} className="brightness-125" />
                </a>
                <a href="https://kitsu.io" target="_blank" rel="noopener noreferrer" title="Kitsu">
                  <Image src="https://kitsu.io/favicon.ico" alt="Kitsu" width={16} height={16} />
                </a>
                <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" title="TMDB">
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/8/89/Tmdb.new.logo.svg" alt="TMDB" width={60} height={10} className="h-2.5 w-auto" />
                </a>
              </div>
            </div>
            <span>© 2026 Anime House • Todos os direitos reservados.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
