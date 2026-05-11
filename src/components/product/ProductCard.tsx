'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import type { HttpTypes } from '@medusajs/types';
import { formatKES } from '@/lib/utils';
import { getStockStatus } from '@/lib/stock';
import { useCart } from '@/store/cart';
import { useWishlist } from '@/store/wishlist';
import { useCustomer } from '@/store/customer';

interface ProductCardProps {
  product: HttpTypes.StoreProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((s) => s.addItem);
  const { addItem: wishlistAdd, removeItem: wishlistRemove, isWished, loading: wishlistLoading } = useWishlist();
  const { customer } = useCustomer();
  const [hov, setHov] = useState(false);
  const variant = product.variants?.[0];
  const wished = isWished(variant?.id ?? '');
  const price = variant?.calculated_price?.calculated_amount ?? 0;
  const { inStock, isBackorder, stockCount } = getStockStatus(variant);
  const image = product.thumbnail ?? product.images?.[0]?.url ?? '/placeholder.png';
  const category = product.categories?.[0]?.name ?? product.type?.value ?? '';

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? '#ffffff' : '#f8fafc',
        border: hov ? '1px solid #e2e8f0' : '1px solid transparent',
        borderRadius: 12,
        padding: 20,
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        transform: hov ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hov ? '0 18px 36px rgba(15,23,42,0.12), 0 2px 6px rgba(15,23,42,0.04)' : 'none',
        transition: 'background 200ms cubic-bezier(0.4,0,0.2,1), border-color 200ms, transform 280ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 280ms',
        overflow: 'hidden',
      }}
    >
      {/* Radial glow */}
      <div aria-hidden style={{
        position: 'absolute', top: -40, left: '50%',
        transform: `translateX(-50%) scale(${hov ? 1 : 0.6})`,
        width: 260, height: 260, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0) 65%)',
        opacity: hov ? 1 : 0,
        transition: 'opacity 320ms cubic-bezier(0.4,0,0.2,1), transform 420ms cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: 'none',
      }} />

      {/* Status badges */}
      {!inStock && (
        <span style={{
          position: 'absolute', top: 10, left: 10, background: '#ef4444', color: '#fff',
          borderRadius: 4, fontSize: 10, fontWeight: 600, padding: '2px 6px', zIndex: 2,
        }}>Out of Stock</span>
      )}
      {isBackorder && inStock && (
        <span style={{
          position: 'absolute', top: 10, left: 10, background: '#3b82f6', color: '#fff',
          borderRadius: 9999, fontSize: 10, fontWeight: 600, padding: '2px 8px', zIndex: 2,
        }}>Pre-order</span>
      )}

      {/* Wishlist button */}
      <button
        aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        disabled={wishlistLoading}
        onClick={async (e) => {
          e.stopPropagation();
          if (!customer) {
            toast.info('Sign in to save to wishlist');
            return;
          }
          if (!variant?.id) return;
          if (wished) {
            const item = useWishlist.getState().items.find((i) => i.product_variant_id === variant.id);
            if (item) {
              await wishlistRemove(item.id);
              toast.success('Removed from wishlist');
            }
          } else {
            await wishlistAdd(variant.id);
            toast.success('Added to wishlist');
          }
        }}
        style={{
          position: 'absolute', top: 12, right: 12, width: 32, height: 32, border: 0,
          borderRadius: 9999,
          background: hov ? '#fff' : 'transparent',
          boxShadow: hov ? '0 4px 12px rgba(15,23,42,0.10)' : 'none',
          cursor: wishlistLoading ? 'wait' : 'pointer', zIndex: 2,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: wished ? '#ef4444' : hov ? '#3b82f6' : '#94a3b8',
          transform: wished ? 'scale(1.15)' : hov ? 'scale(1.05)' : 'scale(1)',
          transition: 'color 200ms, background 200ms, box-shadow 200ms, transform 220ms cubic-bezier(0.34,1.56,0.64,1)',
          opacity: wishlistLoading ? 0.6 : 1,
        }}
      >
        <svg width="16" height="16" stroke="currentColor" strokeWidth="1.75" fill={wished ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
        </svg>
      </button>

      {/* Product image */}
      <Link href={`/products/${product.id}`} style={{ width: '100%', textDecoration: 'none', position: 'relative', zIndex: 1 }}>
        <div style={{
          height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%',
          transform: hov ? 'scale(1.08) translateY(-4px)' : 'scale(1) translateY(0)',
          transition: 'transform 420ms cubic-bezier(0.34,1.56,0.64,1)',
          filter: hov ? 'drop-shadow(0 12px 16px rgba(15,23,42,0.18))' : 'drop-shadow(0 0 0 rgba(0,0,0,0))',
        }}>
          <div style={{ position: 'relative', width: 128, height: 128 }}>
            <Image
              src={image}
              alt={product.title ?? ''}
              fill
              className="object-contain"
              sizes="128px"
            />
          </div>
          {!inStock && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8,
            }}>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      {/* Category eyebrow */}
      <div style={{
        fontSize: 10, fontWeight: 500, letterSpacing: '0.14em',
        color: hov ? '#3b82f6' : '#94a3b8', textTransform: 'uppercase',
        transition: 'color 200ms', position: 'relative', zIndex: 1,
      }}>
        {category || 'Product'}
      </div>

      {/* Title */}
      <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{
          fontSize: 14, color: '#1e293b', fontWeight: hov ? 600 : 500,
          textAlign: 'center', lineHeight: 1.3,
          transition: 'font-weight 150ms',
        }}>
          {product.title}
        </div>
      </Link>

      {/* Price */}
      <div style={{ position: 'relative', zIndex: 1, fontFeatureSettings: '"tnum"', fontWeight: 700, fontSize: 16, color: '#1e293b' }}>
        {formatKES(price)}
      </div>

      {inStock && !isBackorder && stockCount > 0 && stockCount <= 5 && (
        <div style={{ fontSize: 11, color: '#f59e0b', position: 'relative', zIndex: 1 }}>
          Only {stockCount} left
        </div>
      )}

      {/* Reveal button — slides up on hover */}
      <div style={{
        width: '100%',
        maxHeight: hov ? 44 : 0,
        marginTop: hov ? 8 : 0,
        opacity: hov ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height 280ms cubic-bezier(0.4,0,0.2,1), margin-top 280ms, opacity 220ms 80ms',
        position: 'relative', zIndex: 1,
      }}>
        <AddToCartButton
          disabled={!inStock}
          label={!inStock ? 'Out of Stock' : isBackorder ? 'Pre-order' : 'Add to Cart'}
          onClick={(e) => {
            e.stopPropagation();
            addItem(product);
            toast.success(`${product.title ?? 'Item'} added to cart`, {
              description: formatKES(price),
            });
          }}
        />
      </div>
    </div>
  );
}

function AddToCartButton({ disabled, label, onClick }: {
  disabled: boolean;
  label: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  const [bHov, setBHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setBHov(true)}
      onMouseLeave={() => setBHov(false)}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', height: 36, border: 0, borderRadius: 8,
        background: disabled ? '#94a3b8' : bHov ? '#1e293b' : '#3b82f6',
        color: '#fff', fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
        letterSpacing: '0.02em', cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        boxShadow: bHov ? '0 6px 14px rgba(30,41,59,0.25)' : '0 2px 6px rgba(59,130,246,0.25)',
        transition: 'background 180ms cubic-bezier(0.4,0,0.2,1), box-shadow 180ms, transform 180ms',
        transform: bHov ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      <span>{label}</span>
      {!disabled && (
        <svg width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: bHov ? 'translateX(3px)' : 'translateX(0)', transition: 'transform 180ms cubic-bezier(0.4,0,0.2,1)' }}>
          <path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>
        </svg>
      )}
    </button>
  );
}
