import { NextResponse } from 'next/server';
import { safeFetch } from '@/lib/security/ssrf';

const ALLOWED_BLOGGER_DOMAINS = [
  'blogger.com',
  'googleusercontent.com',
  'google.com',
  'bp.blogspot.com',
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const res = await safeFetch(url, {}, ALLOWED_BLOGGER_DOMAINS, 8000);

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream error: ${res.status}` }, { status: 502 });
    }

    const html = await res.text();
    const match = html.match(/"play_url"\:"(.*?)"/);

    if (match && match[1]) {
      return NextResponse.json({ url: match[1] });
    }

    return NextResponse.json({ error: 'No play_url found' }, { status: 404 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
