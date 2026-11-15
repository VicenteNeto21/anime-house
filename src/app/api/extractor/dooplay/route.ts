import { NextResponse } from 'next/server';
import { isSafePublicUrl } from '@/lib/security/ssrf';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'A URL é obrigatória' },
        { status: 400 }
      );
    }

    const check = isSafePublicUrl(url);
    if (!check.valid) {
      return NextResponse.json(
        { error: check.error || 'URL inválida ou não permitida' },
        { status: 403 }
      );
    }

    // Chama o microserviço Python (extrator)
    const extractorUrl = process.env.EXTRACTOR_SERVICE_URL;
    if (!extractorUrl) {
      return NextResponse.json(
        { error: 'EXTRACTOR_SERVICE_URL não configurado no servidor' },
        { status: 503 }
      );
    }

    const response = await fetch(`${extractorUrl}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Falha ao extrair vídeo pelo microserviço', details: errorData },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    return NextResponse.json(
      { error: 'Erro ao processar a extração', details: message },
      { status: 500 }
    );
  }
}
