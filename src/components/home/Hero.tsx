"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface HeroProps {
  animes: any[];
}

export default function Hero({ animes }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % animes.slice(0, 5).length);
    }, 8000);
    return () => clearInterval(timer);
  }, [animes]);

  if (!animes || animes.length === 0) return null;

  const current = animes[currentIndex];

  return (
    <section className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden bg-slate-950">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <Image
            src={current.banner || current.poster}
            alt={current.title}
            fill
            priority
            className="object-cover opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center">
        <motion.div
          key={`content-${current.id}`}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl"
        >
          <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-500 border border-blue-600/30 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6 backdrop-blur-md">
            Destaque da Temporada
          </span>
          <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6 leading-tight drop-shadow-2xl">
            {current.title}
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed mb-10 line-clamp-3 max-w-2xl opacity-80">
            {current.description?.replace(/<[^>]*>?/gm, "")}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={`/anime/${current.id}`}
              className="h-14 px-10 bg-white text-slate-950 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:bg-blue-500 hover:text-white hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-2xl"
            >
              <i className="fa-solid fa-play"></i>
              Ver Detalhes
            </Link>
            <button className="h-14 px-8 bg-slate-900/80 backdrop-blur-xl text-white border border-white/10 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:bg-slate-800 hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
              <i className="fa-solid fa-plus"></i>
              Minha Lista
            </button>
          </div>
        </motion.div>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-10 right-10 z-20 flex gap-2">
        {animes.slice(0, 5).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 transition-all duration-500 rounded-full ${
              idx === currentIndex ? "w-8 bg-blue-500" : "w-2 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
