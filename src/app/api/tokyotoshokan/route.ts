import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface TokyoResult {
  title: string;
  magnet: string;
  size: string;
  seeders: number;
  leechers: number;
  source: string;
  date?: string;
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
    const res = await fetch(`https://www.tokyotoshokan.info/search.php?terms=${encodeURIComponent(q)}&type=1`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Falha ao acessar TokyoToshokan', results: [] }, { status: 502 });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const results: TokyoResult[] = [];

    $('.listing tr.category_0, .listing tr.category_1').each((_, el) => {
      const a = $(el).find('.desc-top a').first();
      const title = a.text().trim();
      const magnet = $(el).find('a[href^="magnet:"]').attr('href');
      const statsText = $(el).next('.stats').text();

      const sizeMatch = statsText.match(/Size:\s*([^|]+)/i);
      const size = sizeMatch ? sizeMatch[1].trim() : '0 B';

      const seedersMatch = statsText.match(/Seeders:\s*(\d+)/i);
      const seeders = seedersMatch ? parseInt(seedersMatch[1], 10) : 0;

      const leechersMatch = statsText.match(/Leechers:\s*(\d+)/i);
      const leechers = leechersMatch ? parseInt(leechersMatch[1], 10) : 0;

      const dateMatch = statsText.match(/Date:\s*([^|]+)/i);
      const dateFormatted = dateMatch ? dateMatch[1].trim().split(' ')[0] : undefined;

      if (title && magnet) {
        results.push({
          title,
          magnet,
          size,
          seeders,
          leechers,
          source: 'TokyoToshokan',
          date: dateFormatted,
        });
      }
    });

    return NextResponse.json({ results });
  } catch (error: unknown) {
    console.error('TokyoToshokan error:', error);
    return NextResponse.json({ error: 'Erro ao consultar TokyoToshokan', results: [] }, { status: 500 });
  }
}
