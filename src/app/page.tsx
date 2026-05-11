import Link from 'next/link';
import type { HttpTypes } from '@medusajs/types';
import { sdk } from '@/lib/sdk';
import { getRegionId } from '@/lib/region';
import { ProductCard } from '@/components/product/ProductCard';
import { HeroGrid } from '@/components/home/HeroGrid';
import { TrustBar } from '@/components/home/TrustBar';
import { CategoryTiles } from '@/components/home/CategoryTiles';

export const revalidate = 60;

export default async function HomePage() {
  const regionId = await getRegionId();

  const [{ products }, collectionsResult, categoriesResult] = await Promise.all([
    sdk.store.product
      .list({
        fields: 'id,title,thumbnail,handle,*variants,*variants.calculated_price,+variants.inventory_quantity,*categories,*images,*type',
        limit: 8,
        region_id: regionId,
      } as Record<string, unknown>)
      .catch(() => ({ products: [], count: 0, limit: 8, offset: 0 })),

    sdk.store.collection
      .list({ fields: 'id,title,handle', limit: 6 } as Record<string, unknown>)
      .catch(() => ({ collections: [] as Array<{ id: string; title: string; handle: string }> })),

    sdk.store.category
      .list({ fields: 'id,name,handle,metadata', limit: 6 } as Record<string, unknown>)
      .catch(() => ({ product_categories: [] as Array<{ id: string; name: string; handle: string }> })),
  ]);

  const collections = collectionsResult.collections as Array<{ id: string; title: string; handle: string }>;
  const categories = categoriesResult.product_categories as Array<{ id: string; name: string; handle: string; metadata?: Record<string, unknown> }>;

  const collectionProducts: Record<string, HttpTypes.StoreProduct[]> = {};
  if (collections.length > 0) {
    const perCollectionResults = await Promise.all(
      collections.slice(0, 5).map((c) =>
        sdk.store.product
          .list({
            fields: 'id,title,thumbnail,*images',
            limit: 3,
            collection_id: [c.id],
            region_id: regionId,
          } as Record<string, unknown>)
          .catch(() => ({ products: [] as HttpTypes.StoreProduct[] }))
      )
    );
    collections.slice(0, 5).forEach((c, i) => {
      collectionProducts[c.id] = perCollectionResults[i].products as HttpTypes.StoreProduct[];
    });
  }

  const categoryProducts: Record<string, HttpTypes.StoreProduct[]> = {};
  if (categories.length > 0) {
    const perCategoryResults = await Promise.all(
      categories.slice(0, 6).map((cat) =>
        sdk.store.product
          .list({
            fields: 'id,title,thumbnail,*images',
            limit: 1,
            category_id: [cat.id],
            region_id: regionId,
          } as Record<string, unknown>)
          .catch(() => ({ products: [] as HttpTypes.StoreProduct[] }))
      )
    );
    categories.slice(0, 6).forEach((cat, i) => {
      categoryProducts[cat.id] = perCategoryResults[i].products as HttpTypes.StoreProduct[];
    });
  }

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px 80px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
        <HeroGrid collections={collections} collectionProducts={collectionProducts} />
        <TrustBar />
        <CategoryTiles categories={categories} categoryProducts={categoryProducts} />

        {products.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', margin: 0, color: '#1e293b' }}>
                Featured Products
              </h2>
              <Link href="/products" style={{ fontSize: 13, color: '#1e293b', textDecoration: 'underline' }}>
                View all
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
