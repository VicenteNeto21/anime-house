import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://www.tokyotoshokan.info/search.php?terms=${encodeURIComponent(q)}&type=1`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!res.ok) throw new Error('Falha ao acessar TokyoToshokan');
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const results: any[] = [];
    
    $('.listing tr.category_0, .listing tr.category_1').each((i, el) => {
      const a = $(el).find('.desc-top a').first();
      const title = a.text();
      const magnet = $(el).find('a[href^="magnet:"]').attr('href');
      const statsText = $(el).next('.stats').text();
      
      const sizeMatch = statsText.match(/Size:\s*([^|]+)/i);
      const size = sizeMatch ? sizeMatch[1].trim() : '0 B';
      
      const seedersMatch = statsText.match(/Seeders:\s*(\d+)/i);
      const seeders = seedersMatch ? parseInt(seedersMatch[1]) : 0;

      const leechersMatch = statsText.match(/Leechers:\s*(\d+)/i);
      const leechers = leechersMatch ? parseInt(leechersMatch[1]) : 0;
      
      const dateMatch = statsText.match(/Date:\s*([^|]+)/i);
      let dateFormatted = '';
      if (dateMatch) {
         dateFormatted = dateMatch[1].trim().split(' ')[0];
      }

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
  } catch (error: any) {
    return NextResponse.json({ error: error.message, results: [] });
  }
}
