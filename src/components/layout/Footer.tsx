import Link from 'next/link';

const COLS = [
  { title: 'Shop', items: [{ label: 'All Products', href: '/products' }, { label: 'Deals', href: '/products' }, { label: 'New Arrivals', href: '/products' }] },
  { title: 'Support', items: [{ label: 'Track Order', href: '/track' }, { label: 'Returns', href: '#' }, { label: 'Contact Us', href: '#' }] },
  { title: 'Account', items: [{ label: 'My Account', href: '/account' }, { label: 'Sign In', href: '/account/login' }, { label: 'Register', href: '/account/register' }] },
  { title: 'Legal', items: [{ label: 'Privacy', href: '#' }, { label: 'Terms', href: '#' }, { label: 'Accessibility', href: '#' }] },
];

export function Footer() {
  return (
    <footer style={{ background: '#1e293b', color: '#cbd5e1', padding: '64px 32px 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', gap: 32, marginBottom: 48 }}>
          {/* Brand column */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ width: 32, height: 32, background: '#3b82f6', borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" stroke="#fff" strokeWidth="2" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12 12 4l9 8"/><path d="M5 10v10h14V10"/>
                </svg>
              </span>
              <span style={{ fontWeight: 700, fontSize: 18, color: '#fff' }}>Soft Solutions Store</span>
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
              Consumer technology, certified and shipped fast. Pay with M-Pesa or cash on delivery.
            </p>
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

        <div style={{ borderTop: '1px solid #334155', paddingTop: 24, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', flexWrap: 'wrap', gap: 8 }}>
          <span>© {new Date().getFullYear()} Soft Solutions Store. All rights reserved.</span>
          <span>Secure checkout · M-Pesa accepted</span>
        </div>
      </div>
    </footer>
  );
}
