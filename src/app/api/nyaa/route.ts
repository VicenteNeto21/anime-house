import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface NyaaResult {
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
  const category = searchParams.get('c') || '1_0';

  if (!q) {
    return NextResponse.json({ error: 'Parâmetro de busca "q" é obrigatório.' }, { status: 400 });
  }

  if (q.length > 200) {
    return NextResponse.json({ error: 'Termo de busca muito longo.' }, { status: 400 });
  }

  const sanitizedCategory = /^\d_\d$/.test(category) ? category : '1_0';

  try {
    const url = `https://nyaa.si/?q=${encodeURIComponent(q)}&c=${sanitizedCategory}&s=seeders&o=desc`;
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Falha ao buscar no Nyaa: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: NyaaResult[] = [];

    $('tr').each((index, element) => {
      if (index === 0) return;

      const titleNode = $(element).find('td:nth-child(2) a:not(.comments)');
      const title = titleNode.attr('title') || titleNode.text();

      const links = $(element).find('td:nth-child(3) a');
      let magnet = '';
      links.each((_, link) => {
        const href = $(link).attr('href');
        if (href && href.startsWith('magnet:')) {
          magnet = href;
        }
      });

      const size = $(element).find('td:nth-child(4)').text().trim();
      const dateText = $(element).find('td:nth-child(5)').text().trim();
      const seeders = parseInt($(element).find('td:nth-child(6)').text().trim() || '0', 10);
      const leechers = parseInt($(element).find('td:nth-child(7)').text().trim() || '0', 10);

      if (magnet && title) {
        results.push({
          title: title.trim(),
          magnet,
          size,
          seeders,
          leechers,
          source: 'Nyaa',
          date: dateText || undefined,
        });
      }
    });

    return NextResponse.json({ results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro no scraper do Nyaa';
    console.error('Erro no scraper do Nyaa:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
