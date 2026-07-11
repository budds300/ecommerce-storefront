'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { useWishlist } from '@/store/wishlist';
import { useCustomer } from '@/store/customer';
import { useCart } from '@/store/cart';
import { formatKES } from '@/lib/utils';

export default function WishlistPage() {
  const { customer } = useCustomer();
  const { items, count, loading, fetchWishlist, removeItem } = useWishlist();
  const addCartItem = useCart((s) => s.addItem);

  useEffect(() => {
    if (customer) fetchWishlist();
  }, [customer, fetchWishlist]);

  if (!customer) {
    return (
      <div className="px-4 sm:px-8" style={{ maxWidth: 640, margin: '80px auto', textAlign: 'center' }}>
        <svg width="64" height="64" fill="none" stroke="#cbd5e1" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: '0 auto 24px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
        </svg>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Your Wishlist</h1>
        <p style={{ color: '#64748b', marginBottom: 24 }}>Sign in to save and view your wishlist</p>
        <Link
          href="/account/login"
          style={{
            display: 'inline-block', background: '#1e293b', color: '#fff',
            padding: '10px 28px', borderRadius: 8, fontWeight: 600, fontSize: 14,
            textDecoration: 'none',
          }}
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8" style={{ maxWidth: 860, margin: '0 auto', paddingTop: 40, paddingBottom: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Wishlist {count > 0 && <span style={{ color: '#64748b', fontWeight: 400, fontSize: 18 }}>({count})</span>}
        </h1>
        <Link href="/products" style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'underline' }}>
          Browse products
        </Link>
      </div>

      {loading && items.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 96, borderRadius: 12, background: '#f1f5f9',
                animation: 'pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite',
              }}
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <svg width="64" height="64" fill="none" stroke="#cbd5e1" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: '0 auto 20px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
          </svg>
          <p style={{ color: '#64748b', fontSize: 15, marginBottom: 20 }}>Your wishlist is empty</p>
          <Link
            href="/products"
            style={{
              display: 'inline-block', background: '#1e293b', color: '#fff',
              padding: '10px 28px', borderRadius: 8, fontWeight: 600, fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item) => {
            const product = item.product_variant?.product;
            const variant = item.product_variant;
            const src = product?.thumbnail ?? product?.images?.[0]?.url ?? '/placeholder.png';
            const price = variant?.calculated_price?.calculated_amount ?? 0;
            const productHref = product?.handle ? `/products/${product.id}` : '/products';

            return (
              <div
                key={item.id}
                className="flex-wrap sm:flex-nowrap"
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  background: '#f8fafc', borderRadius: 12, padding: '16px 20px',
                  border: '1px solid #e2e8f0',
                }}
              >
                {/* Thumbnail */}
                <Link href={productHref} style={{ flexShrink: 0 }}>
                  <div style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', background: '#fff', position: 'relative' }}>
                    <Image src={src} alt={product?.title ?? ''} fill className="object-cover" sizes="72px" />
                  </div>
                </Link>

                {/* Info */}
                <div className="basis-full sm:basis-0" style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
                  <Link href={productHref} style={{ textDecoration: 'none' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>
                      {product?.title ?? 'Product'}
                    </div>
                  </Link>
                  {variant?.title && variant.title !== 'Default Variant' && (
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{variant.title}</div>
                  )}
                  {price > 0 && (
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{formatKES(price)}</div>
                  )}
                </div>

                {/* Actions */}
                <div className="w-full sm:w-auto justify-end" style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => {
                      if (product) {
                        addCartItem({
                          id: product.id ?? '',
                          title: product.title ?? '',
                          thumbnail: product.thumbnail,
                          variants: item.product_variant ? [item.product_variant as never] : [],
                        } as never);
                        toast.success(`${product.title} added to cart`);
                      }
                    }}
                    style={{
                      height: 40, padding: '0 16px', border: 0, borderRadius: 8,
                      background: '#3b82f6', color: '#fff', fontFamily: 'inherit',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    }}
                  >
                    Add to Cart
                  </button>
                  <button
                    disabled={loading}
                    onClick={async () => {
                      await removeItem(item.id);
                      toast.success('Removed from wishlist');
                    }}
                    style={{
                      height: 40, padding: '0 16px', border: '1px solid #e2e8f0',
                      borderRadius: 8, background: '#fff', color: '#64748b',
                      fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
                      cursor: loading ? 'wait' : 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
