import { NextResponse } from 'next/server';

interface ConsumetEpisode {
  id: string;
  number: number;
}

interface ConsumetSource {
  url?: string;
  quality?: string;
}

interface ConsumetWatchData {
  sources?: ConsumetSource[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const ep = searchParams.get('ep');

  if (!id || !ep) {
    return NextResponse.json({ error: 'Parâmetros "id" e "ep" são obrigatórios' }, { status: 400 });
  }

  // Validação estrita: apenas dígitos numéricos
  if (!/^\d+$/.test(id) || !/^\d+$/.test(ep)) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
  }

  try {
    const infoRes = await fetch(
      `https://api.consumet.org/meta/anilist/info/${encodeURIComponent(id)}?provider=gogoanime`,
      {
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 3600 },
      }
    );

    if (!infoRes.ok) {
      return NextResponse.json({ error: 'Episódio não localizado no provedor' }, { status: 404 });
    }

    const info = await infoRes.json();
    const episode = info?.episodes?.find((e: ConsumetEpisode) => e.number === Number(ep));
    if (!episode?.id) {
      return NextResponse.json({ error: 'Episódio não encontrado' }, { status: 404 });
    }

    const watchRes = await fetch(
      `https://api.consumet.org/meta/anilist/watch/${encodeURIComponent(episode.id)}?provider=gogoanime`,
      {
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!watchRes.ok) {
      return NextResponse.json({ error: 'Falha ao obter streaming' }, { status: 502 });
    }

    const watchData = (await watchRes.json()) as ConsumetWatchData;
    const source =
      watchData.sources?.find((s) => s.quality === 'auto' || s.quality === '1080p') ||
      watchData.sources?.[0];

    if (source?.url) {
      return NextResponse.json({ url: source.url });
    }

    return NextResponse.json({ error: 'Nenhuma fonte de vídeo encontrada' }, { status: 404 });
  } catch (error: unknown) {
    console.error('Consumet route error:', error);
    return NextResponse.json({ error: 'Erro interno ao consultar stream' }, { status: 500 });
  }
}
