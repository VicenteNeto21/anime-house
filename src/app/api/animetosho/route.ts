import { NextResponse } from 'next/server';

interface ToshoItem {
  title?: string;
  magnet_uri?: string;
  total_size?: number;
  seeders?: number;
  leechers?: number;
  timestamp?: number;
  submitter?: string;
}

interface TorrentResult {
  title: string;
  magnet: string;
  size: string;
  seeders: number;
  leechers: number;
  source: string;
  date?: string;
  uploader?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Parâmetro de busca "q" é obrigatório.' }, { status: 400 });
  }

  try {
    const url = `https://feed.animetosho.org/json?q=${encodeURIComponent(q)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Falha ao buscar no AnimeTosho: ${response.status}`);
    }

    const data = (await response.json()) as ToshoItem[];
    const results: TorrentResult[] = [];

    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item.magnet_uri && item.title) {
          const bytes = item.total_size || 0;
          const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
          const i = bytes === 0 ? 0 : parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString(), 10);
          const size = Math.round(bytes / Math.pow(1024, i)) + ' ' + (sizes[i] || 'MB');

          results.push({
            title: item.title,
            magnet: item.magnet_uri,
            size,
            seeders: item.seeders || 0,
            leechers: item.leechers || 0,
            source: 'AnimeTosho',
            date: item.timestamp ? new Date(item.timestamp * 1000).toISOString() : undefined,
            uploader: item.submitter || undefined,
          });
        }
      });
    }

    return NextResponse.json({ results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar no AnimeTosho';
    console.error('Erro no scraper do AnimeTosho:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
