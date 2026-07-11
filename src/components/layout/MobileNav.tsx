'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { sdk } from '@/lib/sdk';
import { useCustomer } from '@/store/customer';
import { useWishlist } from '@/store/wishlist';

type Category = { id: string; name: string };

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { customer } = useCustomer();
  const wishlistCount = useWishlist((s) => s.count);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || categories.length > 0) return;
    sdk.store.category
      .list({ fields: 'id,name', limit: 100 } as Record<string, unknown>)
      .then(({ product_categories }) => setCategories(product_categories as Category[]))
      .catch(() => setCategories([]));
  }, [open, categories.length]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <button
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="sm:hidden inline-flex"
        style={{
          width: 40, height: 40, border: 0, background: 'transparent', cursor: 'pointer',
          alignItems: 'center', justifyContent: 'center',
          borderRadius: 8, color: '#1e293b', flexShrink: 0,
        }}
      >
        <svg width="22" height="22" stroke="currentColor" strokeWidth="1.75" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && mounted && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)' }}
          />

          {/* Drawer */}
          <div
            style={{
              position: 'absolute', top: 0, left: 0, bottom: 0, width: '82%', maxWidth: 320,
              background: '#fff', boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
              display: 'flex', flexDirection: 'column', overflowY: 'auto',
              animation: 'slideInLeft 220ms cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            <style>{`@keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: '#1e293b' }}>Menu</span>
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                style={{
                  width: 40, height: 40, border: 0, background: 'transparent', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8, color: '#64748b',
                }}
              >
                <svg width="20" height="20" stroke="currentColor" strokeWidth="1.75" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Account / Wishlist */}
            <div style={{ padding: '12px 8px', borderBottom: '1px solid #e2e8f0' }}>
              <Link
                href={customer ? '/account' : '/account/login'}
                onClick={() => setOpen(false)}
                style={navLinkStyle}
              >
                <svg width="18" height="18" stroke="currentColor" strokeWidth="1.75" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
                {customer ? `${customer.first_name ?? 'My'} Account` : 'Sign In'}
              </Link>
              <Link href="/wishlist" onClick={() => setOpen(false)} style={navLinkStyle}>
                <svg width="18" height="18" stroke="currentColor" strokeWidth="1.75" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
                </svg>
                Wishlist{wishlistCount > 0 && ` (${wishlistCount})`}
              </Link>
              <Link href="/track" onClick={() => setOpen(false)} style={navLinkStyle}>
                <svg width="18" height="18" stroke="currentColor" strokeWidth="1.75" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
                </svg>
                Track Order
              </Link>
            </div>

            {/* Categories */}
            <div style={{ padding: '12px 8px', flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', color: '#94a3b8', textTransform: 'uppercase', padding: '6px 12px 10px' }}>
                Categories
              </div>
              <Link href="/products" onClick={() => setOpen(false)} style={navLinkStyle}>
                All Products
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  onClick={() => setOpen(false)}
                  style={{ ...navLinkStyle, textTransform: 'capitalize' }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

const navLinkStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px',
  borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#1e293b',
  textDecoration: 'none',
};
