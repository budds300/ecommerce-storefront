function TruckIcon() {
  return (
    <svg width="32" height="32" stroke="currentColor" strokeWidth="1.5" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
      <path d="M15 18H9"/>
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62L18.3 8.38A1 1 0 0 0 17.52 8H14"/>
      <circle cx="17" cy="18" r="2"/>
      <circle cx="7" cy="18" r="2"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="32" height="32" stroke="currentColor" strokeWidth="1.5" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="32" height="32" stroke="currentColor" strokeWidth="1.5" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/>
    </svg>
  );
}

const ITEMS = [
  { title: 'Fast Delivery', sub: 'Nationwide Kenya', icon: <TruckIcon /> },
  { title: '365 Days', sub: 'Free returns', icon: <ClockIcon /> },
  { title: 'Secure Payment', sub: 'M-Pesa', icon: <CardIcon /> },
];

export function TrustBar() {
  return (
    <section style={{
      background: '#f8fafc', borderRadius: 12, padding: 18,
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', alignItems: 'center',
    }}>
      {ITEMS.map((item, i) => (
        <div key={item.title} style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '6px 22px',
          borderRight: i < ITEMS.length - 1 ? '1px solid #e2e8f0' : 'none',
        }}>
          <span style={{ color: '#1e293b', flexShrink: 0 }}>{item.icon}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', lineHeight: 1.2 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{item.sub}</div>
          </div>
        </div>
      ))}
    </section>
  );
}
