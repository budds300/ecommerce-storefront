import { sdk } from '@/lib/sdk';
import { getRegionId } from '@/lib/region';
import { ProductGrid } from '@/components/product/ProductGrid';
import Link from 'next/link';
import { ProductSearch } from './ProductSearch';

interface PageProps {
  searchParams: Promise<{ category?: string; search?: string; page?: string; collection_id?: string }>;
}

export const revalidate = 60;

const CAT_ICON = (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? '1', 10);
  const offset = (page - 1) * 20;
  const regionId = await getRegionId();

  const [productsResult, categoriesResult] = await Promise.all([
    sdk.store.product
      .list({
        fields: 'id,title,description,thumbnail,handle,*variants,*variants.calculated_price,+variants.inventory_quantity,*categories,*images,*type',
        limit: 20,
        offset,
        region_id: regionId,
        ...(params.category ? { category_id: [params.category] } : {}),
        ...(params.collection_id ? { collection_id: [params.collection_id] } : {}),
        ...(params.search ? { q: params.search } : {}),
      } as Record<string, unknown>)
      .catch(() => ({ products: [], count: 0, limit: 20, offset: 0 })),

    sdk.store.category
      .list({ fields: 'id,name,handle', limit: 100 })
      .catch(() => ({ product_categories: [], count: 0, limit: 100, offset: 0 })),
  ]);

  const { products, count } = productsResult;
  const { product_categories: categories } = categoriesResult;
  const totalPages = Math.ceil((count ?? 0) / 20);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px 80px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'start' }}>

        {/* Sidebar */}
        {categories.length > 0 && (
          <aside style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', color: '#64748b', textTransform: 'uppercase', padding: '6px 10px 10px' }}>
                Categories
              </div>
              <Link
                href="/products"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                  borderRadius: 8, fontSize: 13, fontWeight: !params.category ? 600 : 500,
                  color: !params.category ? '#fff' : '#1e293b',
                  background: !params.category ? '#3b82f6' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                {CAT_ICON}
                All Products
              </Link>
              {categories
                .filter(cat => !params.search || cat.name.toLowerCase().includes(params.search.toLowerCase()))
                .map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                    borderRadius: 8, fontSize: 13, fontWeight: params.category === cat.id ? 600 : 500,
                    color: params.category === cat.id ? '#fff' : '#1e293b',
                    background: params.category === cat.id ? '#3b82f6' : 'transparent',
                    textDecoration: 'none',
                    textTransform: 'capitalize',
                  }}
                >
                  {CAT_ICON}
                  {cat.name}
                </Link>
              ))}
            </div>
          </aside>
        )}

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Search bar */}
          <div style={{ marginBottom: 20 }}>
            <ProductSearch defaultValue={params.search ?? ''} />
          </div>

          {/* Count + title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
              {count ?? 0} {(count ?? 0) === 1 ? 'product' : 'products'}
              {params.search && <span> for &ldquo;{params.search}&rdquo;</span>}
            </p>
          </div>

          <ProductGrid products={products} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 40 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/products?page=${p}${params.category ? `&category=${params.category}` : ''}${params.collection_id ? `&collection_id=${params.collection_id}` : ''}${params.search ? `&search=${params.search}` : ''}`}
                  style={{
                    width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    border: p === page ? '0' : '1px solid #e2e8f0',
                    borderRadius: 8, fontSize: 14, textDecoration: 'none',
                    background: p === page ? '#1e293b' : '#fff',
                    color: p === page ? '#fff' : '#1e293b',
                    fontWeight: p === page ? 600 : 400,
                  }}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
