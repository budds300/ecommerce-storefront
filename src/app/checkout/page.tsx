'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { useCart } from '@/store/cart';
import { useCustomer } from '@/store/customer';
import { sdk } from '@/lib/sdk';
import { formatKES } from '@/lib/utils';

type ShippingOption = { id: string; name: string; amount: number | null; fulfillmentSetType: string };
type DeliveryType = 'delivery' | 'pickup';

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerPhone: z.string().regex(/^(0[0-9]{9}|254[0-9]{9})$/, { message: 'Enter a valid Kenyan phone number (e.g. 0712345678)' }),
  customerEmail: z.string().email('Invalid email address'),
  city: z.string().optional(),
  shippingAddress: z.string().optional(),
  shippingLandmark: z.string().optional(),
  shippingNotes: z.string().optional(),
  paymentMethod: z.enum(['mpesa', 'cod']),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

function toIntlPhone(phone: string): string {
  const p = phone.replace(/\s+/g, '');
  return p.startsWith('0') ? '254' + p.slice(1) : p;
}

// ── Design primitives ────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', height: 40, padding: '0 14px', border: '1px solid #e2e8f0',
  borderRadius: 8, fontSize: 14, color: '#1e293b', background: '#fff',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle, height: 72, padding: 12, resize: 'vertical',
};

function StepCard({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 6, background: '#1e293b', color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 600, flexShrink: 0,
        }}>{n}</span>
        <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#1e293b' }}>{title}</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </section>
  );
}

function Field({ label, hint, error, children }: {
  label: string; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 11, color: '#94a3b8' }}>{hint}</span>}
      {error && <span style={{ fontSize: 11, color: '#ef4444' }}>{error}</span>}
    </label>
  );
}

function SummaryRow({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13 }}>
      <span style={{ color: muted ? '#94a3b8' : '#475569' }}>{label}:</span>
      <span style={{ fontFeatureSettings: '"tnum"', color: muted ? '#94a3b8' : '#1e293b', fontWeight: bold ? 700 : 500 }}>
        {value}
      </span>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg width="22" height="22" stroke="currentColor" strokeWidth="1.5" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12 12 4l9 8"/><path d="M5 10v10h14V10"/>
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="22" height="22" stroke="currentColor" strokeWidth="1.5" fill="none" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

