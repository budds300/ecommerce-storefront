'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import type { HttpTypes } from '@medusajs/types';
import { sdk } from '@/lib/sdk';
import { formatKES } from '@/lib/utils';
import { getStockStatus } from '@/lib/stock';
import { useCart } from '@/store/cart';
import { trackAddToCart, trackViewItem } from '@/lib/analytics';

interface ProductDetailProps {
  initialProduct: HttpTypes.StoreProduct | null;
}

export function ProductDetail({ initialProduct }: ProductDetailProps) {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<HttpTypes.StoreProduct | null>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<'description' | 'review'>('description');
  const [activeImg, setActiveImg] = useState(0);
  const addItem = useCart((s) => s.addItem);

  useEffect(() => {
    if (initialProduct) return;
    sdk.store.region.list().then(({ regions }) => {
      const regionId = regions[0]?.id;
      return sdk.store.product.retrieve(params.id, {
        fields:
          'id,title,description,thumbnail,handle,*variants,*variants.calculated_price,+variants.inventory_quantity,*categories,*images,*type',
        ...(regionId ? { region_id: regionId } : {}),
      } as Record<string, unknown>);
    })
      .then(({ product: p }) => setProduct(p))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [params.id, initialProduct]);

  useEffect(() => {
    if (!product) return;
    const variant = product.variants?.[0];
    trackViewItem({
      item_id: product.id,
      item_name: product.title ?? '',
      price: variant?.calculated_price?.calculated_amount ?? 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (loading) {
    return (
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 32px', textAlign: 'center', color: '#64748b' }}>
        Loading…
      </div>
    );
  }

  if (!product) return notFound();

  const variant = product.variants?.[0];
  const price = variant?.calculated_price?.calculated_amount ?? 0;
  const { inStock, isBackorder, stockCount } = getStockStatus(variant);
  const images = product.images?.length
    ? product.images.map((img) => img.url)
    : [product.thumbnail ?? '/placeholder.png'];
  const activeImage = images[activeImg] ?? '/placeholder.png';
  const category = product.categories?.[0]?.name ?? product.type?.value ?? '';
  const maxQty = !isBackorder && stockCount > 0 ? stockCount : 99;

  const handleAddToCart = () => {
    addItem(product, quantity);
    trackAddToCart({
      item_id: product.id,
      item_name: product.title ?? '',
      price,
      quantity,
    });
    toast.success(`${product.title ?? 'Item'} added to cart`, {
      description: `${quantity > 1 ? `${quantity} × ` : ''}${formatKES(price)}`,
    });
  };

  return (
    <div className="px-4 sm:px-8" style={{ maxWidth: 1180, margin: '0 auto', paddingTop: 24, paddingBottom: 80 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>

        {/* Breadcrumbs */}
        <nav style={{ fontSize: 13, color: '#64748b' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          {category && (
            <>
              <span style={{ margin: '0 8px' }}>/</span>
              <Link href="/products" style={{ color: '#64748b', textDecoration: 'none', textTransform: 'capitalize' }}>{category}</Link>
            </>
          )}
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: '#1e293b' }}>{product.title}</span>
        </nav>

        {/* Top section: gallery + info */}
        <section
          className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] p-5 sm:p-8"
          style={{
            background: '#f8fafc', borderRadius: 12,
            gap: 32, alignItems: 'start',
          }}
        >
          {/* Gallery */}
          <div>
            <div style={{ height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Image
                src={activeImage}
                alt={product.title ?? ''}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    aria-label={`Image ${i + 1}`}
                    style={{
                      width: 64, height: 48, borderRadius: 6,
                      border: i === activeImg ? '2px solid #1e293b' : '1px solid #e2e8f0',
                      background: '#fff', padding: 4, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'border-color 150ms', position: 'relative',
                    }}
                  >
                    <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-contain p-1" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info panel */}
          <div style={{ paddingTop: 8 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: '#1e293b', lineHeight: 1.1 }}>
              {product.title}
            </h1>

            {category && (
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 12 }}>
                Category: <span style={{ color: '#1e293b', fontWeight: 600, textTransform: 'capitalize' }}>{category}</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 20 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', fontFeatureSettings: '"tnum"' }}>
                {formatKES(price)}
              </span>
            </div>

            {/* Stock status */}
            <div style={{ marginTop: 14, fontSize: 13 }}>
              {!inStock ? (
                <span style={{ color: '#ef4444', fontWeight: 600 }}>Out of Stock</span>
              ) : isBackorder ? (
                <span style={{ color: '#0423a0', fontWeight: 600 }}>Pre-order Available</span>
              ) : stockCount > 0 && stockCount <= 5 ? (
                <span style={{ color: '#f59e0b', fontWeight: 600 }}>Only {stockCount} left in stock</span>
              ) : (
                <span style={{ color: '#10b981', fontWeight: 600 }}>Stock Available</span>
              )}
            </div>

            {/* Quantity selector */}
            {inStock && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Quantity</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #e2e8f0', borderRadius: 8, width: 'fit-content', overflow: 'hidden' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{
                      width: 44, height: 44, border: 0, background: '#fff', cursor: 'pointer',
                      fontSize: 18, color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >−</button>
                  <span style={{
                    width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 600, color: '#1e293b', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0',
                  }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                    style={{
                      width: 44, height: 44, border: 0, background: '#fff', cursor: 'pointer',
                      fontSize: 18, color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >+</button>
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="w-full sm:w-auto"
              style={{
                height: 48, padding: '0 28px', border: 0, borderRadius: 9999,
                background: !inStock ? '#94a3b8' : '#1e293b',
                color: '#fff', fontFamily: 'inherit', fontWeight: 600, fontSize: 14,
                cursor: !inStock ? 'not-allowed' : 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: inStock ? '0 6px 14px rgba(30,41,59,0.20)' : 'none',
                transition: 'transform 150ms, box-shadow 150ms',
              }}
              onMouseEnter={(e) => {
                if (inStock) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(30,41,59,0.28)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = inStock ? '0 6px 14px rgba(30,41,59,0.20)' : 'none';
              }}
            >
              {!inStock ? 'Out of Stock' : isBackorder ? 'Pre-order' : 'Add To Cart'}
            </button>

            <Link
              href="/checkout"
              className="w-full sm:w-auto"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 48, padding: '0 20px',
                border: '1px solid #e2e8f0', borderRadius: 9999, fontSize: 14, fontWeight: 500,
                color: '#1e293b', textDecoration: 'none', background: '#fff',
                transition: 'background 150ms',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
            >
              View Cart
            </Link>
            </div>

            {product.handle && (
              <div style={{ marginTop: 28, fontSize: 13, color: '#64748b' }}>
                Sold By: <span style={{ color: '#1e293b', fontWeight: 600 }}>Soft Solutions Store</span>
              </div>
            )}
          </div>
        </section>

        {/* Tabs */}
        <section>
          <div style={{ display: 'flex', gap: 28, borderBottom: '1px solid #e2e8f0', paddingLeft: 4 }}>
            {([['description', 'Description'], ['review', 'Reviews']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  background: 'transparent', border: 0, padding: '12px 4px',
                  fontFamily: 'inherit', fontSize: 15,
                  fontWeight: tab === key ? 600 : 500, cursor: 'pointer',
                  color: tab === key ? '#1e293b' : '#64748b',
                  borderBottom: tab === key ? '2px solid #1e293b' : '2px solid transparent',
                  marginBottom: -1, transition: 'color 150ms',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ paddingTop: 28 }}>
            {tab === 'description' ? (
              product.description ? (
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.65, margin: 0 }}>
                  {product.description}
                </p>
              ) : (
                <p style={{ fontSize: 14, color: '#94a3b8' }}>No description available.</p>
              )
            ) : (
              <p style={{ fontSize: 14, color: '#64748b' }}>Reviews coming soon.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
