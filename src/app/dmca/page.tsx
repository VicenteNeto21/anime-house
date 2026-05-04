import React from 'react';

export const metadata = {
  title: 'DMCA & Direitos Autorais | Anime House',
  description: 'Informações sobre direitos autorais e procedimento de remoção de conteúdo (DMCA) do Anime House.',
};

export default function DMCAPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-12 border-b border-red-900/30 pb-8 text-center">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
            Aviso de <span className="text-red-600">Direitos Autorais</span> (DMCA)
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
            Digital Millennium Copyright Act Compliance
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-slate-300 leading-relaxed">
          <section className="bg-red-900/5 border border-red-900/20 rounded-2xl p-6">
            <p className="text-red-400 font-bold mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation"></i> Declaração de Isenção
            </p>
            <p className="text-sm">
              O <strong>Anime House</strong> é um site indexador. Não hospedamos nenhum arquivo em nossos servidores. Todos os conteúdos são providos por terceiros não afiliados. Entretanto, respeitamos rigorosamente a propriedade intelectual e operamos um sistema célere de remoção de links infratores.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></span>
              1. Notificação de Infração
            </h2>
            <p>
              Se você é o detentor de direitos autorais ou um agente autorizado e acredita que qualquer conteúdo indexado na plataforma infringe seus direitos sob as leis de proteção de propriedade intelectual (DMCA 17 U.S.C. § 512), você deve enviar uma notificação por escrito contendo as seguintes informações:
            </p>
            <ul className="list-decimal pl-6 mt-4 space-y-3 marker:text-red-600 marker:font-black">
              <li>Assinatura física ou eletrônica do proprietário do direito ou agente autorizado;</li>
              <li>Identificação da obra protegida por direitos autorais que supostamente foi infringida;</li>
              <li>Identificação do material específico que deve ser removido (URLs exatas na plataforma Anime House);</li>
              <li>Informações de contato suficientes para que possamos localizá-lo (E-mail, telefone);</li>
              <li>Uma declaração de que você acredita, de boa-fé, que o uso do material não é autorizado pelo detentor do direito;</li>
              <li>Uma declaração, sob pena de perjúrio, de que as informações na notificação são precisas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></span>
              2. Procedimento de Remoção
            </h2>
            <p>
              Após o recebimento de uma notificação válida, o Anime House procederá com a desindexação imediata (em até 48 horas úteis) do link infrator. Ressaltamos que, por não hospedarmos o conteúdo, a remoção da nossa plataforma não remove o arquivo do servidor original do provedor de vídeo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></span>
              3. Contato Jurídico
            </h2>
            <p>
              Para o envio de solicitações de remoção, utilize exclusivamente o endereço de e-mail abaixo, com o assunto "COPYRIGHT INFRINGEMENT NOTICE - [NOME DA OBRA]":
            </p>
            <div className="mt-6 p-4 bg-slate-900/50 border border-white/5 rounded-xl text-center">
              <p className="text-blue-500 font-black tracking-widest">dmca@animehouse.com</p>
              <p className="text-[10px] text-slate-500 mt-2 italic font-bold">Solicitações sem as informações completas do item 1 serão desconsideradas.</p>
            </div>
          </section>

          <div className="mt-20 pt-10 border-t border-white/5 text-center text-xs text-slate-600 font-bold uppercase tracking-widest">
            Ação Proativa contra a Pirataria Digital • Anime House 2026
          </div>
        </div>
      </div>
    </main>
  );
}
