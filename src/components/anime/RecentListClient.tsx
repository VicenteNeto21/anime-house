'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { Anime, AniListAPI } from '@/lib/api';
import EpisodeCard from './EpisodeCard';

interface RecentListClientProps {
  initialAnimes: Anime[];
}

export default function RecentListClient({ initialAnimes }: RecentListClientProps) {
  const [animes, setAnimes] = useState<Anime[]>(initialAnimes);
  const [page, setPage] = useState(2); // Since page 1 is already loaded
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const { animes: nextAnimes, pageInfo } = await AniListAPI.getRecent(page, 20);
      if (nextAnimes && nextAnimes.length > 0) {
        setAnimes(prev => [...prev, ...nextAnimes]);
        setPage(prev => prev + 1);
        if (!pageInfo?.hasNextPage || nextAnimes.length < 20) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more recent animes", error);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {animes.map((anime, index) => (
          <EpisodeCard key={`recent-${anime.id}-${index}`} anime={anime} />
        ))}
      </div>

      {hasMore && (
        <div ref={loaderRef} className="mt-12 flex justify-center py-6">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </>
  );
}
