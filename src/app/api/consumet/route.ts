import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id'); // anilist id
  const ep = searchParams.get('ep'); // episode number

  if (!id || !ep) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    // 1. Fetch anime info to get the episode ID
    const infoRes = await fetch(`https://api.consumet.org/meta/anilist/info/${id}?provider=gogoanime`);
    if (!infoRes.ok) throw new Error('Failed to fetch info');
    const info = await infoRes.json();
    
    // Find the episode
    const episode = info.episodes?.find((e: any) => e.number === Number(ep));
    if (!episode) throw new Error('Episode not found');

    // 2. Fetch the streaming links
    const watchRes = await fetch(`https://api.consumet.org/meta/anilist/watch/${episode.id}?provider=gogoanime`);
    if (!watchRes.ok) throw new Error('Failed to fetch stream');
    const watchData = await watchRes.json();

    // Find the best quality or auto (default to highest or auto m3u8)
    const source = watchData.sources?.find((s: any) => s.quality === 'auto' || s.quality === '1080p') || watchData.sources?.[0];
    
    if (source && source.url) {
      return NextResponse.json({ url: source.url });
    }
    
    return NextResponse.json({ error: 'No stream found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
