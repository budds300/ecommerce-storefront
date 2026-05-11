'use client';

import { create } from 'zustand';
import type { HttpTypes } from '@medusajs/types';
import { sdk } from '@/lib/sdk';

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface CustomerStore {
  customer: HttpTypes.StoreCustomer | null;
  isLoading: boolean;
  fetchCustomer: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

export const useCustomer = create<CustomerStore>((set) => ({
  customer: null,
  isLoading: false,

  fetchCustomer: async () => {
    set({ isLoading: true });
    try {
      const { customer } = await sdk.store.customer.retrieve();
      set({ customer });
    } catch {
      set({ customer: null });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    await sdk.auth.login('customer', 'emailpass', { email, password });
    const { customer } = await sdk.store.customer.retrieve();
    set({ customer });
  },

  register: async ({ email, password, first_name, last_name }) => {
    const token = await sdk.auth.register('customer', 'emailpass', { email, password });
    const baseUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:9000';
    const publishableKey = process.env['NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY'] ?? '';

    const response = await fetch(`${baseUrl}/store/customers/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-publishable-api-key': publishableKey,
      },
      body: JSON.stringify({ email, first_name, last_name }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(data?.message ?? 'Registration failed.');
    }

    const { customer } = (await response.json()) as { customer: HttpTypes.StoreCustomer };
    set({ customer });
  },

  logout: async () => {
    await sdk.auth.logout();
    set({ customer: null });
  },
}));