// ── Page component ──────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { customer, fetchCustomer } = useCustomer();
  const isAuthenticated = !!customer?.email;
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [mpesaCartId, setMpesaCartId] = useState<string | null>(null);

  const [emailVerified, setEmailVerified] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [magicSending, setMagicSending] = useState(false);
  const [magicError, setMagicError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const [allOptions, setAllOptions] = useState<ShippingOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>('');
  const [selectedPickupId, setSelectedPickupId] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setError,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'mpesa', city: 'Nairobi' },
  });

  const paymentMethod = watch('paymentMethod');
  const city = watch('city');
  const phone = watch('customerPhone');
  const customerEmail = watch('customerEmail');

  const deliveryOptions = allOptions.filter((o) => o.fulfillmentSetType !== 'pickup');
  const pickupOptions   = allOptions.filter((o) => o.fulfillmentSetType === 'pickup');

  const activeOptionId = deliveryType === 'delivery' ? selectedDeliveryId : selectedPickupId;
  const activeOption = allOptions.find((o) => o.id === activeOptionId);
  const shippingCost = activeOption?.amount ?? 0;
  const total = subtotal + shippingCost;

  useEffect(() => {
    fetchCustomer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function loadOptions() {
      try {
        const { regions } = await sdk.store.region.list();
        const regionId = regions[0]?.id;
        if (!regionId) return;
        const { cart: tempCart } = await sdk.store.cart.create({ region_id: regionId });
        const { shipping_options } = await sdk.store.fulfillment.listCartOptions(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { cart_id: tempCart.id, fields: '*service_zone,*service_zone.fulfillment_set' } as any
        );
        const options = shipping_options.map((o) => ({
          id: o.id,
          name: o.name ?? 'Shipping',
          amount: o.amount ?? null,
          fulfillmentSetType: o.service_zone?.fulfillment_set?.type ?? 'shipping',
        }));
        setAllOptions(options);
        const delivery = options.filter((o) => o.fulfillmentSetType !== 'pickup');
        const pickup   = options.filter((o) => o.fulfillmentSetType === 'pickup');
        if (delivery[0]) setSelectedDeliveryId(delivery[0].id);
        if (pickup[0]) setSelectedPickupId(pickup[0].id);
      } catch {
        // stays empty — submit will surface the error
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    if (!customer?.email) return;
    setValue('customerEmail', customer.email);
    const name = [customer.first_name, customer.last_name].filter(Boolean).join(' ');
    if (name) setValue('customerName', name);
    if (customer.phone && /^254[0-9]{9}$/.test(customer.phone)) {
      setValue('customerPhone', customer.phone);
    }
    setEmailVerified(true);
  }, [customer, setValue]);

  useEffect(() => {
    if (isAuthenticated) return;
    setEmailVerified(false);
    setMagicSent(false);
    setMagicError(null);
    setCountdown(0);
  }, [customerEmail, isAuthenticated]);

  useEffect(() => {
    function checkVerified() {
      try {
        const raw = localStorage.getItem('ml_verified');
        if (!raw) return;
        const { email, ts } = JSON.parse(raw) as { email: string; ts: number };
        const FIVE_MIN = 5 * 60 * 1000;
        if (Date.now() - ts > FIVE_MIN) {
          localStorage.removeItem('ml_verified');
          return;
        }
        if (email && !isAuthenticated) {
          setValue('customerEmail', email);
          setEmailVerified(true);
          localStorage.removeItem('ml_verified');
        }
      } catch {
        localStorage.removeItem('ml_verified');
      }
    }
    checkVerified();
    const onStorage = (e: StorageEvent) => { if (e.key === 'ml_verified') checkVerified(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (!mpesaCartId) return;
    let cancelled = false;
    const start = Date.now();
    const TIMEOUT_MS = 90_000;

    const poll = async () => {
      if (cancelled) return;
      if (Date.now() - start > TIMEOUT_MS) {
        setMpesaCartId(null);
        setSubmitting(false);
        setFormError('M-Pesa payment timed out. Please try again.');
        return;
      }
      try {
        const { cart: c } = await sdk.store.cart.retrieve(mpesaCartId, {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fields: '+payment_collection.payment_sessions.*' as any,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = (c as any)?.payment_collection?.payment_sessions?.[0];
        if (session?.status === 'captured' || session?.status === 'authorized') {
          const result = await sdk.store.cart.complete(mpesaCartId);
          if (result.type === 'order' && result.order) {
            clearCart();
            router.push(`/order-confirmation?order=${result.order.display_id}&method=mpesa`);
          }
          return;
        }
      } catch { /* keep polling */ }
      setTimeout(poll, 3000);
    };

    setTimeout(poll, 3000);
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mpesaCartId]);

  async function handleSendMagicLink() {
    setMagicSending(true);
    setMagicError(null);
    try {
      const res = await fetch('/api/magic/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail, context: 'checkout', redirectTo: '/checkout' }),
      });
      const data = await res.json() as { success: boolean; message?: string };
      if (data.success) {
        setMagicSent(true);
        setCountdown(60);
      } else {
        setMagicError(data.message ?? 'Failed to send link.');
      }
    } catch {
      setMagicError('Failed to send link. Try again.');
    } finally {
      setMagicSending(false);
    }
  }

  if (mpesaCartId) {
    return (
      <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <div style={{
            width: 40, height: 40, border: '4px solid #e2e8f0', borderTopColor: '#1e293b',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }} />
          <div>
            <p style={{ fontWeight: 600, fontSize: 18, margin: 0, color: '#1e293b' }}>Waiting for M-Pesa confirmation</p>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>
              Check your phone and enter your M-Pesa PIN to confirm payment.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setMpesaCartId(null); setSubmitting(false); }}
            style={{ fontSize: 13, color: '#94a3b8', background: 'none', border: 0, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Cancel
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Your cart is empty</h1>
        <Link href="/products" style={{
          display: 'inline-block', background: '#1e293b', color: '#fff',
          padding: '12px 28px', borderRadius: 9999, textDecoration: 'none',
          fontWeight: 600, fontSize: 14,
        }}>
          Browse Products
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutFormData) => {
    if (!activeOptionId) {
      setFormError('Please select a shipping method.');
      return;
    }

    if (deliveryType === 'delivery') {
      let hasError = false;
      if (!data.city || data.city.trim().length < 2) {
        setError('city', { message: 'City is required' });
        hasError = true;
      }
      if (!data.shippingAddress || data.shippingAddress.trim().length < 10) {
        setError('shippingAddress', { message: 'Address must be at least 10 characters' });
        hasError = true;
      }
      if (!data.shippingLandmark || data.shippingLandmark.trim().length < 3) {
        setError('shippingLandmark', { message: 'Landmark must be at least 3 characters' });
        hasError = true;
      }
      if (hasError) return;
    }

    if (data.paymentMethod === 'cod' && !emailVerified) {
      setFormError('Please verify your email to place a COD order.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const { regions } = await sdk.store.region.list();
      const region = regions[0];
      if (!region) throw new Error('Store is not set up yet. Please contact us.');

      const { cart } = await sdk.store.cart.create({ region_id: region.id });

      for (const item of items) {
        await sdk.store.cart.createLineItem(cart.id, {
          variant_id: item.variantId,
          quantity: item.quantity,
        });
      }

      const nameParts = data.customerName.trim().split(' ');
      const firstName = nameParts[0] ?? data.customerName;
      const lastName = nameParts.slice(1).join(' ') || '';

      await sdk.store.cart.update(cart.id, {
        email: data.customerEmail,
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          address_1: deliveryType === 'pickup' ? (activeOption?.name ?? 'Pickup') : (data.shippingAddress ?? ''),
          address_2: deliveryType === 'pickup' ? '' : (data.shippingLandmark ?? ''),
          city: deliveryType === 'pickup' ? 'Pickup' : (data.city ?? ''),
          country_code: 'ke',
          phone: toIntlPhone(data.customerPhone),
        },
      });

      await sdk.store.cart.addShippingMethod(cart.id, { option_id: activeOptionId });

      const { cart: freshCart } = await sdk.store.cart.retrieve(cart.id);

      const providerId =
        data.paymentMethod === 'mpesa' ? 'pp_intasend_intasend' : 'pp_system_default';
      const sessionData = data.paymentMethod === 'mpesa'
        ? { phone: toIntlPhone(data.customerPhone), email: data.customerEmail }
        : {};
      await sdk.store.payment.initiatePaymentSession(freshCart, { provider_id: providerId, data: sessionData });

      if (data.paymentMethod === 'mpesa') {
        setMpesaCartId(cart.id);
        return;
      }

      const result = await sdk.store.cart.complete(cart.id);

      if (result.type === 'order' && result.order) {
        clearCart();
        router.push(
          `/order-confirmation?order=${result.order.display_id}&method=${data.paymentMethod}`
        );
      } else {
        throw new Error('Could not place your order. Please try again.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setFormError(message);
      toast.error('Order failed', { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 32px 80px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 32, letterSpacing: '-0.01em' }}>
        Checkout
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        {/* ── Left: step cards ── */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Step 1 — Contact */}
          <StepCard n={1} title="Contact Details">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Full Name" error={errors.customerName?.message}>
                <input {...register('customerName')} style={inputStyle} placeholder="Jane Mwangi" />
              </Field>
              <Field label="Email Address" error={errors.customerEmail?.message}>
                <input
                  {...register('customerEmail')}
                  type="email"
                  readOnly={isAuthenticated || emailVerified}
                  style={{
                    ...inputStyle,
                    ...(isAuthenticated || emailVerified ? { background: '#f8fafc', color: '#94a3b8', cursor: 'default' } : {}),
                  }}
                  placeholder="jane@example.com"
                />
                {isAuthenticated && (
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Signed in — email is locked to your account</span>
                )}
              </Field>
            </div>

            <Field label="Phone Number (M-Pesa)" hint="Format: 07XXXXXXXX or 01XXXXXXXX" error={errors.customerPhone?.message}>
              <input {...register('customerPhone')} style={inputStyle} placeholder="0712345678" />
            </Field>

            {/* Magic link verification */}
            {paymentMethod === 'cod' && !emailVerified && !isAuthenticated && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {!magicSent ? (
                  <>
                    <button
                      type="button"
                      disabled={magicSending || !customerEmail}
                      onClick={handleSendMagicLink}
                      style={{
                        height: 40, border: '1px solid #1e293b', borderRadius: 8, background: '#fff',
                        color: '#1e293b', fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
                        cursor: magicSending || !customerEmail ? 'not-allowed' : 'pointer',
                        opacity: magicSending || !customerEmail ? 0.5 : 1,
                      }}
                    >
                      {magicSending ? 'Sending…' : 'Send Verification Link'}
                    </button>
                    {magicError && <span style={{ fontSize: 11, color: '#ef4444' }}>{magicError}</span>}
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      We&apos;ll send a one-click verification link to your email
                    </span>
                  </>
                ) : (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg style={{ width: 20, height: 20, color: '#3b82f6', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1e40af' }}>Check your inbox</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#1d4ed8', margin: 0, paddingLeft: 28 }}>
                      We sent a verification link to <strong>{customerEmail}</strong>. Click it to confirm your email.
                    </p>
                    <div style={{ paddingLeft: 28 }}>
                      <button
                        type="button"
                        disabled={magicSending || countdown > 0}
                        onClick={handleSendMagicLink}
                        style={{ fontSize: 12, color: '#3b82f6', background: 'none', border: 0, cursor: countdown > 0 ? 'not-allowed' : 'pointer', textDecoration: 'underline', opacity: countdown > 0 ? 0.5 : 1 }}
                      >
                        {countdown > 0 ? `Resend in ${countdown}s` : "Didn't receive it? Resend"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'cod' && emailVerified && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: 13 }}>
                <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span style={{ fontWeight: 600 }}>Email verified</span>
              </div>
            )}
          </StepCard>

          {/* Step 2 — Delivery */}
          <StepCard n={2} title="Delivery Method">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {([
                ['delivery', 'Home Delivery', 'Delivered to your doorstep', <HomeIcon key="home" />] as const,
                ['pickup', 'Pickup Station', 'Collect from a nearby point', <PinIcon key="pin" />] as const,
              ]).map(([type, title, sub, icon]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDeliveryType(type)}
                  style={{
                    padding: 18, borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                    border: deliveryType === type ? '2px solid #1e293b' : '1px solid #e2e8f0',
                    background: deliveryType === type ? '#1e293b' : '#fff',
                    color: deliveryType === type ? '#fff' : '#1e293b',
                    fontFamily: 'inherit',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)',
                  }}
                >
                  {icon}
                  <span style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{title}</span>
                  <span style={{ fontSize: 12, opacity: 0.75 }}>{sub}</span>
                </button>
              ))}
            </div>

            {/* Delivery options */}
            {deliveryType === 'delivery' && (
              <>
                {loadingOptions ? (
                  <p style={{ fontSize: 13, color: '#64748b' }}>Loading delivery options…</p>
                ) : deliveryOptions.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#ef4444' }}>No delivery options available. Try pickup instead.</p>
                ) : deliveryOptions.length > 1 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', margin: 0 }}>Select delivery option</p>
                    {deliveryOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedDeliveryId(option.id)}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                          border: selectedDeliveryId === option.id ? '1px solid #1e293b' : '1px solid #e2e8f0',
                          background: '#fff', fontFamily: 'inherit',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#1e293b' }}>
                          <span style={{
                            width: 18, height: 18, borderRadius: 9999, border: '1px solid #cbd5e1',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {selectedDeliveryId === option.id && <span style={{ width: 10, height: 10, borderRadius: 9999, background: '#1e293b' }}/>}
                          </span>
                          {option.name}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                          {option.amount ? formatKES(option.amount) : 'Free'}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
                    <span style={{ fontWeight: 500, color: '#1e293b' }}>{deliveryOptions[0].name}</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{deliveryOptions[0].amount ? formatKES(deliveryOptions[0].amount) : 'Free'}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="City / Town" error={errors.city?.message}>
                    <input {...register('city')} style={inputStyle} placeholder="Nairobi" />
                  </Field>
                  <Field label="Landmark" error={errors.shippingLandmark?.message}>
                    <input {...register('shippingLandmark')} style={inputStyle} placeholder="Near Nakumatt, opposite Total petrol station" />
                  </Field>
                </div>
                <Field label="Delivery Address" error={errors.shippingAddress?.message}>
                  <input {...register('shippingAddress')} style={inputStyle} placeholder="Street, building, apartment number" />
                </Field>
                <Field label="Delivery Notes (Optional)">
                  <textarea {...register('shippingNotes')} style={textareaStyle} placeholder="Any special delivery instructions" />
                </Field>
              </>
            )}

            {deliveryType === 'pickup' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {loadingOptions ? (
                  <p style={{ fontSize: 13, color: '#64748b' }}>Loading pickup locations…</p>
                ) : pickupOptions.length === 0 ? (
                  <div style={{ padding: 14, background: '#f8fafc', borderRadius: 8, fontSize: 13, color: '#475569' }}>
                    You&apos;ll select your pickup station after placing the order. Email confirmation includes the address and pickup window.
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Select a pickup location near you</p>
                    {pickupOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedPickupId(option.id)}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16,
                          borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                          border: selectedPickupId === option.id ? '1.5px solid #1e293b' : '1px solid #e2e8f0',
                          background: '#fff', fontFamily: 'inherit',
                        }}
                      >
                        <span style={{ width: 18, height: 18, borderRadius: 9999, border: '1px solid #cbd5e1', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 }}>
                          {selectedPickupId === option.id && <span style={{ width: 10, height: 10, borderRadius: 9999, background: '#1e293b' }}/>}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{option.name}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{option.amount ? formatKES(option.amount) : 'Free'}</span>
                          </div>
                          <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
                            We will notify you on {phone || 'your number'} when ready
                          </p>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </StepCard>

          {/* Step 3 — Payment */}
          <StepCard n={3} title="Payment Method">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {([
                ['mpesa', 'M-Pesa', 'You will receive an STK push on your phone',
                  <span key="mpesa" style={{ padding: '4px 8px', borderRadius: 4, background: '#16a34a', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>M-PESA</span>
                ],
                ['cod', 'Cash on Delivery', 'Pay when your order arrives — email verification required', null],
              ] as const).map(([value, title, sub, badge]) => (
                <label
                  key={value}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                    border: paymentMethod === value ? '1.5px solid #1e293b' : '1px solid #e2e8f0',
                    background: '#fff',
                  }}
                >
                  <span style={{ width: 18, height: 18, borderRadius: 9999, border: '1px solid #cbd5e1', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {paymentMethod === value && <span style={{ width: 10, height: 10, borderRadius: 9999, background: '#1e293b' }}/>}
                  </span>
                  <input type="radio" {...register('paymentMethod')} value={value} style={{ display: 'none' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{title}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{sub}</div>
                  </div>
                  {badge}
                </label>
              ))}
            </div>

            <Field label="I have a voucher">
              <input style={inputStyle} placeholder="Enter voucher code" />
            </Field>
          </StepCard>

          {/* Error */}
          {formError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: 13 }}>
              {formError}
            </div>
          )}

          {/* CTA */}
          <button
            type="submit"
            disabled={submitting || loadingOptions || (paymentMethod === 'cod' && !emailVerified)}
            style={{
              height: 52, border: 0, borderRadius: 9999,
              background: submitting || loadingOptions ? '#94a3b8' : '#1e293b',
              color: '#fff', fontFamily: 'inherit', fontWeight: 600, fontSize: 15,
              cursor: submitting || loadingOptions ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 8px 18px rgba(30,41,59,0.25)',
              transition: 'transform 150ms, box-shadow 150ms, background 150ms',
              opacity: (paymentMethod === 'cod' && !emailVerified) ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!submitting && !loadingOptions) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(30,41,59,0.32)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 18px rgba(30,41,59,0.25)';
            }}
          >
            {submitting
              ? 'Placing Order…'
              : paymentMethod === 'mpesa'
              ? `Pay ${formatKES(total)} with M-Pesa`
              : `Place Order — ${formatKES(total)} COD`}
          </button>
        </form>

        {/* ── Right: order summary ── */}
        <aside style={{ position: 'sticky', top: 80, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 22 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Your order</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
            {items.map((item) => (
              <div key={item.variantId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#1e293b' }}>
                <span><strong>{item.quantity} ×</strong> {item.title}</span>
                <span style={{ fontFeatureSettings: '"tnum"', flexShrink: 0, marginLeft: 8 }}>{formatKES(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <SummaryRow label="Subtotal" value={formatKES(subtotal)} />
          <SummaryRow
            label={deliveryType === 'pickup'
              ? `Pickup${activeOption ? ` — ${activeOption.name}` : ''}`
              : `Delivery${city ? ` to ${city}` : ''}${activeOption && deliveryOptions.length > 1 ? ` (${activeOption.name})` : ''}`}
            value={loadingOptions ? '…' : activeOption?.amount ? formatKES(shippingCost) : 'Free'}
            muted={!shippingCost}
          />
          <SummaryRow label="Discount" value="—" muted />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', fontFeatureSettings: '"tnum"' }}>{formatKES(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
