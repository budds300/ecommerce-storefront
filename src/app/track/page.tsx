'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import type { HttpTypes } from '@medusajs/types';
import { sdk } from '@/lib/sdk';
import { formatKES, formatDate } from '@/lib/utils';

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'] as const;
type ProgressStep = (typeof STATUS_STEPS)[number];

const STATUS_STEP_LABELS: Record<ProgressStep, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

function deriveProgressStep(order: HttpTypes.StoreOrder): ProgressStep | 'cancelled' {
  if (order.status === 'canceled') return 'cancelled';
  if (order.fulfillment_status === 'delivered') return 'delivered';
  if (
    order.fulfillment_status === 'partially_delivered' ||
    order.fulfillment_status === 'shipped'
  )
    return 'shipped';
  if (order.payment_status === 'captured') return 'confirmed';
  return 'pending';
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [displayId, setDisplayId] = useState(searchParams.get('order') ?? '');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<HttpTypes.StoreOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prefilled = searchParams.get('order');
    if (prefilled) setDisplayId(prefilled);
  }, [searchParams]);

  const handleTrack = async () => {
    if (!displayId.trim() || !email.trim()) {
      setError('Please enter both order number and email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { orders } = await sdk.store.order.list({
        display_id: parseInt(displayId.trim(), 10),
        fields: 'id,display_id,status,fulfillment_status,payment_status,email,total,currency_code,created_at,*items',
      } as Record<string, unknown>);

      const order = orders.find(
        (o) => o.email?.toLowerCase() === email.trim().toLowerCase()
      );

      if (!order) {
        setError('Order not found. Please check your order number and email address.');
        return;
      }

      setResult(order);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progressStep = result ? deriveProgressStep(result) : null;
  const currentStepIndex =
    progressStep && progressStep !== 'cancelled'
      ? STATUS_STEPS.indexOf(progressStep as ProgressStep)
      : -1;

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Track Your Order</h1>
      <p className="text-gray-500 text-sm mb-8">
        Enter the order number and the email address used at checkout.
      </p>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Order Number</label>
          <input
            value={displayId}
            onChange={(e) => setDisplayId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="e.g. 1001"
            inputMode="numeric"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="jane@example.com"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleTrack}
          disabled={loading}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Searching…' : 'Track Order'}
        </button>
      </div>

      {result && (
        <div className="border rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="font-bold text-gray-900">Order #{result.display_id}</p>
              <p className="text-xs text-gray-500 mt-1">{formatDate(result.created_at!)}</p>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                progressStep === 'delivered'
                  ? 'bg-green-100 text-green-700'
                  : progressStep === 'cancelled'
                  ? 'bg-red-100 text-red-700'
                  : progressStep === 'shipped'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {progressStep === 'cancelled' ? 'Cancelled' : (progressStep ?? result.status)}
            </span>
          </div>

          {progressStep !== 'cancelled' && (
            <div className="flex items-center justify-between mb-6">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        i <= currentStepIndex
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {i <= currentStepIndex ? (
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className="text-xs mt-1 text-gray-500 whitespace-nowrap">
                      {STATUS_STEP_LABELS[step]}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div
                      className={`h-0.5 w-6 sm:w-10 mx-1 mb-4 transition-colors ${
                        i < currentStepIndex ? 'bg-gray-900' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-4 space-y-2">
            <p className="text-sm font-medium mb-3">Items</p>
            {result.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-700">
                <span>
                  {item.title}{' '}
                  <span className="text-gray-400">×{item.quantity}</span>
                </span>
                <span className="font-medium">
                  {formatKES(item.subtotal ?? 0)}
                </span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-sm pt-3 border-t">
              <span>Total</span>
              <span>{formatKES(result.total ?? 0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading…</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
