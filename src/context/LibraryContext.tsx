'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AniListAPI } from '@/lib/api';

interface LibraryItem {
  id: number;
  status: string;
  progress: number;
}

interface LibraryContextType {
  library: LibraryItem[];
  loading: boolean;
  refreshLibrary: () => Promise<void>;
  isInLibrary: (animeId: number) => LibraryItem | undefined;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshLibrary = useCallback(async (forceRefresh = false) => {
    const token = localStorage.getItem('anilist_token');
    if (!token) {
      setLibrary([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Verificar se já temos o ID do usuário em cache para evitar chamadas extras
      let userId = localStorage.getItem('anilist_user_id');
      
      if (!userId) {
        const userRes = await AniListAPI.getCurrentUser(token);
        userId = userRes?.Viewer?.id?.toString() || null;
        if (userId) localStorage.setItem('anilist_user_id', userId);
      }

      if (!userId) {
        console.warn('LIBRARY_SYNC: Usuário não identificado');
        setLoading(false);
        return;
      }

      // 2. Busca a coleção com o ID
      const gql = `
        query ($userId: Int) {
          MediaListCollection(userId: $userId, type: ANIME, status_in: [CURRENT, PLANNING, COMPLETED, REPEATING, PAUSED, DROPPED], chunk: 1, perChunk: 500) {
            lists {
              entries {
                mediaId
                status
                progress
              }
            }
          }
        }
      `;
      
      const data = await AniListAPI.query(gql, { userId: parseInt(userId) }, token, forceRefresh);
      const allEntries: LibraryItem[] = [];
      
      if (data?.MediaListCollection?.lists) {
        data.MediaListCollection.lists.forEach((list: any) => {
          list.entries?.forEach((entry: any) => {
            allEntries.push({
              id: entry.mediaId,
              status: entry.status,
              progress: entry.progress
            });
          });
        });
      }

      setLibrary(allEntries);
    } catch (error) {
      console.error('LIBRARY_SYNC_ERROR:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLibrary(false); // Carga inicial usa cache
    
    // Debounce no sync para evitar múltiplas chamadas rápidas
    let syncTimeout: NodeJS.Timeout;
    const handleSync = () => {
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => refreshLibrary(true), 500);
    };
    window.addEventListener('anilist-sync', handleSync);
    return () => {
      window.removeEventListener('anilist-sync', handleSync);
      clearTimeout(syncTimeout);
    };
  }, [refreshLibrary]);

  const isInLibrary = (animeId: number | string) => {
    return library.find(item => Number(item.id) === Number(animeId));
  };

  return (
    <LibraryContext.Provider value={{ library, loading, refreshLibrary, isInLibrary }}>
      {children}
    </LibraryContext.Provider>
  );
}

// Valores padrão seguros para quando o Provider não está disponível (ex: SSR, pre-hydration)
const defaultLibrary: LibraryContextType = {
  library: [],
  loading: false,
  refreshLibrary: async () => {},
  isInLibrary: () => undefined,
};

export function useLibrary() {
  const context = useContext(LibraryContext);
  // Retorna defaults seguros em vez de explodir — componentes como AnimeCard
  // podem ser renderizados antes do Provider montar durante SSR/hydration
  return context ?? defaultLibrary;
}
