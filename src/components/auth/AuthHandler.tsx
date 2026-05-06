'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      // Evita interferir com o callback do NextAuth
      if (window.location.pathname.includes('/api/auth/callback')) return;

      console.log('🔄 AuthHandler: Trocando código por token AniList...');
      
      // Chama nossa API interna para fazer a troca segura
      fetch('/api/auth/anilist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      .then(res => res.json())
      .then(data => {
        if (data.access_token) {
          localStorage.setItem('anilist_token', data.access_token);
          localStorage.removeItem('anilist_user_id'); // Garantir que pegamos o ID novo
          
          if (data.expires_in) {
            const expiryDate = new Date().getTime() + data.expires_in * 1000;
            localStorage.setItem('anilist_token_expiry', expiryDate.toString());
          }

          console.log('✅ Login AniList realizado com sucesso!');
          
          // Limpa a URL e recarrega
          router.push('/');
          window.location.href = '/'; // Forçar recarregamento para atualizar Navbar
        } else {
          console.error('❌ Falha no login:', data.error);
        }
      })
      .catch(err => {
        console.error('❌ Erro na autenticação:', err);
      });
    }
  }, [searchParams, router]);

  return null;
}
