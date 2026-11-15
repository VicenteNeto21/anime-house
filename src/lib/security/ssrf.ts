/**
 * ANIME_HOUSE // SSRF & URL Validation Guard
 */

const PRIVATE_IP_PATTERNS = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^169\.254\.\d+\.\d+$/, // Cloud metadata (AWS, GCP, Azure, DigitalOcean)
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^\[::1\]$/,
  /^0+$/,
  /^\d+$/, // Decimal IP representation (e.g. 2130706433 = 127.0.0.1)
  /^0x[0-9a-fA-F]+$/, // Hex IP
];

export function isSafePublicUrl(urlString: string): { valid: boolean; error?: string; url?: URL } {
  try {
    const parsed = new URL(urlString);

    // Protocolo estrito
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { valid: false, error: 'Protocolo inválido. Apenas HTTP/HTTPS são permitidos.' };
    }

    // Não permitir credenciais embutidas na URL (ex: http://admin:pass@host)
    if (parsed.username || parsed.password) {
      return { valid: false, error: 'Credenciais na URL não são permitidas.' };
    }

    const hostname = parsed.hostname.toLowerCase().trim();

    // Bloqueia loopback, faixas privadas e metadados
    for (const pattern of PRIVATE_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        return { valid: false, error: 'Acesso a hosts locais ou IPs privados é estritamente proibido.' };
      }
    }

    // Bloqueia IPv6 em notação de colchetes com link-local ou loopback
    if (hostname.startsWith('[') && hostname.endsWith(']')) {
      const inner = hostname.slice(1, -1).toLowerCase();
      if (inner === '::1' || inner.startsWith('fe80:') || inner.startsWith('fc00:') || inner.startsWith('fd00:')) {
        return { valid: false, error: 'Endereço IPv6 local ou privado não permitido.' };
      }
    }

    return { valid: true, url: parsed };
  } catch {
    return { valid: false, error: 'URL malformada.' };
  }
}

export function isDomainAllowed(urlString: string, allowedSuffixes: string[]): boolean {
  const check = isSafePublicUrl(urlString);
  if (!check.valid || !check.url) return false;

  const hostname = check.url.hostname.toLowerCase();
  return allowedSuffixes.some(
    (suffix) => hostname === suffix.toLowerCase() || hostname.endsWith(`.${suffix.toLowerCase()}`)
  );
}

/**
 * Fetch seguro que impede Server-Side Request Forgery com timeout e validação de redirecionamento.
 */
export async function safeFetch(
  targetUrl: string,
  options: RequestInit = {},
  allowedSuffixes?: string[],
  timeoutMs = 8000
): Promise<Response> {
  const check = isSafePublicUrl(targetUrl);
  if (!check.valid || !check.url) {
    throw new Error(check.error || 'URL inválida');
  }

  if (allowedSuffixes && allowedSuffixes.length > 0) {
    if (!isDomainAllowed(targetUrl, allowedSuffixes)) {
      throw new Error('Domínio de destino não está na lista de permissões.');
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(targetUrl, {
      ...options,
      signal: controller.signal,
      redirect: 'manual', // Evita que um redirect 302 aponte para 169.254.169.254
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...options.headers,
      },
    });

    // Se houver redirect, valida a URL de destino antes de segui-la
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) throw new Error('Redirect sem header Location');
      const resolvedRedirect = new URL(location, targetUrl).toString();
      return safeFetch(resolvedRedirect, options, allowedSuffixes, timeoutMs);
    }

    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}
