import type { MetadataRoute } from 'next';

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://store.softsolutions.co.ke';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/account', '/cart', '/checkout', '/order-confirmation', '/auth/magic', '/api'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
