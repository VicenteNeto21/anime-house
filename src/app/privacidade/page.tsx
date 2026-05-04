import React from 'react';

export const metadata = {
  title: 'Política de Privacidade | Anime House',
  description: 'Política de Privacidade e Proteção de Dados do Anime House, em conformidade com a LGPD.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20 text-slate-100">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-12 border-b border-white/10 pb-8 text-center">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
            Política de <span className="text-blue-600">Privacidade</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
            Última Atualização: 03 de Maio de 2026 • Em Conformidade com a LGPD
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-slate-300 leading-relaxed text-justify">
          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></span>
              1. Preâmbulo e Base Legal
            </h2>
            <p>
              O <strong>Anime House</strong>, doravante denominado "Plataforma", estabelece esta Política de Privacidade para reafirmar seu compromisso com a transparência e a segurança no tratamento de dados pessoais. Este documento foi redigido em observância à <strong>Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD)</strong>, ao Marco Civil da Internet (Lei nº 12.965/2014) e às melhores práticas internacionais de <em>data protection</em>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></span>
              2. Coleta de Dados e Finalidades do Tratamento
            </h2>
            <div className="space-y-4">
              <p>O tratamento de dados na Plataforma limita-se ao mínimo necessário para a operação dos serviços, baseando-se nas seguintes categorias:</p>
              <ul className="list-disc pl-6 space-y-3 marker:text-blue-600">
                <li><strong>Dados de Acesso Técnico:</strong> Coletamos automaticamente endereços IP, logs de acesso, geolocalização aproximada e metadados de hardware para fins de segurança cibernética e prevenção de fraudes (Art. 7º, IX, LGPD).</li>
                <li><strong>Dados de Experiência (Cookies e Cache):</strong> Armazenamos localmente seu histórico de visualização e progresso de episódios para garantir a continuidade do serviço, sob a base legal do legítimo interesse.</li>
                <li><strong>Interação com APIs de Terceiros:</strong> Caso utilize integração com o AniList, os dados de autenticação são tratados via protocolo OAuth, garantindo que a Plataforma não tenha acesso direto à sua senha.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></span>
              3. Direitos e Prerrogativas do Usuário
            </h2>
            <p>
              Na qualidade de Titular de Dados, o Usuário possui direitos inalienáveis, incluindo, mas não se limitando a: (i) confirmação da existência de tratamento; (ii) acesso integral aos dados; (iii) retificação de informações; (iv) anonimização ou eliminação de dados desnecessários; e (v) revogação do consentimento, quando aplicável. Tais requisições podem ser formalizadas através do nosso canal de suporte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></span>
              4. Compartilhamento e Transferência Internacional
            </h2>
            <p>
              A Plataforma poderá compartilhar dados com provedores de serviços de nuvem e infraestrutura situados no exterior, assegurando que tais jurisdições possuam níveis adequados de proteção de dados ou que as transferências sejam amparadas por cláusulas contratuais padrão, conforme diretrizes da Autoridade Nacional de Proteção de Dados (ANPD).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></span>
              5. Medidas de Segurança Cibernética
            </h2>
            <p>
              Implementamos rigorosos protocolos de segurança, incluindo criptografia de ponta a ponta (SSL/TLS), firewalls de aplicação e monitoramento de rede 24/7. No entanto, ressaltamos que nenhum sistema é inteiramente impenetrável, e a segurança também depende da diligência do Usuário na proteção de seus próprios dispositivos.
            </p>
          </section>

          <div className="mt-20 pt-10 border-t border-white/5 text-center italic text-sm text-slate-500">
            © 2026 Anime House Legal Department. Este documento possui validade jurídica em território nacional.
          </div>
        </div>
      </div>
    </main>
  );
}
