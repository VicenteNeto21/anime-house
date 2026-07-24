import { NextResponse } from 'next/server';

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

    // Chama o microserviço Python (extrator)
    // Em producao usar process.env.EXTRACTOR_SERVICE_URL
    const extractorUrl = process.env.EXTRACTOR_SERVICE_URL || 'http://localhost:8000';
    
    console.log(`[Extrator DooPlay] Chamando microserviço para: ${url}`);
    
    const response = await fetch(`${extractorUrl}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Extrator DooPlay] Erro do microserviço:', errorData);
      return NextResponse.json(
        { error: 'Falha ao extrair vídeo pelo microserviço', details: errorData },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('[Extrator DooPlay] Erro fatal:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar a extração' },
      { status: 500 }
    );
  }
}
