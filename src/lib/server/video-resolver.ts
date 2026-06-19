import * as cheerio from 'cheerio';

export interface VideoSource {
  url: string;
  quality?: string;
  type: 'm3u8' | 'mp4' | 'iframe';
  label: string;
}

export class VideoResolver {
  public static async fetchHtml(url: string, options: RequestInit = {}): Promise<string | null> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          ...options.headers,
        },
        next: { revalidate: 3600 }
      });
      if (!response.ok) return null;
      return await response.text();
    } catch (error) {
      console.error(`FETCH_ERROR [${url}]:`, error);
      return null;
    }
  }

  public static parseHtml(html: string): cheerio.CheerioAPI {
    return cheerio.load(html);
  }

  static inferType(url: string): 'm3u8' | 'mp4' | 'iframe' {
    const lower = url.toLowerCase();
    if (lower.includes('.m3u8')) return 'm3u8';
    if (lower.includes('.mp4')) return 'mp4';
    return 'iframe';
  }

  // Common patterns for extracting URLs from params
  static extractUrlFromParam(url: string): string | null {
    try {
      const parsed = new URL(url);
      const params = ['source', 'url', 'file', 'video', 'src', 'd', 'link'];
      for (const p of params) {
        const val = parsed.searchParams.get(p);
        if (val && val.startsWith('http')) return decodeURIComponent(val);
      }
    } catch { }
    return null;
  }
}
