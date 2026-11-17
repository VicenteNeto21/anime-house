import { NextResponse } from 'next/server';
import { EmbedPlayAPI } from '@/lib/embeds';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tmdb = searchParams.get('tmdb');
  const sea = parseInt(searchParams.get('sea') || '1', 10);
  const epi = parseInt(searchParams.get('epi') || '1', 10);
  const type = (searchParams.get('type') || 'tv') as 'movie' | 'tv';

  if (!tmdb) {
    return NextResponse.json({ error: 'Parâmetro "tmdb" é obrigatório.' }, { status: 400 });
  }

  try {
    const isAvailable = await EmbedPlayAPI.checkAvailability(tmdb, sea, epi, type);
    return NextResponse.json({
      tmdb,
      season: sea,
      episode: epi,
      type,
      available: isAvailable,
      embedUrl:
        type === 'movie'
          ? EmbedPlayAPI.getMovieUrl(tmdb)
          : EmbedPlayAPI.getEpisodeUrl(tmdb, sea, epi),
    });
  } catch (error) {
    console.error('EmbedPlay Status API Error:', error);
    return NextResponse.json({ error: 'Falha ao consultar disponibilidade.' }, { status: 500 });
  }
}
