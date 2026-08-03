import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    // Retornamos 200 com array vazio para evitar o erro 500 vermelho feio no console do navegador
    return NextResponse.json({ results: [], error: 'TMDB_API_KEY_MISSING' });
  }

  const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=pt-BR`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 86400 } // Cache results for 24h
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('TMDB_PROXY_ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch from TMDB' }, { status: 500 });
  }
}
