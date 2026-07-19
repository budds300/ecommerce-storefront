'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '@/store/cart';
import { useCustomer } from '@/store/customer';
import { useWishlist } from '@/store/wishlist';
import { useEffect, useRef, useState } from 'react';
import { MobileNav } from './MobileNav';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/track', label: 'Track Order' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const pathname = usePathname();
  const hideSearch = pathname === '/products';
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
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
      borderBottom: '1px solid #e2e8f0',
    }}>
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:h-16 sm:flex-nowrap sm:gap-6 sm:px-8 sm:py-0"
        style={{ maxWidth: 1600, margin: '0 auto' }}
      >
        {/* Left Section: Menu & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MobileNav />
            {/* Logo */}
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
              <Image src="/soft-solutions-logo-light.png" alt="Soft Solutions" width={721} height={240} style={{ height: 32, width: 'auto', flexShrink: 0 }} priority />
            </Link>
          </div>

          {/* Primary nav — hidden on mobile, which uses the MobileNav drawer instead */}
          <nav className="hidden md:flex" style={{ alignItems: 'center', gap: 20 }}>
            {NAV_LINKS.map((link) => {
              const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: 14, fontWeight: active ? 700 : 500,
                    color: active ? '#0423a0' : '#1e293b',
                    textDecoration: 'none', whiteSpace: 'nowrap',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Link to the main Soft Solutions site */}
        <a
          href="https://softsolutions.co.ke/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex"
          style={{
            alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
            color: '#0423a0', textDecoration: 'none', whiteSpace: 'nowrap',
          }}
        >
          softsolutions.co.ke
          <svg width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/>
          </svg>
        </a>

        {/* Search — wraps to its own full-width row on mobile; hidden on /products, which has its own search */}
        {!hideSearch && (
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
            className="order-3 w-full sm:order-none sm:flex-[0_1_360px]"
            style={{ position: 'relative' }}
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
        )}

        {/* Right Section: Utility icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#1e293b', flexShrink: 0 }}>
            {/* Account — moved into the mobile drawer below sm */}
            <Link
              href={customer ? '/account' : '/account/login'}
              title={customer ? `${customer.first_name} ${customer.last_name}` : 'Sign in'}
              className="hidden sm:inline-flex"
              style={{ ...iconBtnStyle, display: undefined }}
              aria-label="Account"
            >
              {customer ? (
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0423a0' }}>
                  {customer.first_name?.[0]?.toUpperCase() ?? '?'}
                </span>
              ) : (
                <svg width="20" height="20" stroke="currentColor" strokeWidth="1.75" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>
                </svg>
              )}
            </Link>

            {/* Wishlist — moved into the mobile drawer below sm */}
            <Link href="/wishlist" className="hidden sm:inline-flex" style={{ ...iconBtnStyle, display: undefined, position: 'relative' } as React.CSSProperties} aria-label="Wishlist">
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
                  background: '#0423a0', color: '#fff', borderRadius: 9999, fontSize: 10, fontWeight: 700,
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
    </header>
  );
}

const iconBtnStyle: React.CSSProperties = {
  width: 40, height: 40, border: 0, background: 'transparent', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: 8, color: '#1e293b', textDecoration: 'none',
};
