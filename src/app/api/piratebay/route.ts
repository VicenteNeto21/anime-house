import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://apibay.org/q.php?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error('Falha ao acessar PirateBay');
    
    const data = await res.json();
    
    if (!Array.isArray(data) || (data.length === 1 && data[0].id === '0')) {
      return NextResponse.json({ results: [] });
    }

    const results = data.map((item: any) => {
      // Build magnet link
      const magnet = `magnet:?xt=urn:btih:${item.info_hash}&dn=${encodeURIComponent(item.name)}&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce`;
      
      const sizeBytes = parseInt(item.size);
      let sizeFormatted = '0 B';
      if (sizeBytes > 0) {
        const i = Math.floor(Math.log(sizeBytes) / Math.log(1024));
        sizeFormatted = (sizeBytes / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
      }

      return {
        title: item.name,
        magnet: magnet,
        size: sizeFormatted,
        seeders: parseInt(item.seeders) || 0,
        leechers: parseInt(item.leechers) || 0,
        source: 'PirateBay',
        uploader: item.username,
        date: new Date(parseInt(item.added) * 1000).toLocaleDateString('pt-BR'),
      };
    });

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, results: [] });
  }
}
