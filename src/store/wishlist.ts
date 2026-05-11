'use client';

import { create } from 'zustand';
import { sdk } from '@/lib/sdk';

export interface WishlistItem {
  id: string;
  product_variant_id: string;
  product_variant?: {
    id?: string;
    title?: string;
    calculated_price?: { calculated_amount?: number };
    product?: {
      id?: string;
      title?: string;
      thumbnail?: string;
      images?: Array<{ url: string }>;
      handle?: string;
    };
  };
}

interface WishlistResponse {
  wishlist: { id: string; items: WishlistItem[] } | null;
}

interface WishlistStore {
  items: WishlistItem[];
  wishlistId: string | null;
  count: number;
  loading: boolean;
  fetchWishlist: () => Promise<void>;
  addItem: (variantId: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  isWished: (variantId: string) => boolean;
  clear: () => void;
}

export const useWishlist = create<WishlistStore>((set, get) => ({
  items: [],
  wishlistId: null,
  count: 0,
  loading: false,

  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const { wishlist } = await sdk.client.fetch<WishlistResponse>(
        '/store/customers/me/wishlists',
        { method: 'GET' }
      );
      if (!wishlist) {
        set({ items: [], wishlistId: null, count: 0 });
        return;
      }
      const items = wishlist.items ?? [];
      set({ items, wishlistId: wishlist.id, count: items.length });
    } catch {
      set({ items: [], wishlistId: null, count: 0 });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (variantId: string) => {
    set({ loading: true });
    try {
      const { wishlist } = await sdk.client.fetch<WishlistResponse>(
        '/store/customers/me/wishlists/items',
        { method: 'POST', body: { variant_id: variantId } }
      );
      if (!wishlist) return;
      const items = wishlist.items ?? [];
      set({ items, wishlistId: wishlist.id, count: items.length });
    } catch {
      // item may already be in wishlist (unique constraint)
    } finally {
      set({ loading: false });
    }
  },

  removeItem: async (itemId: string) => {
    set({ loading: true });
    try {
      const { wishlist } = await sdk.client.fetch<WishlistResponse>(
        `/store/customers/me/wishlists/items/${itemId}`,
        { method: 'DELETE' }
      );
      if (!wishlist) return;
      const items = wishlist.items ?? [];
      set({ items, wishlistId: wishlist.id, count: items.length });
    } catch {
      // silently ignore, item already removed
    } finally {
      set({ loading: false });
    }
  },

  isWished: (variantId: string) => {
    return get().items.some((i) => i.product_variant_id === variantId);
  },

  clear: () => set({ items: [], wishlistId: null, count: 0 }),
}));
