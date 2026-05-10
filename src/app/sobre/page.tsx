import Link from 'next/link';

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-20 px-4 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 text-center">
          <div className="w-20 h-1.5 bg-blue-600 rounded-full mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-6">
            Sobre o <span className="text-blue-500">Anime House</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Sua central de descobertas, informações e catalogação do universo japonês.
          </p>
        </header>

        <div className="grid gap-12 text-lg leading-relaxed text-slate-300">
          <section className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <i className="fa-solid fa-circle-info text-blue-500"></i>
              O que é o Anime House?
            </h2>
            <p className="mb-6">
              O Anime House nasceu com o propósito de ser a ferramenta definitiva para os entusiastas da cultura pop japonesa no Brasil. Funcionamos como um agregador de metadados e informações detalhadas sobre animes, similar a plataformas globais como <span className="text-white font-bold">AniList</span> e <span className="text-white font-bold">MyAnimeList</span>.
            </p>
            <p>
              Nosso foco principal é fornecer uma base de dados rica em informações, permitindo que os usuários descubram novos títulos, acompanhem lançamentos de temporada, consultem elencos de dublagem (Seiyuus), estúdios de animação e muito mais.
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <i className="fa-solid fa-database text-blue-500"></i>
                Tecnologia e Dados
              </h3>
              <p className="text-base text-slate-400">
                Utilizamos tecnologias de ponta e nos integramos à API do AniList para garantir que todas as informações, desde sinopses até pontuações da comunidade, sejam precisas e atualizadas em tempo real.
              </p>
            </div>
            <div className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <i className="fa-solid fa-shield-halved text-blue-500"></i>
                Compromisso Legal
              </h3>
              <p className="text-base text-slate-400">
                O Anime House não hospeda arquivos de vídeo em seus próprios servidores. Somos uma plataforma de catalogação. Priorizamos e incentivamos sempre o consumo de conteúdo através de plataformas oficiais de streaming.
              </p>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <i className="fa-solid fa-bullseye text-blue-500"></i>
                Nossa Missão
              </h3>
              <p className="text-base text-slate-400">
                Organizar a vasta informação do mundo dos animes de forma acessível e intuitiva para o público brasileiro, promovendo a cultura oriental de maneira ética e tecnológica.
              </p>
            </div>
            <div className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <i className="fa-solid fa-envelope text-blue-500"></i>
                Contato e Suporte
              </h3>
              <p className="text-base text-slate-400">
                Dúvidas, sugestões ou solicitações de parceria? Entre em contato conosco através do e-mail oficial: <br/>
                <span className="text-white font-bold block mt-2 text-lg">vneto750@gmail.com</span>
              </p>
            </div>
          </section>

          <section className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <i className="fa-solid fa-tv text-blue-500"></i>
              Onde Assistir Oficialmente?
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              O Anime House incentiva o apoio direto à indústria da animação. Abaixo, listamos as principais plataformas oficiais onde você pode assistir animes legalmente no Brasil:
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {[
                { name: 'Crunchyroll', url: 'https://crunchyroll.com', color: '#f47521', icon: 'https://www.google.com/s2/favicons?domain=crunchyroll.com&sz=128' },
                { name: 'Netflix', url: 'https://netflix.com', color: '#e50914', icon: 'https://www.google.com/s2/favicons?domain=netflix.com&sz=128' },
                { name: 'Disney+', url: 'https://disneyplus.com', color: '#0063e5', icon: 'https://www.google.com/s2/favicons?domain=disneyplus.com&sz=128' },
                { name: 'Prime Video', url: 'https://primevideo.com', color: '#00a8e1', icon: 'https://www.google.com/s2/favicons?domain=primevideo.com&sz=128' },
              ].map((platform) => (
                <a 
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-6 bg-slate-950/50 border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all group hover:-translate-y-1"
                >
                  <div className="w-16 h-16 mb-4 rounded-xl overflow-hidden shadow-lg border border-white/10 group-hover:border-white/20 transition-all flex items-center justify-center bg-slate-900">
                    <img 
                      src={platform.icon} 
                      alt={platform.name} 
                      className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" 
                    />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                    {platform.name}
                  </span>
                </a>
              ))}
            </div>
          </section>

          <section className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <i className="fa-solid fa-question-circle text-blue-500"></i>
              Perguntas Frequentes
            </h2>
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-bold mb-2">O Anime House cobra pelo acesso?</h4>
                <p className="text-sm text-slate-400">Não. Somos uma plataforma gratuita de consulta de informações sobre animes.</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-2">Como os dados são atualizados?</h4>
                <p className="text-sm text-slate-400">Nossos dados são sincronizados diariamente com bases de dados globais para garantir que você tenha sempre as informações mais recentes.</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-2">Como solicitar a remoção de conteúdo?</h4>
                <p className="text-sm text-slate-400">Respeitamos os direitos autorais. Caso seja proprietário de algum conteúdo e deseje solicitar a remoção de links indexados, utilize nossa página de <Link href="/dmca" className="text-blue-500 underline">DMCA</Link>.</p>
              </div>
            </div>
          </section>

          <section className="bg-blue-600/10 border border-blue-500/20 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all" />
            <h2 className="text-2xl font-bold text-white mb-4">Apoie os Meios Oficiais</h2>
            <p className="mb-6 text-slate-300">
              Acreditamos que a melhor forma de apoiar a indústria da animação é através dos meios oficiais. Em nossa plataforma, buscamos sempre deixar em destaque os links para os serviços de streaming onde o conteúdo pode ser assistido legalmente, como Crunchyroll, Netflix, Disney+ e Amazon Prime Video.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20">
                Explorar Catálogo
              </Link>
              <Link href="/termos" className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all">
                Termos de Uso
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
