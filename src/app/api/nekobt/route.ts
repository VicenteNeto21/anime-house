import { NextResponse } from 'next/server';

function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Parâmetro de busca "q" é obrigatório.' }, { status: 400 });
  }

  try {
    const url = `https://nekobt.to/api/v1/torrents/search?query=${encodeURIComponent(q)}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c3IiOiIxMjc4NDAzMjI3MjY3MCIsInZlciI6MSwidHlwIjoxLCJpYXQiOjE3ODU3MjQ4MzUsImV4cCI6MTgxNzI2MDgzNX0.bLg7I7r-GEiHo9It8bwypGS9v8VFStfLaCNS_8Pn6S4'
      }
    });

    if (!response.ok) {
      throw new Error(`Falha ao buscar no NekoBT: ${response.status}`);
    }

    const json = await response.json();
    const results: any[] = [];

    if (json.data && Array.isArray(json.data.results)) {
      json.data.results.forEach((item: any) => {
        if (item.title && item.magnet) {
          results.push({
            title: item.title,
            magnet: item.magnet,
            size: formatBytes(Number(item.filesize) || 0),
            seeders: parseInt(item.seeders || '0', 10),
            leechers: parseInt(item.leechers || '0', 10),
            source: 'NekoBT',
            date: item.uploaded_at ? new Date(item.uploaded_at).toISOString() : undefined,
            uploader: item.uploader?.display_name || undefined,
            audio: item.audio_lang ? item.audio_lang.split(',').filter(Boolean) : undefined,
            subs: (item.fsub_lang || item.sub_lang) ? (item.fsub_lang || item.sub_lang).split(',').filter(Boolean) : undefined
          });
        }
      });
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Erro na API do NekoBT:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
