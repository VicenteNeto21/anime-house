'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { LogIn, ShieldCheck, RefreshCw } from 'lucide-react';

export default function LoginPage() {
  const clientId = process.env.NEXT_PUBLIC_ANILIST_CLIENT_ID || '10978';
  const redirectUri = process.env.NEXT_PUBLIC_ANILIST_REDIRECT_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');


  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#05080f]">
      {/* Background Animated Image */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.25 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="https://wallpapercave.com/wp/wp12036735.jpg"
          alt="Background"
          fill
          priority
          unoptimized
          className="object-cover"
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
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continuar com Google</span>
              </div>
              <LogIn className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
            </motion.button>

            {/* AniList Button */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => signIn('anilist', { callbackUrl: '/' })}
              className="w-full flex items-center justify-between px-8 py-5 bg-[#3b82f6] text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl hover:shadow-blue-600/20 group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <Image src="https://anilist.co/img/icons/icon.svg" className="w-5 h-5" alt="AniList" width={20} height={20} />
                <span>Entrar com AniList</span>
              </div>
              <LogIn className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
            </motion.button>

            {/* Discord Placeholder */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-between px-8 py-5 bg-[#5865F2]/10 border border-[#5865F2]/20 text-[#5865F2] rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:bg-[#5865F2]/20 group cursor-not-allowed opacity-50"
            >
              <div className="flex items-center gap-4">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.86,53,48.81,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                </svg>
                <span>Discord (Em breve)</span>
              </div>
              <ShieldCheck className="w-4 h-4 opacity-30" />
            </motion.button>
          </div>

          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col gap-4">
            <div className="flex items-center gap-4 text-slate-500">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-[10px] font-bold leading-tight">Sincronize seu progresso do AniList em tempo real enquanto assiste.</p>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-[10px] font-bold leading-tight">Conexão segura via OAuth. Nunca teremos acesso à sua senha original.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
