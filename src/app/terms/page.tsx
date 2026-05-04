import React from 'react';

export const metadata = {
  title: 'Termos de Uso | Anime House',
  description: 'Contrato de Termos e Condições de Uso da plataforma Anime House.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-12 border-b border-white/10 pb-8 text-center">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
            Termos de <span className="text-blue-600">Uso</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
            Vigência: Maio de 2026 • Instrumento Jurídico de Adesão
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              1. Aceitação dos Termos
            </h2>
            <p>
              Ao acessar a plataforma <strong>Anime House</strong>, você ("Usuário") celebra um contrato de adesão e declara estar ciente e de acordo com as regras estabelecidas neste instrumento. O acesso continuado à plataforma após qualquer modificação nestes termos constituirá aceitação tácita das novas condições.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              2. Natureza do Serviço e Limitação de Conteúdo
            </h2>
            <p>
              O Anime House atua exclusivamente como um <strong>indexador e agregador de links de vídeo</strong>. A plataforma não armazena, hospeda ou transmite arquivos protegidos por direitos autorais em seus próprios servidores. Todo o conteúdo acessado via player é proveniente de servidores de terceiros sobre os quais o Anime House não possui controle editorial ou jurídico.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              3. Propriedade Intelectual
            </h2>
            <p>
              Todas as marcas registradas, logotipos e metadados de animes exibidos na plataforma são de propriedade de seus respectivos detentores de direitos autorais. O uso desses elementos pelo Anime House é de caráter informativo e descritivo, enquadrando-se em princípios de <em>fair use</em> e indexação pública.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              4. Obrigações do Usuário
            </h2>
            <ul className="list-disc pl-6 space-y-2 marker:text-blue-600">
              <li>O Usuário deve possuir idade mínima de 13 anos ou estar sob supervisão legal.</li>
              <li>É proibida a utilização de bots, scrapers ou qualquer meio automatizado para extração de dados da plataforma.</li>
              <li>O Usuário compromete-se a utilizar a plataforma para fins estritamente pessoais e não comerciais.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              5. Exclusão de Responsabilidade
            </h2>
            <p>
              Em nenhuma circunstância o Anime House, seus desenvolvedores ou operadores serão responsáveis por quaisquer danos diretos, indiretos ou consequentes decorrentes do uso da plataforma ou da indisponibilidade do conteúdo fornecido por terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              6. Foro de Eleição
            </h2>
            <p>
              Para dirimir quaisquer controvérsias oriundas do presente instrumento, as partes elegem o foro da Comarca de domicílio do proprietário da plataforma, com renúncia expressa a qualquer outro por mais privilegiado que seja.
            </p>
          </section>

          <div className="mt-20 pt-10 border-t border-white/5 text-center text-xs text-slate-600 font-bold uppercase tracking-widest">
            Anime House © 2026 • Todos os Direitos Reservados
          </div>
        </div>
      </div>
    </main>
  );
}
