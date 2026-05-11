'use client';

import Link from 'next/link';
import { useCart } from '@/store/cart';
import { useCustomer } from '@/store/customer';
import { useWishlist } from '@/store/wishlist';
import { useEffect, useRef, useState } from 'react';

export function Header() {
  const totalItems = useCart((s) => s.totalItems);
  const wishlistCount = useWishlist((s) => s.count);
  const { fetchWishlist } = useWishlist();
  const { customer, fetchCustomer } = useCustomer();
  const prevTotalRef = useRef(totalItems);
  const [badgeBounce, setBadgeBounce] = useState(false);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  useEffect(() => {
    if (customer) fetchWishlist();
    else useWishlist.getState().clear();
  }, [customer, fetchWishlist]);

  useEffect(() => {
    if (totalItems > prevTotalRef.current) {
      setBadgeBounce(true);
      setTimeout(() => setBadgeBounce(false), 400);
    }
    prevTotalRef.current = totalItems;
  }, [totalItems]);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50, height: 64,
      background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
      borderBottom: '1px solid #e2e8f0',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', gap: 24,
      }}>
        {/* Left Section: Logo & Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <span style={{
              width: 32, height: 32, background: '#3b82f6', borderRadius: 8,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="18" height="18" stroke="#fff" strokeWidth="2" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12 12 4l9 8"/><path d="M5 10v10h14V10"/>
              </svg>
            </span>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em', color: '#1e293b', whiteSpace: 'nowrap' }}>
              Soft Solutions Store
            </span>
          </Link>

          
        </div>

        {/* Right Section: Search & Utility */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, justifyContent: 'flex-end' }}>
          {/* Search */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const search = new FormData(e.currentTarget).get('search')?.toString();
              if (search) {
                window.location.href = `/products?search=${encodeURIComponent(search)}`;
              } else {
                window.location.href = '/products';
              }
            }}
            style={{ flex: '0 1 360px', width: '100%', position: 'relative' }}
          >
            <svg style={{ position: 'absolute', left: 12, top: 11, width: 18, height: 18, color: '#94a3b8', pointerEvents: 'none' }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              name="search"
              placeholder="Search products, brands…"
              style={{
                width: '100%', height: 40, paddingLeft: 38, paddingRight: 14,
                border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, color: '#1e293b',
                background: '#f8fafc', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
              }}
            />
          </form>

          {/* Utility icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#1e293b', flexShrink: 0 }}>
            {/* Account */}
            <Link
              href={customer ? '/account' : '/account/login'}
              title={customer ? `${customer.first_name} ${customer.last_name}` : 'Sign in'}
              style={iconBtnStyle}
              aria-label="Account"
            >
              {customer ? (
                <span style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6' }}>
                  {customer.first_name?.[0]?.toUpperCase() ?? '?'}
                </span>
              ) : (
                <svg width="20" height="20" stroke="currentColor" strokeWidth="1.75" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>
                </svg>
              )}
            </Link>

            {/* Wishlist */}
            <Link href="/wishlist" style={{ ...iconBtnStyle, position: 'relative' } as React.CSSProperties} aria-label="Wishlist">
              <svg width="20" height="20" stroke="currentColor" strokeWidth="1.75" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
              </svg>
              {wishlistCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, padding: '0 4px',
                  background: '#ef4444', color: '#fff', borderRadius: 9999, fontSize: 10, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  boxSizing: 'border-box',
                }}>
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" style={{ ...iconBtnStyle, position: 'relative' } as React.CSSProperties} aria-label="Cart">
              <svg width="20" height="20" stroke="currentColor" strokeWidth="1.75" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"
                style={badgeBounce ? { animation: 'bounce 0.3s ease' } : {}}>
                <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, padding: '0 4px',
                  background: '#3b82f6', color: '#fff', borderRadius: 9999, fontSize: 10, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  transform: badgeBounce ? 'scale(1.3)' : 'scale(1)',
                  transition: 'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
                  boxSizing: 'border-box'
                }}>
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

const iconBtnStyle: React.CSSProperties = {
  width: 40, height: 40, border: 0, background: 'transparent', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: 8, color: '#1e293b', textDecoration: 'none',
};
