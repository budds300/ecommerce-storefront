'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { HttpTypes } from '@medusajs/types';

interface CategoryTilesProps {
  categories?: Array<{ id: string; name: string; handle: string; metadata?: Record<string, unknown> }>;
  categoryProducts?: Record<string, HttpTypes.StoreProduct[]>;
}

// Generic icon for dynamic categories
function GenericCategoryIcon() {
  return (
    <svg width="48" height="40" viewBox="0 0 48 40" fill="none">
      <rect x="2" y="2" width="19" height="17" rx="3" fill="#cbd5e1"/>
      <rect x="27" y="2" width="19" height="17" rx="3" fill="#94a3b8"/>
      <rect x="2" y="21" width="19" height="17" rx="3" fill="#94a3b8"/>
      <rect x="27" y="21" width="19" height="17" rx="3" fill="#cbd5e1"/>
    </svg>
  );
}

// Fallback hardcoded tiles (used when no Medusa categories exist)
function CTProjector() {
  return (
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
      <rect x="6" y="14" width="68" height="34" rx="6" fill="#cbd5e1"/>
      <circle cx="26" cy="31" r="12" fill="#475569"/>
      <circle cx="26" cy="31" r="5" fill="#3b82f6"/>
      <rect x="46" y="22" width="14" height="4" rx="2" fill="#94a3b8"/>
    </svg>
  );
}
function CTConsole() {
  return (
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
      <rect x="6" y="14" width="44" height="32" rx="4" fill="#e2e8f0" stroke="#cbd5e1"/>
      <rect x="11" y="22" width="34" height="2" fill="#cbd5e1"/>
      <rect x="11" y="28" width="34" height="2" fill="#cbd5e1"/>
      <path d="M55 36 Q55 26 64 26 L70 26 Q76 26 76 36 Q76 46 70 46 L64 46 Q55 46 55 36 Z" fill="#1e293b"/>
    </svg>
  );
}
function CTHeadphones() {
  return (
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
      <path d="M16 32 Q16 14 40 14 Q64 14 64 32" stroke="#475569" strokeWidth="3" fill="none"/>
      <rect x="10" y="28" width="14" height="22" rx="6" fill="#1e293b"/>
      <rect x="56" y="28" width="14" height="22" rx="6" fill="#1e293b"/>
    </svg>
  );
}
function CTBag() {
  return (
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
      <path d="M30 14 Q30 10 40 10 Q50 10 50 14" stroke="#64748b" strokeWidth="2" fill="none"/>
      <rect x="22" y="14" width="36" height="38" rx="6" fill="#475569"/>
      <rect x="30" y="28" width="20" height="14" rx="3" fill="#334155"/>
    </svg>
  );
}
function CTEarbuds() {
  return (
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
      <rect x="20" y="22" width="40" height="22" rx="10" fill="#1e293b"/>
      <circle cx="30" cy="33" r="6" fill="#3b82f6"/>
      <circle cx="50" cy="33" r="6" fill="#3b82f6"/>
    </svg>
  );
}
function CTSpeaker() {
  return (
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
      <rect x="28" y="10" width="24" height="42" rx="4" fill="#94a3b8"/>
      <circle cx="40" cy="22" r="6" fill="#1e293b"/>
      <circle cx="40" cy="40" r="5" fill="#1e293b"/>
    </svg>
  );
}

const FALLBACK_TILES = [
  { label: 'Projectors', svg: <CTProjector /> },
  { label: 'Gaming', svg: <CTConsole /> },
  { label: 'Headphones', svg: <CTHeadphones /> },
  { label: 'Bags', svg: <CTBag /> },
  { label: 'Earbuds', svg: <CTEarbuds /> },
  { label: 'Speakers', svg: <CTSpeaker /> },
];

const COLS_BY_COUNT: Record<number, string> = {
  1: 'repeat(1, 1fr)',
  2: 'repeat(2, 1fr)',
  3: 'repeat(3, 1fr)',
  4: 'repeat(4, 1fr)',
  5: 'repeat(5, 1fr)',
  6: 'repeat(6, 1fr)',
};

export function CategoryTiles({ categories, categoryProducts }: CategoryTilesProps) {
  const useDynamic = categories && categories.length > 0;
  const tiles = useDynamic
    ? categories.slice(0, 6)
    : null;
  const fallback = FALLBACK_TILES;
  const count = useDynamic ? (tiles?.length ?? 0) : fallback.length;
  const cols = COLS_BY_COUNT[count] ?? 'repeat(6, 1fr)';

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', margin: 0, color: '#1e293b' }}>
          Categories
        </h2>
        <Link href="/products" style={{ fontSize: 13, color: '#1e293b', textDecoration: 'underline' }}>
          Show More
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 14 }}>
        {useDynamic && tiles
          ? tiles.map((cat) => {
              const metaImg = typeof cat.metadata?.category_image === 'string' ? cat.metadata.category_image : null;
              const product = categoryProducts?.[cat.id]?.[0];
              const src = metaImg
                ?? product?.thumbnail
                ?? (product?.images as Array<{ url: string }>)?.[0]?.url
                ?? null;
              return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                style={{
                  background: '#f8fafc', borderRadius: 12, height: 130,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', textDecoration: 'none', gap: 10,
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
              >
                {src ? (
                  <div style={{ position: 'relative', width: 80, height: 80, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                    <Image src={src} alt={cat.name} fill className="object-cover" sizes="80px" />
                  </div>
                ) : (
                  <GenericCategoryIcon />
                )}
                <span style={{ fontSize: 12, fontWeight: 600, color: '#475569', textAlign: 'center', paddingInline: 8 }}>
                  {cat.name}
                </span>
              </Link>
              );
            })
          : fallback.map((tile) => (
              <Link
                key={tile.label}
                href="/products"
                style={{
                  background: '#f8fafc', borderRadius: 12, height: 130,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', textDecoration: 'none', gap: 8,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
              >
                {tile.svg}
                <span style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>{tile.label}</span>
              </Link>
            ))
        }
      </div>
    </section>
  );
}
