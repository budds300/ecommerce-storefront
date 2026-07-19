'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { HttpTypes } from '@medusajs/types';

interface SlideData {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  collectionId?: string;
}

interface HeroGridProps {
  collections?: Array<{ id: string; title: string; handle: string }>;
  collectionProducts?: Record<string, HttpTypes.StoreProduct[]>;
}

const FALLBACK_SLIDES: SlideData[] = [
  {
    eyebrow: 'GAME',
    title: 'Game Controller',
    body: 'Precision-tuned haptics, low-latency wireless, and 40-hour battery life. Built for competitive play.',
    cta: 'Shop Gaming',
    href: '/products',
  },
  {
    eyebrow: 'AUDIO',
    title: 'Studio Headphones',
    body: 'Reference-grade sound with active noise cancellation. Engineered for producers and listeners alike.',
    cta: 'Shop Audio',
    href: '/products',
  },
  {
    eyebrow: 'MOBILE',
    title: 'Phones, Reimagined',
    body: 'The latest flagships, certified pre-owned options, and accessories — all in one place.',
    cta: 'Shop Phones',
    href: '/products',
  },
];

function HeroProductSVG({ variant }: { variant: number }) {
  const fills = ['#1e293b', '#334155', '#475569'];
  return (
    <svg width="280" height="240" viewBox="0 0 280 240" fill="none">
      <ellipse cx="140" cy="180" rx="120" ry="14" fill="#e2e8f0"/>
      <path d="M40 100 Q40 60 90 60 L190 60 Q240 60 240 100 L240 150 Q240 170 220 170 L60 170 Q40 170 40 150 Z" fill={fills[variant % 3]}/>
      <rect x="80" y="100" width="50" height="36" rx="6" fill="#0423a0"/>
      <rect x="150" y="100" width="50" height="36" rx="6" fill="#0423a0"/>
      <rect x="60" y="80" width="160" height="6" rx="3" fill="#fff" opacity="0.5"/>
    </svg>
  );
}

function CollectionPreview({ products }: { products: HttpTypes.StoreProduct[] }) {
  const items = products.slice(0, 3);
  if (!items.length) return <HeroProductSVG variant={0} />;

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
      {items.map((p, i) => {
        const src = p.thumbnail ?? (p.images as Array<{ url: string }>)?.[0]?.url ?? '/placeholder.png';
        return (
          <div
            key={p.id}
            style={{
              width: i === 1 ? 140 : 110,
              height: i === 1 ? 140 : 110,
              borderRadius: 12,
              background: '#fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              overflow: 'hidden',
              flexShrink: 0,
              position: 'relative',
              transform: i === 0 ? 'rotate(-4deg)' : i === 2 ? 'rotate(4deg)' : 'none',
            }}
          >
            <Image src={src} alt={p.title ?? ''} fill className="object-cover" sizes="140px" />
          </div>
        );
      })}
    </div>
  );
}

function RunnerSVG() {
  return (
    <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
      <ellipse cx="50" cy="70" rx="44" ry="6" fill="#e2e8f0"/>
      <path d="M10 55 Q15 35 35 38 L70 38 Q92 40 92 55 L92 60 Q92 65 86 65 L16 65 Q10 65 10 60 Z" fill="#475569"/>
    </svg>
  );
}

function EarbudsSVG() {
  return (
    <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
      <ellipse cx="50" cy="68" rx="40" ry="5" fill="#e2e8f0"/>
      <rect x="18" y="22" width="64" height="34" rx="14" fill="#1e293b"/>
      <circle cx="34" cy="39" r="9" fill="#0423a0"/>
      <circle cx="66" cy="39" r="9" fill="#0423a0"/>
    </svg>
  );
}

function AnimatedProductImage({ products, fallback }: {
  products: HttpTypes.StoreProduct[];
  fallback: React.ReactNode;
}) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (products.length <= 1) return;
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((x) => (x + 1) % products.length);
        setVisible(true);
      }, 350);
    }, 3000);
    return () => clearInterval(t);
  }, [products.length]);

  if (!products.length) return <>{fallback}</>;

  const p = products[idx];
  const src = p.thumbnail ?? (p.images as Array<{ url: string }>)?.[0]?.url ?? '/placeholder.png';

  return (
    <div style={{ position: 'relative', width: 110, height: 110, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
      opacity: visible ? 1 : 0, transition: 'opacity 350ms ease' }}>
      <Image src={src} alt={p.title ?? ''} fill className="object-cover" sizes="110px" />
    </div>
  );
}

