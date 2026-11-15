import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');

  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  // Limite razoável para evitar abuso
  if (text.length > 5000) {
    return NextResponse.json({ error: 'Text exceeds maximum length of 5000 characters' }, { status: 413 });
  }

  try {
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q=${encodeURIComponent(cleanText)}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 86400 }, // Cache tradução por 24h
    });

    if (!response.ok) {
      throw new Error(`Google Translate API returned an error: ${response.status}`);
    }

    const data = (await response.json()) as Array<Array<[string]>>;
    const translatedText = Array.isArray(data?.[0])
      ? data[0].map((item) => item[0] || '').join('')
      : '';

    return NextResponse.json({ translatedText });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Translation failed';
    console.error('Translation Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
