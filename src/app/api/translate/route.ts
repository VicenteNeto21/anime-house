import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');

  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  try {
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q=${encodeURIComponent(cleanText)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    const translatedText = data[0].map((item: any) => item[0]).join('');

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Translation Error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
