'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const clientId = process.env.NEXT_PUBLIC_ANILIST_CLIENT_ID || '10978';
  const redirectUri = process.env.NEXT_PUBLIC_ANILIST_REDIRECT_URL || 'http://localhost:3000';
  const anilistAuthUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
  
  useEffect(() => {
    console.log('--- OAuth Debug Info ---');
    console.log('AniList Client ID:', clientId);
    console.log('AniList Redirect URI:', redirectUri);
    console.log('AniList Auth URL:', anilistAuthUrl);
    console.log('NextAuth URL:', process.env.NEXTAUTH_URL);
    console.log('Current Origin:', window.location.origin);
    console.log('------------------------');

    if (redirectUri !== window.location.origin && !window.location.origin.includes('localhost')) {
      console.warn('⚠️ Alerta: O Redirect URI no .env não coincide com a URL atual!');
    }
  }, [clientId, redirectUri, anilistAuthUrl]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#05080f]">
      {/* Background Animated Image */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.25 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 z-0"
      >
        <img
          src="https://wallpapercave.com/wp/wp12036735.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05080f] via-[#05080f]/90 to-transparent" />
      </motion.div>

      <div className="w-full max-w-lg z-10">
        {/* Logo/Brand */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <Link href="/" className="inline-block">
            <h1 className="text-5xl font-black tracking-tighter uppercase text-white group">
              Anime<span className="text-blue-500 group-hover:text-blue-400 transition-colors">House</span>
            </h1>
          </Link>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-4">Sua conta, sua maratona, seu mundo</p>
        </motion.div>

        {/* Login Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden"
        >
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold text-white mb-2">Seja Bem-vindo!</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Não utilizamos senhas tradicionais. <br />
              Conecte-se com sua rede favorita para sincronizar seu progresso automaticamente.
            </p>
          </div>

          <div className="space-y-4">
            {/* Google Button */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full flex items-center justify-between px-8 py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl hover:shadow-white/10 group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <i className="fa-brands fa-google text-lg text-[#DB4437]"></i>
                <span>Continuar com Google</span>
              </div>
              <i className="fa-solid fa-right-to-bracket opacity-30 group-hover:opacity-100 transition-opacity"></i>
            </motion.button>

            {/* AniList Button */}
            <motion.a 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={anilistAuthUrl}
              className="w-full flex items-center justify-between px-8 py-5 bg-[#3b82f6] text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl hover:shadow-blue-600/20 group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <i className="fa-solid fa-circle-dot text-lg"></i>
                <span>Entrar com AniList</span>
              </div>
              <i className="fa-solid fa-right-to-bracket opacity-30 group-hover:opacity-100 transition-opacity"></i>
            </motion.a>

            {/* Discord Placeholder */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-between px-8 py-5 bg-[#5865F2]/10 border border-[#5865F2]/20 text-[#5865F2] rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:bg-[#5865F2]/20 group cursor-not-allowed opacity-50"
            >
              <div className="flex items-center gap-4">
                <i className="fa-brands fa-discord text-lg"></i>
                <span>Discord (Em breve)</span>
              </div>
              <i className="fa-solid fa-shield-halved opacity-30"></i>
            </motion.button>
          </div>

          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col gap-4">
            <div className="flex items-center gap-4 text-slate-500">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-sync text-[10px]"></i>
              </div>
              <p className="text-[10px] font-bold leading-tight">Sincronize seu progresso do AniList em tempo real enquanto assiste.</p>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-shield-halved text-[10px]"></i>
              </div>
              <p className="text-[10px] font-bold leading-tight">Conexão segura via OAuth. Nunca teremos acesso à sua senha original.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
