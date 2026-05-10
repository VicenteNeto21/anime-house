import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    const response = await fetch('https://anilist.co/api/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.NEXT_PUBLIC_ANILIST_CLIENT_ID || '10978',
        client_secret: process.env.ANILIST_CLIENT_SECRET || '',
        redirect_uri: process.env.NEXT_PUBLIC_ANILIST_REDIRECT_URL || 'http://localhost:3000',
        code: code,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('❌ AniList OAuth Error:', {
        status: response.status,
        error: data.error,
        description: data.error_description || data.message,
        receivedCode: code?.substring(0, 5) + '...',
        redirectUriSent: process.env.NEXT_PUBLIC_ANILIST_REDIRECT_URL
      });
      
      return NextResponse.json({ 
        error: data.error_description || data.message || 'Falha na troca do token com AniList',
        details: data
      }, { status: response.status || 400 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Internal Auth Error:', error);
    return NextResponse.json({ 
      error: 'Erro interno ao processar login',
      message: error.message 
    }, { status: 500 });
  }
}
