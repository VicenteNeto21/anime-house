import React from 'react';

export const metadata = {
  title: 'Data Protection & Privacy Policy | Anime House',
  description: 'Política de Privacidade e Proteção de Dados do Anime House, em conformidade com a LGPD e diretrizes globais de privacidade.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Profissional */}
        <div className="mb-16 border-b border-white/10 pb-12 text-left">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-500/20 rounded-md">
              Data Privacy & Security
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-6">
            Política de <span className="text-blue-500">Privacidade</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-3xl">
            Sua privacidade é nossa prioridade. Este documento detalha como o Anime House coleta, utiliza e protege suas informações em total conformidade com a LGPD (Lei 13.709/2018).
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-12 text-slate-300 text-sm md:text-base leading-relaxed">

          <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <i className="fa-solid fa-user-shield text-blue-500"></i>
              Compromisso com o Titular
            </h2>
            <p className="mb-4">
              O Anime House adota o princípio de <strong>Privacy by Design</strong>. Isso significa que nossa plataforma foi construída pensando na proteção de dados desde a primeira linha de código, garantindo que o tratamento de informações ocorra apenas quando estritamente necessário.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              1. Coleta de Informações
            </h2>
            <p className="mb-6">Coletamos dados em três categorias principais para garantir o funcionamento e a segurança da plataforma:</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-server text-blue-500 text-sm"></i> Dados Técnicos
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Endereços IP, tipo de navegador, sistema operacional e logs de acesso. Estes dados são usados exclusivamente para prevenção de ataques e diagnósticos de rede.
                </p>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-cookie text-blue-500 text-sm"></i> Cookies e Preferências
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Utilizamos cookies locais para salvar seu progresso nos episódios e suas listas personalizadas, sem a necessidade de contas obrigatórias.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              2. Uso de Dados e Publicidade (Google AdSense)
            </h2>
            <p className="mb-4">
              Para manter a gratuidade de nossos serviços, exibimos anúncios através do <strong>Google AdSense</strong>. O Google e seus parceiros utilizam cookies para veicular anúncios baseados em suas visitas anteriores a este ou outros sites na internet.
            </p>
            <p className="p-4 bg-blue-600/5 border-l-4 border-blue-600 text-slate-400 italic">
              "Você pode optar por não receber publicidade personalizada visitando as Configurações de Anúncios do Google ou utilizando ferramentas de opt-out da Network Advertising Initiative."
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              3. Direitos do Titular (LGPD)
            </h2>
            <p className="mb-4">
              Conforme a legislação brasileira, você possui o direito de: (i) Confirmar a existência de tratamento de dados; (ii) Acessar seus dados; (iii) Solicitar a anonimização ou exclusão de dados; (iv) Revogar seu consentimento a qualquer momento.
            </p>
          </section>

          <section className="bg-slate-900 border border-white/5 p-8 rounded-3xl text-center shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest">Encarregado de Proteção de Dados (DPO)</h2>
            <p className="text-slate-400 mb-6 italic text-sm">
              Para questões relacionadas à privacidade ou exercício de seus direitos, entre em contato:
            </p>
            <div className="inline-block px-8 py-4 bg-white/5 border border-blue-500/30 rounded-2xl">
              <p className="text-xl md:text-2xl font-black text-white tracking-widest">vneto750@gmail.com</p>
            </div>
            <p className="mt-6 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
              Departamento de Privacidade & Governança de Informação
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
