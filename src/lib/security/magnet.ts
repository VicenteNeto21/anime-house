/**
 * Anime House - Magnet URI Security Validator & Sanitizer
 * Previne injeção de esquemas maliciosos (javascript:, data:),
 * valida a presença de BTIH/BTMH válido e sanitiza parâmetros de rastreamento.
 */

const BTIH_HEX_REGEX = /^[a-fA-F0-9]{40}$/;
const BTIH_B32_REGEX = /^[2-7a-zA-Z]{32}$/;
const BTMH_REGEX = /^urn:btmh:1220[a-fA-F0-9]{64}$/;

/**
 * Valida rigorosamente se a string fornecida é uma URI magnet segura.
 */
export function isValidMagnetUri(uri: unknown): uri is string {
  if (typeof uri !== 'string') return false;

  const trimmed = uri.trim();
  if (!trimmed.toLowerCase().startsWith('magnet:?')) {
    return false;
  }

  // Previne caracteres de controle e esquemas aninhados perigosos
  if (/[\x00-\x1F\x7F<>"'`]/g.test(trimmed)) {
    return false;
  }

  try {
    // Analisa a query string do magnet após 'magnet:?'
    const query = trimmed.slice(8);
    const searchParams = new URLSearchParams(query);
    const xtList = searchParams.getAll('xt');

    if (xtList.length === 0) return false;

    // Pelo menos um xt deve corresponder a um hash válido de BitTorrent (v1 BTIH ou v2 BTMH)
    const hasValidHash = xtList.some(xt => {
      const lower = xt.toLowerCase();
      if (lower.startsWith('urn:btih:')) {
        const hash = xt.slice(9);
        return BTIH_HEX_REGEX.test(hash) || BTIH_B32_REGEX.test(hash);
      }
      if (lower.startsWith('urn:btmh:')) {
        return BTMH_REGEX.test(lower);
      }
      return false;
    });

    return hasValidHash;
  } catch {
    return false;
  }
}

/**
 * Sanitiza e normaliza uma URI magnet, reconstruindo com apenas parâmetros permitidos
 * (xt, tr, dn, xl) e descartando parâmetros suspeitos.
 */
export function sanitizeMagnetUri(uri: unknown): string | null {
  if (!isValidMagnetUri(uri)) {
    return null;
  }

  try {
    const trimmed = uri.trim();
    const query = trimmed.slice(8);
    const params = new URLSearchParams(query);
    const safeParams = new URLSearchParams();

    // 1. Manter xt válidos
    params.getAll('xt').forEach(xt => {
      const lower = xt.toLowerCase();
      if (
        (lower.startsWith('urn:btih:') && (BTIH_HEX_REGEX.test(xt.slice(9)) || BTIH_B32_REGEX.test(xt.slice(9)))) ||
        (lower.startsWith('urn:btmh:') && BTMH_REGEX.test(lower))
      ) {
        safeParams.append('xt', xt);
      }
    });

    // 2. Display Name (dn) sanitizado (máximo 200 caracteres, sem quebras)
    const dn = params.get('dn');
    if (dn) {
      const cleanDn = dn.replace(/[<>'"`;\r\n]/g, '').trim().slice(0, 200);
      if (cleanDn) {
        safeParams.set('dn', cleanDn);
      }
    }

    // 3. Trackers (tr) seguros: somente udp, http, https ou wss
    params.getAll('tr').forEach(tr => {
      try {
        const trUrl = new URL(tr);
        if (['udp:', 'http:', 'https:', 'wss:'].includes(trUrl.protocol)) {
          safeParams.append('tr', tr);
        }
      } catch {
        // Ignora trackers com URL malformada
      }
    });

    // 4. Exact length (xl) apenas números
    const xl = params.get('xl');
    if (xl && /^\d+$/.test(xl)) {
      safeParams.set('xl', xl);
    }

    return `magnet:?${safeParams.toString()}`;
  } catch {
    return null;
  }
}

/**
 * Extrai o hash BTIH para uso como chave de cache ou identificador único.
 */
export function extractInfoHash(uri: string): string | null {
  if (!isValidMagnetUri(uri)) return null;
  try {
    const params = new URLSearchParams(uri.slice(8));
    for (const xt of params.getAll('xt')) {
      if (xt.toLowerCase().startsWith('urn:btih:')) {
        return xt.slice(9).toLowerCase();
      }
    }
  } catch {
    return null;
  }
  return null;
}
