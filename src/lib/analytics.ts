'use client';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
}

function track(eventName: string, params: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', eventName, params);
}

export function trackViewItem(item: AnalyticsItem): void {
  track('view_item', {
    currency: 'KES',
    value: item.price,
    items: [item],
  });
}

export function trackAddToCart(item: AnalyticsItem): void {
  track('add_to_cart', {
    currency: 'KES',
    value: item.price * (item.quantity ?? 1),
    items: [item],
  });
}

export function trackPurchase(params: {
  transactionId: string;
  value: number;
  items: AnalyticsItem[];
}): void {
  track('purchase', {
    transaction_id: params.transactionId,
    currency: 'KES',
    value: params.value,
    items: params.items,
  });
}
