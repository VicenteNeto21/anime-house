'use client';

import { useState } from 'react';
import { AniListAPI } from '@/lib/api';

interface FavoriteButtonProps {
  animeId: number;
  initialIsFavourite?: boolean;
}

export default function FavoriteButton({ animeId, initialIsFavourite = false }: FavoriteButtonProps) {
  const [isFavourite, setIsFavourite] = useState(initialIsFavourite);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    const token = localStorage.getItem('anilist_token');
    if (!token) {
      alert('Faça login com o AniList para favoritar!');
      return;
    }

    setLoading(true);
    try {
      const res = await AniListAPI.toggleFavourite(animeId, token);
      if (res?.ToggleFavourite) {
        setIsFavourite(!isFavourite);
      }
    } catch (error) {
      console.error('TOGGLE_FAVOURITE_ERROR:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all active:scale-90 ${
        isFavourite 
          ? 'bg-red-500 text-white' 
          : 'bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md'
      }`}
      title={isFavourite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
    >
      <i className={`fa-solid fa-heart ${isFavourite ? 'animate-heartbeat' : ''} ${loading ? 'opacity-50' : ''}`}></i>
    </button>
  );
}
