'use client';

import { useState } from 'react';
import { AniListAPI } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  animeId: number;
  initialIsFavourite?: boolean;
}

export default function FavoriteButton({ animeId, initialIsFavourite = false }: FavoriteButtonProps) {
  const [isFavourite, setIsFavourite] = useState(initialIsFavourite);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  async function handleToggle() {
    const token = (session as { accessToken?: string })?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem('anilist_token') : null);
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
      className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all active:scale-90 cursor-pointer ${
        isFavourite 
          ? 'bg-red-500 text-white' 
          : 'bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md'
      }`}
      title={isFavourite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
      aria-label={isFavourite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
    >
      <Heart
        className={`w-5 h-5 transition-transform ${
          isFavourite ? 'fill-white text-white scale-110' : 'text-white'
        } ${loading ? 'opacity-50 animate-pulse' : ''}`}
      />
    </button>
  );
}
