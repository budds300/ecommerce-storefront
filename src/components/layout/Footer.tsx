import Link from 'next/link';
import Image from 'next/image';

const COLS = [
  { title: 'Shop', items: [{ label: 'All Products', href: '/products' }, { label: 'Deals', href: '/products' }, { label: 'New Arrivals', href: '/products' }] },
  { title: 'Support', items: [{ label: 'Track Order', href: '/track' }, { label: 'Returns', href: '/returns' }, { label: 'Contact Us', href: '/contact' }] },
  { title: 'Account', items: [{ label: 'My Account', href: '/account' }, { label: 'Sign In', href: '/account/login' }, { label: 'Register', href: '/account/register' }] },
  { title: 'Legal', items: [{ label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }, { label: 'Accessibility', href: '/accessibility' }] },
];

export function Footer() {
  return (
    <footer className="px-4 sm:px-8" style={{ background: '#1e293b', color: '#cbd5e1', paddingTop: 48, paddingBottom: 32 }}>
      <div style={{ maxWidth: 1600, margin: '0 auto' }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-x-6 gap-y-10 sm:gap-8 mb-10 sm:mb-12">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 16 }}>
              <Image src="/soft-solutions-logo-dark.png" alt="Soft Solutions" width={721} height={240} style={{ height: 28, width: 'auto' }} />
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
              Consumer technology, certified and shipped fast. Pay with M-Pesa or cash on delivery.
            </p>
            <a
              href="https://softsolutions.co.ke/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#8b93ff', textDecoration: 'none', marginTop: 12 }}
            >
              Visit softsolutions.co.ke
              <svg width="13" height="13" stroke="currentColor" strokeWidth="2" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/>
              </svg>
            </a>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {['Twitter', 'Instagram', 'YouTube', 'Facebook'].map((s) => (
                <a key={s} aria-label={s} href="#" style={{
                  width: 36, height: 36, border: '1px solid #334155', borderRadius: 8,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: '#cbd5e1', cursor: 'pointer', textDecoration: 'none',
                }}>
                  <svg width="16" height="16" stroke="currentColor" strokeWidth="1.75" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="6"/>
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {COLS.map((col) => (
            <div key={col.title}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: '#fff', textTransform: 'uppercase', marginBottom: 16 }}>
                {col.title}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} style={{ fontSize: 13, color: '#cbd5e1', textDecoration: 'none', display: 'block' }}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col sm:flex-row items-center sm:items-center sm:justify-between text-center sm:text-left"
          style={{ borderTop: '1px solid #334155', paddingTop: 24, fontSize: 12, color: '#64748b', gap: 8 }}
        >
          <span>© {new Date().getFullYear()} Soft Solutions Store. All rights reserved.</span>
          <span>Secure checkout · M-Pesa accepted</span>
        </div>
      </div>
    </footer>
  );
}
