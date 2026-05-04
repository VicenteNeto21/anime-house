import React from 'react';

export const metadata = {
  title: 'Termos de Uso | Anime House',
  description: 'Contrato de Termos e Condições de Uso da plataforma Anime House.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20 text-slate-100">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-12 border-b border-white/10 pb-8 text-center">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
            Termos e <span className="text-blue-600">Condições</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
            Instrumento Jurídico de Adesão • Versão Maio/2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-slate-300 leading-relaxed text-justify">
          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></span>
              1. Natureza Jurídica do Acordo
            </h2>
            <p>
              O acesso à plataforma <strong>Anime House</strong> implica na aceitação plena e irrevogável destes Termos de Uso. O presente documento constitui um contrato vinculativo entre o Usuário e a Plataforma. Caso discorde de qualquer cláusula aqui disposta, o Usuário deve cessar imediatamente a utilização dos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></span>
              2. Escopo do Serviço (Provedor de Indexação)
            </h2>
            <p>
              O Anime House atua estritamente como um <strong>provedor de busca e indexação de metadados</strong> relativos a obras audiovisuais (animes). A Plataforma não hospeda, armazena, transmite ou faz upload de qualquer arquivo de vídeo ou mídia protegida por direitos autorais em sua infraestrutura própria. Os links exibidos são agregados de fontes externas e públicas, operando a Plataforma como um facilitador de busca técnica.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></span>
              3. Propriedade Intelectual de Terceiros
            </h2>
            <p>
              O Anime House reconhece e respeita os direitos de propriedade intelectual de estúdios e produtoras. O uso de nomes, imagens e descrições de obras tem fins meramente informativos e descritivos, sob a égide do uso justo (<em>fair use</em>) e do direito à informação. Marcas registradas mencionadas pertencem aos seus legítimos proprietários.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></span>
              4. Responsabilidade e Indenidade
            </h2>
            <p>
              A Plataforma é fornecida no estado em que se encontra ("as is"). O Anime House não oferece garantias de disponibilidade ininterrupta ou de precisão do conteúdo indexado. O Usuário concorda em manter a Plataforma e seus desenvolvedores indenes contra quaisquer reclamações, perdas ou danos decorrentes do uso indevido do serviço ou da violação destes termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></span>
              5. Modificações e Rescisão
            </h2>
            <p>
              Reservamo-nos o direito de modificar este instrumento a qualquer momento, visando a adequação legislativa ou melhoria dos serviços. O Anime House poderá, a seu exclusivo critério, suspender ou encerrar o acesso de Usuários que violem as normas de conduta ou utilizem meios automatizados prejudiciais à estabilidade do sistema.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></span>
              6. Jurisdição e Foro
            </h2>
            <p>
              Este contrato é regido pelas leis da República Federativa do Brasil. Fica eleito o foro Central da Comarca de domicílio da administração da Plataforma para dirimir qualquer litígio, com renúncia a qualquer outro foro.
            </p>
          </section>

          <div className="mt-20 pt-10 border-t border-white/5 text-center text-xs text-slate-600 font-bold uppercase tracking-widest">
            Anime House © 2026 • Legal Department • Compliance & Ethics
          </div>
        </div>
      </div>
    </main>
  );
}
