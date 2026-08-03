import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  const category = searchParams.get('c') || '1_0';

  if (!q) {
    return NextResponse.json({ error: 'Parâmetro de busca "q" é obrigatório.' }, { status: 400 });
  }

  try {
    // c=1_0: Categoria Anime (Todas as linguagens, permitindo achar dublados PT-BR)
    // s=seeders & o=desc: Ordenar por Seeders em ordem decrescente
    const url = `https://nyaa.si/?q=${encodeURIComponent(q)}&c=${category}&s=seeders&o=desc`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Falha ao buscar no Nyaa: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: any[] = [];

    // O Nyaa usa uma tabela com <tr> para cada torrent
    $('tr').each((index, element) => {
      // Ignora o cabeçalho da tabela
      if (index === 0) return;

      const titleNode = $(element).find('td:nth-child(2) a:not(.comments)');
      const title = titleNode.attr('title') || titleNode.text();
      
      const links = $(element).find('td:nth-child(3) a');
      let magnet = '';
      links.each((i, link) => {
        const href = $(link).attr('href');
        if (href && href.startsWith('magnet:')) {
          magnet = href;
        }
      });
      
      const size = $(element).find('td:nth-child(4)').text().trim();
      const dateText = $(element).find('td:nth-child(5)').text().trim();
      const seeders = parseInt($(element).find('td:nth-child(6)').text().trim() || '0', 10);
      const leechers = parseInt($(element).find('td:nth-child(7)').text().trim() || '0', 10);

      // Só adiciona se tiver título e magnet
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
  } catch (error: any) {
    console.error('Erro no scraper do Nyaa:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
