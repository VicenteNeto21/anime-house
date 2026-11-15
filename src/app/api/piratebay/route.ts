import { NextResponse } from 'next/server';

interface PirateBayItem {
  id?: string;
  name?: string;
  info_hash?: string;
  size?: string;
  seeders?: string;
  leechers?: string;
  username?: string;
  added?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  if (q.length > 200) {
    return NextResponse.json({ error: 'Termo de busca muito longo.' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://apibay.org/q.php?q=${encodeURIComponent(q)}`, {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ results: [], error: 'Falha ao acessar PirateBay' }, { status: 502 });
    }

    const data = (await res.json()) as PirateBayItem[];

    if (!Array.isArray(data) || (data.length === 1 && data[0].id === '0')) {
      return NextResponse.json({ results: [] });
    }

    const results = data.map((item) => {
      const magnet = item.info_hash
        ? `magnet:?xt=urn:btih:${item.info_hash}&dn=${encodeURIComponent(item.name || '')}&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce`
        : '';

      const sizeBytes = parseInt(item.size || '0', 10);
      let sizeFormatted = '0 B';
      if (sizeBytes > 0) {
        const i = Math.floor(Math.log(sizeBytes) / Math.log(1024));
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        sizeFormatted = `${(sizeBytes / Math.pow(1024, i)).toFixed(2)} ${units[i] || 'MB'}`;
      }

      return {
        title: item.name || 'Sem título',
        magnet,
        size: sizeFormatted,
        seeders: parseInt(item.seeders || '0', 10) || 0,
        leechers: parseInt(item.leechers || '0', 10) || 0,
        source: 'PirateBay',
        uploader: item.username || undefined,
        date: item.added ? new Date(parseInt(item.added, 10) * 1000).toLocaleDateString('pt-BR') : undefined,
      };
    }).filter((r) => r.magnet);

    return NextResponse.json({ results });
  } catch (error: unknown) {
    console.error('PirateBay error:', error);
    return NextResponse.json({ error: 'Erro ao consultar PirateBay', results: [] }, { status: 500 });
  }
}
