'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { HttpTypes } from '@medusajs/types';
import { useCustomer } from '@/store/customer';
import { sdk } from '@/lib/sdk';
import { formatKES, formatDate } from '@/lib/utils';

const ORDER_STATUS_STYLE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  canceled: 'bg-red-100 text-red-700',
  requires_action: 'bg-orange-100 text-orange-700',
};

const PAYMENT_LABEL: Record<string, { label: string; color: string }> = {
  not_paid:           { label: 'Payment pending',    color: 'text-yellow-600' },
  awaiting:           { label: 'Awaiting payment',   color: 'text-yellow-600' },
  captured:           { label: 'Payment received',   color: 'text-green-600'  },
  partially_captured: { label: 'Partially paid',     color: 'text-yellow-600' },
  refunded:           { label: 'Refunded',            color: 'text-red-500'    },
  partially_refunded: { label: 'Partially refunded', color: 'text-red-500'    },
  canceled:           { label: 'Payment canceled',   color: 'text-red-500'    },
  requires_action:    { label: 'Action required',    color: 'text-orange-600' },
};

const FULFILLMENT_LABEL: Record<string, { label: string; color: string }> = {
  not_fulfilled:        { label: 'Processing',          color: 'text-gray-500'   },
  partially_fulfilled:  { label: 'Partially prepared',  color: 'text-yellow-600' },
  fulfilled:            { label: 'Ready for delivery',  color: 'text-blue-600'   },
  partially_shipped:    { label: 'Partially shipped',   color: 'text-blue-600'   },
  shipped:              { label: 'Shipped',              color: 'text-blue-600'   },
  partially_delivered:  { label: 'Partially delivered', color: 'text-green-600'  },
  delivered:            { label: 'Delivered',            color: 'text-green-600'  },
  canceled:             { label: 'Fulfillment canceled', color: 'text-red-500'   },
};

type StoreOrderExt = HttpTypes.StoreOrder & {
  payment_status?: string;
  fulfillment_status?: string;
};

export default function AccountPage() {
  const router = useRouter();
  const { customer, logout } = useCustomer();
  const [orders, setOrders] = useState<StoreOrderExt[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!customer) return;
    sdk.store.order
      .list({
        fields:
          'id,display_id,status,payment_status,fulfillment_status,total,currency_code,created_at,*items',
      })
      .then(({ orders: o }) => setOrders(o as StoreOrderExt[]))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [customer]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!customer) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Account</h1>
          <p className="text-gray-500 text-sm mt-1">
            {customer.first_name} {customer.last_name} · {customer.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 border rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4">Order History</h2>

        {ordersLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse bg-gray-50 h-20" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-gray-500 mb-4">You haven&apos;t placed any orders yet.</p>
            <Link
              href="/products"
              className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const isOpen = expanded.has(order.id);
              const payment = PAYMENT_LABEL[order.payment_status ?? ''];
              const fulfillment = FULFILLMENT_LABEL[order.fulfillment_status ?? ''];

              return (
                <div key={order.id} className="border rounded-lg overflow-hidden">
                  {/* Summary row */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-sm">Order #{order.display_id}</span>
                        <span className="text-gray-400 text-xs ml-3">{formatDate(order.created_at!)}</span>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                          ORDER_STATUS_STYLE[order.status ?? ''] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                      {order.items?.slice(0, 2).map((item) => (
                        <span key={item.id} className="mr-2">
                          {item.title} ×{item.quantity}
                        </span>
                      ))}
                      {(order.items?.length ?? 0) > 2 && (
                        <span className="text-gray-400">+{(order.items?.length ?? 0) - 2} more</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{formatKES(order.total ?? 0)}</span>
                      <button
                        onClick={() => toggle(order.id)}
                        className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
                      >
                        {isOpen ? 'Hide details' : 'View more'}
                        <svg
                          className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isOpen && (
                    <div className="border-t bg-gray-50 px-4 py-3 space-y-3">
                      {/* Status pills */}
                      <div className="flex flex-wrap gap-4 text-xs">
                        {payment && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400">Payment</span>
                            <span className={`font-medium ${payment.color}`}>{payment.label}</span>
                          </div>
                        )}
                        {fulfillment && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400">Fulfillment</span>
                            <span className={`font-medium ${fulfillment.color}`}>{fulfillment.label}</span>
                          </div>
                        )}
                      </div>

                      {/* Full item list */}
                      {(order.items?.length ?? 0) > 0 && (
                        <div className="space-y-1.5">
                          {order.items!.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs text-gray-600">
                              <span>
                                {item.title}
                                <span className="text-gray-400 ml-1">×{item.quantity}</span>
                              </span>
                              <span>{formatKES((item as { subtotal?: number }).subtotal ?? (item.unit_price ?? 0) * (item.quantity ?? 0))}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
