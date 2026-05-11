import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 pt-20 pb-10 border-t border-white/5">
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
              <a href="#" className="w-11 h-11 flex items-center justify-center bg-slate-900 hover:bg-blue-600 transition-all rounded-full text-white border border-white/5">
                <i className="fa-brands fa-instagram text-lg"></i>
              </a>
              <a href="#" className="w-11 h-11 flex items-center justify-center bg-slate-900 hover:bg-blue-600 transition-all rounded-full text-white border border-white/5">
                <i className="fa-brands fa-x-twitter text-lg"></i>
              </a>
              <a href="#" className="w-11 h-11 flex items-center justify-center bg-slate-900 hover:bg-blue-600 transition-all rounded-full text-white border border-white/5">
                <i className="fa-brands fa-discord text-lg"></i>
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
                  <img src="https://anilist.co/img/icons/icon.svg" alt="AniList" className="h-5 w-5" />
                </a>
                <a href="https://myanimelist.net" target="_blank" rel="noopener noreferrer" title="MyAnimeList">
                  <img src="https://cdn.myanimelist.net/images/favicon.ico" alt="MAL" className="h-4 w-4 brightness-125" />
                </a>
                <a href="https://kitsu.io" target="_blank" rel="noopener noreferrer" title="Kitsu">
                  <img src="https://kitsu.io/favicon.ico" alt="Kitsu" className="h-4 w-4" />
                </a>
                <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" title="TMDB">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Tmdb.new.logo.svg" alt="TMDB" className="h-2.5 w-auto" />
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
