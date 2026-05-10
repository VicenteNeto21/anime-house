'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('ah_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('ah_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[100] animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl shadow-2xl shadow-black/50">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 shrink-0 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/20">
            <i className="fa-solid fa-cookie-bite text-blue-500 text-xl"></i>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-1">Privacidade e Cookies</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Utilizamos cookies para melhorar sua experiência, analisar o tráfego e exibir anúncios personalizados através do Google AdSense. 
              Ao clicar em aceitar, você concorda com o uso de cookies de acordo com nossa <Link href="/privacidade" className="text-blue-400 hover:underline">Política de Privacidade</Link>.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={acceptCookies}
            className="flex-grow px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            Aceitar tudo
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl border border-white/10 transition-all active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
