import { NextResponse } from 'next/server';

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
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Falha ao buscar no AnimeTosho: ${response.status}`);
    }

    const data = await response.json();
    const results: any[] = [];

    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        if (item.magnet_uri && item.title) {
          // Converte bytes para formato legível
          const bytes = item.total_size || 0;
          const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
          const i = bytes === 0 ? 0 : parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
          const size = Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];

          results.push({
            title: item.title,
            magnet: item.magnet_uri,
            size: size,
            seeders: item.seeders || 0,
            leechers: item.leechers || 0,
            source: 'AnimeTosho',
            date: item.timestamp ? new Date(item.timestamp * 1000).toISOString() : undefined,
            uploader: item.submitter || undefined
          });
        }
      });
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Erro no scraper do AnimeTosho:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
