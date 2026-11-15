import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

// Configurações de capacidade e taxa de reabastecimento (tokens/segundo)
const RATE_LIMIT_RULES: { pattern: RegExp; capacity: number; refillRate: number }[] = [
  // Scrapers pesados de player/stream: 15 req/min
  { pattern: /^\/api\/extractor\//, capacity: 15, refillRate: 15 / 60 },
  // Scrapers de torrent externos (Nyaa, Toshokan, PirateBay, NekoBT): 30 req/min
  { pattern: /^\/api\/(nyaa|animetosho|tokyotoshokan|piratebay|nekobt)/, capacity: 30, refillRate: 30 / 60 },
  // APIs gerais (busca, detalhes, tradução): 60 req/min
  { pattern: /^\/api\//, capacity: 60, refillRate: 60 / 60 },
];

const ipBuckets = new Map<string, TokenBucket>();
const MAX_ENTRIES = 10_000;
let lastCleanup = Date.now();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const ip = forwarded.split(',')[0].trim();
    if (ip) return ip;
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

function checkRateLimit(ip: string, pathname: string): { allowed: boolean; remaining: number; capacity: number } {
  const rule = RATE_LIMIT_RULES.find(r => r.pattern.test(pathname)) || RATE_LIMIT_RULES[RATE_LIMIT_RULES.length - 1];
  const key = `${ip}:${rule.pattern.source}`;
  const now = Date.now();

  // Limpeza de cache a cada 2 minutos ou se exceder tamanho máximo
  if (now - lastCleanup > 120_000 || ipBuckets.size > MAX_ENTRIES) {
    for (const [k, bucket] of ipBuckets.entries()) {
      if (now - bucket.lastRefill > 120_000) {
        ipBuckets.delete(k);
      }
    }
    lastCleanup = now;
  }

  let bucket = ipBuckets.get(key);
  if (!bucket) {
    bucket = { tokens: rule.capacity, lastRefill: now };
    ipBuckets.set(key, bucket);
  } else {
    // Reabastece tokens proporcionais ao tempo decorrido
    const elapsedSeconds = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(rule.capacity, bucket.tokens + elapsedSeconds * rule.refillRate);
    bucket.lastRefill = now;
  }

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { allowed: true, remaining: Math.floor(bucket.tokens), capacity: rule.capacity };
  }

  return { allowed: false, remaining: 0, capacity: rule.capacity };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar autenticação NextAuth para não interromper fluxo de login
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  const clientIp = getClientIp(request);
  const { allowed, remaining, capacity } = checkRateLimit(clientIp, pathname);

  if (!allowed) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: 'Taxa limite de requisições excedida. Por favor, aguarde alguns segundos.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
          'X-RateLimit-Limit': capacity.toString(),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', capacity.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
