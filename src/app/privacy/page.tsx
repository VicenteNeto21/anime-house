import React from 'react';

export const metadata = {
  title: 'Política de Privacidade | Anime House',
  description: 'Política de Privacidade e Proteção de Dados do Anime House, em conformidade com a LGPD.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-12 border-b border-white/10 pb-8 text-center">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
            Política de <span className="text-blue-600">Privacidade</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
            Última Atualização: 03 de Maio de 2026 • Versão 2.1
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              1. Introdução e Escopo
            </h2>
            <p>
              A presente Política de Privacidade regula o tratamento de dados pessoais coletados pelo <strong>Anime House</strong> ("Plataforma") de seus usuários ("Usuário" ou "Você"). Esta política foi elaborada em estrita conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD) e o Marco Civil da Internet (Lei nº 12.965/2014).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              2. Coleta de Dados e Finalidade
            </h2>
            <div className="space-y-4">
              <p>Coletamos informações necessárias para a prestação de serviços e melhoria da experiência do usuário, categorizadas da seguinte forma:</p>
              <ul className="list-disc pl-6 space-y-2 marker:text-blue-600">
                <li><strong>Dados de Identificação Digital:</strong> Endereço IP, registros de data/hora de acesso, tipo de dispositivo e navegador.</li>
                <li><strong>Dados de Preferência (Cookies):</strong> Histórico de visualização, progresso de episódios e listas de favoritos, armazenados localmente ou vinculados à sua conta AniList (via API).</li>
                <li><strong>Comunicação:</strong> Informações fornecidas voluntariamente em formulários de contato ou suporte técnico.</li>
              </ul>
              <p>A finalidade exclusiva destas coletas é a personalização da interface, monitoramento de performance e segurança cibernética.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              3. Direitos do Titular (Usuário)
            </h2>
            <p>
              Em conformidade com o Art. 18 da LGPD, garantimos ao Usuário o direito de confirmação de existência de tratamento, acesso aos dados, correção de dados incompletos ou inexatos, e a portabilidade das informações. Para exercer estes direitos, o Usuário pode utilizar as ferramentas de configurações do perfil ou contatar nosso encarregado de dados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              4. Compartilhamento com Terceiros
            </h2>
            <p>
              O Anime House não comercializa dados pessoais. O compartilhamento ocorre apenas com provedores de infraestrutura técnica (hospedagem e APIs como AniList) e ferramentas de análise estatística (Analytics), sempre sob estritas cláusulas de confidencialidade e segurança.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              5. Segurança da Informação
            </h2>
            <p>
              Empregamos protocolos de criptografia SSL/TLS e medidas técnicas administrativas para proteger seus dados contra acessos não autorizados e situações acidentais ou ilícitas de destruição, perda ou alteração.
            </p>
          </section>

          <div className="mt-20 pt-10 border-t border-white/5 text-center italic text-sm text-slate-500">
            Este documento é uma declaração jurídica de intenções e práticas. Ao utilizar nossos serviços, você concorda expressamente com os termos aqui dispostos.
          </div>
        </div>
      </div>
    </main>
  );
}
