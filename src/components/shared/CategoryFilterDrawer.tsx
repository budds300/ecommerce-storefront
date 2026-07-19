'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

const CAT_ICON = (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);

const FILTER_ICON = (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h16M7 12h10M10 18h4"/>
  </svg>
);

interface Category { id: string; name: string; handle: string }

export function CategoryFilterDrawer({
  categories,
  activeCategoryId,
  activeCategoryName,
}: {
  categories: Category[];
  activeCategoryId?: string;
  activeCategoryName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px',
          borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
          fontSize: 13, fontWeight: 500, color: '#1e293b', cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        {FILTER_ICON}
        {activeCategoryName ? <span style={{ textTransform: 'capitalize' }}>{activeCategoryName}</span> : 'Categories'}
      </button>

      {open && mounted && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)' }}
          />
          <div
            style={{
              position: 'absolute', top: 0, left: 0, bottom: 0, width: '82%', maxWidth: 300,
              background: '#fff', boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
              display: 'flex', flexDirection: 'column', overflowY: 'auto',
              animation: 'slideInLeftCat 220ms cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            <style>{`@keyframes slideInLeftCat { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', color: '#64748b', textTransform: 'uppercase' }}>
                Categories
              </span>
              <button
                aria-label="Close categories"
                onClick={() => setOpen(false)}
                style={{
                  width: 36, height: 36, border: 0, background: 'transparent', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8, color: '#64748b',
                }}
              >
                <svg width="18" height="18" stroke="currentColor" strokeWidth="1.75" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 8, fontSize: 13, fontWeight: !activeCategoryId ? 600 : 500,
                  color: !activeCategoryId ? '#fff' : '#1e293b',
                  background: !activeCategoryId ? '#0423a0' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                {CAT_ICON}
                All Products
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    borderRadius: 8, fontSize: 13, fontWeight: activeCategoryId === cat.id ? 600 : 500,
                    color: activeCategoryId === cat.id ? '#fff' : '#1e293b',
                    background: activeCategoryId === cat.id ? '#0423a0' : 'transparent',
                    textDecoration: 'none', textTransform: 'capitalize',
                  }}
                >
                  {CAT_ICON}
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
