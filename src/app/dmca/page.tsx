import React from 'react';

export const metadata = {
  title: 'Compliance & DMCA Policy | Anime House',
  description: 'Informações sobre propriedade intelectual, conformidade com o DMCA e diretrizes de remoção de conteúdo do ecossistema Anime House.',
};

export default function DMCAPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Profissional */}
        <div className="mb-16 border-b border-white/10 pb-12 text-left">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/20 rounded-md">
              Legal Compliance
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-6">
            Política de <span className="text-red-600">Propriedade Intelectual</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-3xl">
            O Anime House respeita os direitos de propriedade intelectual de terceiros e espera que seus usuários façam o mesmo, em conformidade com o Digital Millennium Copyright Act ("DMCA").
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-12 text-slate-300 text-sm md:text-base leading-relaxed">

          <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <i className="fa-solid fa-scale-balanced text-red-600"></i>
              Natureza do Serviço
            </h2>
            <p className="mb-4">
              O <strong>Anime House</strong> opera estritamente como um provedor de serviços de busca e indexação, conforme definido sob a Seção 512 do DMCA. Nossa plataforma funciona como um diretório técnico que organiza metadados e fornece hiperlinks para conteúdos hospedados em servidores de terceiros.
            </p>
            <p className="text-slate-400 italic">
              Ressaltamos: não realizamos upload, armazenamento ou transmissão de arquivos de vídeo em nossos próprios servidores. Toda e qualquer mídia é servida por plataformas externas independentes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
              1. Notificação Formal de Infração
            </h2>
            <p className="mb-6">
              Se você acredita que sua obra protegida por direitos autorais foi indexada de forma não autorizada, envie uma Notificação de Infração devidamente formalizada (conforme 17 U.S.C. § 512(c)(3)) contendo os seguintes elementos:
            </p>
            <ul className="grid gap-4 list-none pl-0">
              {[
                "Assinatura física ou eletrônica do proprietário dos direitos ou seu representante legal;",
                "Identificação clara da obra original supostamente infringida;",
                "URLs específicas do Anime House onde o link infrator está indexado;",
                "Informações completas para contato (E-mail, Endereço e Telefone);",
                "Declaração de 'boa-fé' de que o uso do material não é autorizado;",
                "Declaração de precisão das informações sob pena de perjúrio."
              ].map((item, index) => (
                <li key={index} className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-xl">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center font-black text-[10px]">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
              2. Procedimentos e Prazos
            </h2>
            <p className="mb-4">
              Ao receber uma notificação que cumpra integralmente os requisitos acima, o Anime House iniciará o processo de desindexação imediata. Nosso compromisso padrão de resposta é de <strong>24 a 48 horas úteis</strong>.
            </p>
            <p>
              Alertamos que o envio de notificações falsas ou fraudulentas pode acarretar em responsabilidade civil por danos, incluindo custos advocatícios, conforme previsto na Seção 512(f) do DMCA.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
              3. Contra-Notificação
            </h2>
            <p className="mb-4">
              Caso um link tenha sido desindexado e o provedor de conteúdo original acredite que isso ocorreu por erro ou identificação equivocada, uma contra-notificação poderá ser enviada. O material desindexado poderá ser restaurado em 10 a 14 dias úteis, a menos que o detentor original do copyright inicie uma ação judicial.
            </p>
          </section>

          <section className="bg-slate-900 border border-white/5 p-8 rounded-3xl text-center shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest">Canal de Comunicação Direta</h2>
            <p className="text-slate-400 mb-6 italic text-sm">
              Envie sua solicitação formal para o e-mail abaixo. Utilize o assunto: <br className="hidden md:block" />
              <span className="text-white font-mono font-bold">[LEGAL-NOTICE] Copyright Claim - Anime House</span>
            </p>
            <div className="inline-block px-8 py-4 bg-white/5 border border-red-500/30 rounded-2xl">
              <p className="text-xl md:text-2xl font-black text-white tracking-widest">vneto750@gmail.com</p>
            </div>
            <p className="mt-6 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
              Departamento de Compliance Digital & Proteção de Dados
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
