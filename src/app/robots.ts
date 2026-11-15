import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://animehouse.com.br';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/perfil',
        '/configuracoes',
        '/api/',
        '/login',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