function PromoCard({ eyebrow, title, headline, image, products, href }: {
  eyebrow: string; title: string; headline: string; image: React.ReactNode;
  products?: HttpTypes.StoreProduct[];
  href?: string;
}) {
  return (
    <div style={{
      background: '#f8fafc', borderRadius: 12, padding: 24, flex: 1,
      display: 'flex', alignItems: 'center', gap: 16, position: 'relative', overflow: 'hidden',
      minHeight: 200,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', color: '#64748b', textTransform: 'uppercase' }}>
          {eyebrow}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginTop: 8, lineHeight: 1.15 }}>{title}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', lineHeight: 1.15, marginBottom: 14 }}>{headline}</div>
        <Link href={href ?? '/products'} style={{
          display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: '#1e293b', paddingBottom: 4,
          borderBottom: '1px solid #1e293b', textDecoration: 'none',
        }}>
          Explore Now
        </Link>
      </div>
      <div style={{ width: 110, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <AnimatedProductImage products={products ?? []} fallback={image} />
      </div>
    </div>
  );
}

export function HeroGrid({ collections, collectionProducts }: HeroGridProps) {
  const slides: SlideData[] = collections?.length
    ? collections.slice(0, 5).map((c) => ({
        eyebrow: c.title.toUpperCase(),
        title: c.title,
        body: 'Discover our curated selection of products.',
        cta: `Shop ${c.title}`,
        href: `/products?collection_id=${c.id}`,
        collectionId: c.id,
      }))
    : FALLBACK_SLIDES;

  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [slides.length]);

  useEffect(() => {
    const t = setInterval(() => setActive((x) => (x + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
      {/* Main slider */}
      <div className="min-h-[320px] sm:min-h-[420px]" style={{ background: '#f8fafc', borderRadius: 12, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          height: '100%',
          width: `${slides.length * 100}%`,
          transform: `translateX(-${active * (100 / slides.length)}%)`,
          transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {slides.map((slide, k) => (
            <div
              key={k}
              className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-12 min-h-[320px] sm:min-h-[420px]"
              style={{
                width: `${100 / slides.length}%`,
                boxSizing: 'border-box',
              }}
            >
              <div style={{ flex: 1, maxWidth: 360 }}>
                <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.14em', color: '#64748b', marginBottom: 16 }}>
                  {slide.eyebrow}
                </div>
                <h1 className="text-3xl sm:text-5xl" style={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05, margin: 0, color: '#1e293b' }}>
                  {slide.title}
                </h1>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginTop: 18, marginBottom: 28 }}>
                  {slide.body}
                </p>
                <Link href={slide.href} style={{
                  display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: '#1e293b', paddingBottom: 4,
                  borderBottom: '1px solid #1e293b', textDecoration: 'none',
                }}>
                  {slide.cta}
                </Link>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CollectionPreview products={collectionProducts?.[slide.collectionId ?? ''] ?? []} />
              </div>
            </div>
          ))}
        </div>

        {/* Pager dots */}
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 2 }}>
          {slides.map((_, k) => (
            <button
              key={k}
              onClick={() => setActive(k)}
              aria-label={`Slide ${k + 1}`}
              style={{
                width: k === active ? 16 : 8, height: 8, borderRadius: 2, border: 0, padding: 0,
                background: k === active ? '#1e293b' : '#cbd5e1', cursor: 'pointer',
                transition: 'all 250ms cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Promo cards */}
      <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
        {collections && collections.length >= 2 ? (
          collections.slice(0, 2).map((col, i) => (
            <PromoCard
              key={col.id}
              eyebrow="Collection"
              title={col.title}
              headline="Shop Now"
              image={i === 0 ? <RunnerSVG /> : <EarbudsSVG />}
              products={collectionProducts?.[col.id]}
              href={`/products?collection_id=${col.id}`}
            />
          ))
        ) : collections && collections.length === 1 ? (
          <>
            <PromoCard
              eyebrow="Collection"
              title={collections[0].title}
              headline="Shop Now"
              image={<RunnerSVG />}
              products={collectionProducts?.[collections[0].id]}
              href={`/products?collection_id=${collections[0].id}`}
            />
            <PromoCard
              eyebrow="Accessories"
              title="Airpods Pro"
              headline="30% OFF"
              image={<EarbudsSVG />}
            />
          </>
        ) : (
          <>
            <PromoCard
              eyebrow="New Arrivals"
              title="Winter Sale"
              headline="20% OFF"
              image={<RunnerSVG />}
            />
            <PromoCard
              eyebrow="Accessories"
              title="Airpods Pro"
              headline="30% OFF"
              image={<EarbudsSVG />}
            />
          </>
        )}
      </div>
    </section>
  );
}
