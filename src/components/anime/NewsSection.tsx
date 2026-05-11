import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NewsAPI } from '@/lib/api';

export default async function NewsSection() {
  const { news } = await NewsAPI.getLatestNews(1, 4);

  if (!news || news.length === 0) return null;

  return (
    <section className="container mx-auto px-4 lg:px-8 mt-12 mb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest">
            Portal de Notícias
          </h2>
        </div>
        <Link 
          href="/noticias" 
          className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 group"
        >
          Ver Todas <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {news.slice(0, 4).map((item) => (
          <a 
            key={item.id} 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex flex-col bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all shadow-xl hover:shadow-blue-500/5"
          >
            <div className="relative aspect-video overflow-hidden">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest text-white shadow-lg">
                {item.category}
              </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                {item.date}
              </span>
              <h3 className="text-sm md:text-base font-black text-white leading-tight mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-4 flex-grow">
                {item.excerpt}
              </p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 text-[9px] font-black text-blue-500 uppercase tracking-widest">
                <span>Ler Matéria</span>
                <i className="fa-solid fa-chevron-right"></i>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
