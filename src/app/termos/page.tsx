import React from 'react';

export const metadata = {
  title: 'Terms of Service | Anime House',
  description: 'Contrato de Termos e Condições de Uso da plataforma Anime House. Instrumento jurídico que rege o acesso e utilização dos serviços.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Profissional */}
        <div className="mb-16 border-b border-white/10 pb-12 text-left">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-indigo-600/10 text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20 rounded-md">
              Legal Agreement
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-6">
            Termos e <span className="text-indigo-500">Condições</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-3xl">
            Bem-vindo ao Anime House. Ao acessar nossa plataforma, você concorda em cumprir e ser regido por estes Termos de Uso. Por favor, leia-os com atenção.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-12 text-slate-300 text-sm md:text-base leading-relaxed">
          
          <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <i className="fa-solid fa-file-contract text-indigo-500"></i>
              Aceitação dos Termos
            </h2>
            <p className="mb-4">
              O acesso e a utilização do <strong>Anime House</strong> estão condicionados à sua aceitação integral destes Termos de Uso. Este documento constitui um contrato vinculativo. Caso não concorde com qualquer disposição, você deve cessar imediatamente o uso da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
              1. Escopo de Atuação (Indexador Técnico)
            </h2>
            <p className="mb-4">
              O Anime House atua exclusivamente como um <strong>indexador e agregador de metadados</strong>. Nossa função é organizar informações públicas e fornecer links para conteúdos hospedados em servidores de terceiros.
            </p>
            <div className="p-6 bg-indigo-600/5 border border-indigo-600/20 rounded-2xl">
              <h4 className="text-white font-bold mb-2">Atenção Crítica:</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Nós NÃO hospedamos, armazenamos ou fazemos upload de arquivos de vídeo em nossa infraestrutura. Toda e qualquer mídia exibida é de responsabilidade única e exclusiva de seus respectivos provedores de hospedagem externos.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
              2. Propriedade Intelectual e Uso Justo
            </h2>
            <p className="mb-4">
              Todas as marcas registradas, nomes de animes, capas e descrições pertencem aos seus legítimos proprietários. O Anime House utiliza esses dados sob os princípios do <strong>Uso Justo (Fair Use)</strong>, com fins meramente informativos, educativos e de catalogação.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
              3. Responsabilidades do Usuário
            </h2>
            <p className="mb-4">Ao utilizar nossa plataforma, você se compromete a:</p>
            <ul className="list-none pl-0 space-y-3">
              {[
                "Não utilizar robôs ou scripts para extração massiva de dados (scraping).",
                "Não tentar comprometer a segurança ou integridade do sistema.",
                "Respeitar os direitos autorais e consumir conteúdo através de meios oficiais sempre que possível.",
                "Não realizar qualquer atividade ilegal utilizando os links aqui indexados."
              ].map((item, index) => (
                <li key={index} className="flex gap-4 items-start">
                  <i className="fa-solid fa-check text-indigo-500 mt-1"></i>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
              4. Limitação de Responsabilidade
            </h2>
            <p className="mb-4">
              O Anime House não garante que a plataforma estará sempre disponível ou livre de erros. Não nos responsabilizamos pela qualidade, veracidade ou disponibilidade do conteúdo servido pelos servidores de terceiros linkados em nossa plataforma.
            </p>
          </section>

          <section className="bg-slate-900 border border-white/5 p-8 rounded-3xl text-center shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest">Dúvidas Jurídicas</h2>
            <p className="text-slate-400 mb-6 italic text-sm">
              Para esclarecimentos sobre estes termos ou questões de conformidade:
            </p>
            <div className="inline-block px-8 py-4 bg-white/5 border border-indigo-500/30 rounded-2xl">
              <p className="text-xl md:text-2xl font-black text-white tracking-widest">vneto750@gmail.com</p>
            </div>
            <p className="mt-6 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
              Departamento Jurídico & Governança Corporativa
            </p>
          </section>

          <footer className="mt-20 pt-10 border-t border-white/5 text-center">
            <p className="text-slate-600 text-[11px] font-bold uppercase tracking-[0.3em]">
              © 2026 Anime House Ecosystem • Terms of Engagement
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
