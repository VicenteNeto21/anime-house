'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_ANILIST_CLIENT_ID || '10978';
  const redirectUri = process.env.NEXT_PUBLIC_ANILIST_REDIRECT_URL || 'http://localhost:3000';
  const anilistAuthUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Background Anime Image - Usando img padrão para evitar bloqueio de domínio */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-594696001557.jpg"
          alt="Background"
          className="w-full h-full object-cover opacity-20 blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
      </div>

      <div className="w-full max-w-md z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-black tracking-tighter uppercase text-white group">
              Anime<span className="text-blue-500 group-hover:text-blue-400 transition-colors">House</span>
            </h1>
          </Link>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Sua casa, sua conta, seu anime</p>
        </div>

        {/* Login Card - TOTALMENTE FLAT */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden">
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Endereço de Email</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm"></i>
                <input
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Senha de Acesso</label>
                <Link href="#" className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400">Esqueceu?</Link>
              </div>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-12 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors cursor-pointer"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              Entrar na Conta
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[9px] uppercase font-black">
              <span className="bg-slate-900 px-4 text-slate-600">Ou use sua rede social</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-1 gap-3">
            <a 
              href={anilistAuthUrl}
              className="flex items-center justify-center gap-3 py-3.5 bg-[#3b82f6] border border-white/10 rounded-2xl text-white hover:bg-blue-500 transition-all group cursor-pointer"
            >
              <i className="fa-solid fa-circle-dot text-sm"></i>
              <span className="text-[10px] font-black uppercase tracking-widest">Entrar com AniList</span>
            </a>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-3 py-3.5 bg-slate-950 border border-white/5 rounded-2xl text-white hover:bg-white hover:text-black transition-all group cursor-pointer">
                <i className="fa-brands fa-google text-sm"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 py-3.5 bg-slate-950 border border-white/5 rounded-2xl text-white hover:bg-[#5865F2] transition-all group cursor-pointer">
                <i className="fa-brands fa-discord text-sm"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">Discord</span>
              </button>
            </div>
          </div>

          <p className="text-center mt-8 text-[11px] font-bold text-slate-500">
            Não tem uma conta? <Link href="#" className="text-blue-500 hover:text-blue-400 cursor-pointer">Cadastre-se</Link>
          </p>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">
            Anime House © 2026 • Todos os direitos reservados
          </p>
        </div>
      </div>
    </main>
  );
}
