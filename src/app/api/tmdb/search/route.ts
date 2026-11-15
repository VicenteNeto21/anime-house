import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  // Prioriza a chave de servidor segura TMDB_API_KEY para não vazar quotas
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ results: [], error: 'TMDB_API_KEY_MISSING' });
  }

  const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=pt-BR`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 86400 }, // Cache results for 24h
      signal: AbortSignal.timeout(8000),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('TMDB_PROXY_ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch from TMDB' }, { status: 500 });
  }
}
