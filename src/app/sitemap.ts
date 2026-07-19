import type { MetadataRoute } from 'next';
import { sdk } from '@/lib/sdk';
import { getRegionId } from '@/lib/region';

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://store.softsolutions.co.ke';

const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/products', priority: 0.9, changeFrequency: 'daily' },
  { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/returns', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/accessibility', priority: 0.3, changeFrequency: 'yearly' },
];

async function getProductEntries(): Promise<MetadataRoute.Sitemap> {
  const regionId = await getRegionId();
  const entries: MetadataRoute.Sitemap = [];
  const limit = 100;
  let offset = 0;

  for (;;) {
    const { products, count } = await sdk.store.product
      .list({
        fields: 'id,updated_at',
        limit,
        offset,
        region_id: regionId,
      } as Record<string, unknown>)
      .catch(() => ({ products: [], count: 0 }));

    for (const product of products) {
      entries.push({
        url: `${SITE_URL}/products/${product.id}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : undefined,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }

    offset += limit;
    if (offset >= count || products.length === 0) break;
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const productEntries = await getProductEntries();

  return [...staticEntries, ...productEntries];
}
