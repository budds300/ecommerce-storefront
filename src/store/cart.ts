'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HttpTypes } from '@medusajs/types';

export interface CartItem {
  product: HttpTypes.StoreProduct;
  variantId: string;
  quantity: number;
  price: number;
  title: string;
  image: string;
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (product: HttpTypes.StoreProduct, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
}

const derive = (items: CartItem[]) => ({
  totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
  subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
});

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,

      addItem: (product, quantity = 1) => {
        const variant = product.variants?.[0];
        if (!variant?.id) return;

        const variantId = variant.id;
        const price = variant.calculated_price?.calculated_amount ?? 0;
        const image = product.thumbnail ?? product.images?.[0]?.url ?? '';

        set((state) => {
          const existing = state.items.find((i) => i.variantId === variantId);
          const newItems = existing
            ? state.items.map((i) =>
                i.variantId === variantId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              )
            : [
                ...state.items,
                { product, variantId, quantity, price, title: product.title ?? '', image },
              ];
          return { items: newItems, ...derive(newItems) };
        });
      },

      removeItem: (variantId) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.variantId !== variantId);
          return { items: newItems, ...derive(newItems) };
        });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set((state) => {
          const newItems = state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          );
          return { items: newItems, ...derive(newItems) };
        });
      },

      clearCart: () => set({ items: [], totalItems: 0, subtotal: 0 }),
    }),
    { name: 'cart-store' }
  )
);
