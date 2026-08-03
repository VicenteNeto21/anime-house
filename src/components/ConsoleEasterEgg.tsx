'use client';

import { useEffect } from 'react';

export default function ConsoleEasterEgg() {
  useEffect(() => {
    // Evita rodar no servidor
    if (typeof window === 'undefined') return;

    // Evita rodar múltiplas vezes no Strict Mode do React
    if ((window as any).__ANIME_CONSOLE_INITIALIZED__) return;
    (window as any).__ANIME_CONSOLE_INITIALIZED__ = true;

    // Mensagem de boas-vindas com cara de anime (Sugoi Dekai!)
    console.log(
      '%c 🌸 Anime House 🌸 %c \n\nBem-vindo ao modo de depuração, Sensei! 🎌\nPrepare-se para compilar seus sonhos.',
      'font-size: 32px; font-weight: 900; color: #fff; background: linear-gradient(90deg, #ec4899, #3b82f6); padding: 10px 20px; border-radius: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);',
      'font-size: 14px; color: #94a3b8; font-family: monospace; font-weight: bold;'
    );

    // Overriding console.error para erros "legalzinhos" (Tsundere Errors)
    const originalError = console.error;
    console.error = (...args) => {
      // Ignorar alguns warnings internos chatos do React/Next que poluem muito
      if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
        return originalError(...args);
      }

      if (typeof args[0] === 'string') {
        const message = args[0];
        const rest = args.slice(1);
        originalError(
          '%c 💢 BAKA! Ocorreu um erro: %c ' + message,
          'background: #ef4444; color: white; border-radius: 6px; font-weight: 900; padding: 4px 8px; font-size: 12px; border: 1px solid #7f1d1d;',
          'color: #ef4444; font-weight: bold; font-size: 12px;',
          ...rest
        );
      } else {
        originalError(
          '%c 💢 ERROR-CHAN encontrou um problema: ',
          'background: #ef4444; color: white; border-radius: 6px; font-weight: 900; padding: 4px 8px; font-size: 12px; border: 1px solid #7f1d1d;',
          ...args
        );
      }
    };
    
    // Overriding console.warn (Yabai!)
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (typeof args[0] === 'string') {
        const message = args[0];
        const rest = args.slice(1);
        originalWarn(
          '%c ⚠️ YABAI! Cuidado: %c ' + message,
          'background: #f59e0b; color: black; border-radius: 6px; font-weight: 900; padding: 4px 8px; font-size: 12px; border: 1px solid #78350f;',
          'color: #f59e0b; font-weight: bold; font-size: 12px;',
          ...rest
        );
      } else {
        originalWarn(
          '%c ⚠️ WARNING-CHAN avisa: ',
          'background: #f59e0b; color: black; border-radius: 6px; font-weight: 900; padding: 4px 8px; font-size: 12px; border: 1px solid #78350f;',
          ...args
        );
      }
    };
  }, []);

  return null;
}
