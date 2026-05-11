import axios, { type AxiosError } from 'axios';
import { API_BASE_URL } from './constants';
import type { Product } from './types/product';
import type { Order } from './types/order';
import type { AdminLoginInput } from './schemas/admin';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const PUBLISHABLE_KEY = process.env['NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY'] ?? '';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-publishable-api-key': PUBLISHABLE_KEY,
  },
});

client.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string }>) => {
    const message = err.response?.data?.message ?? err.message;
    throw new ApiError(err.response?.status ?? 500, message);
  }
);

function getAdminHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const match = document.cookie.match(/admin_token=([^;]+)/);
  const token = match?.[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export const api = {
  admin: {
    login: async (data: AdminLoginInput): Promise<{ token: string; admin: { id: string; name: string; email: string; role: string } }> => {
      const res = await client.post('/manage/login', data);
      return res.data as { token: string; admin: { id: string; name: string; email: string; role: string } };
    },
    orders: {
      list: async (params?: { status?: string; page?: number; limit?: number }) => {
        const query = new URLSearchParams();
        if (params?.status) query.set('status', params.status);
        if (params?.page) query.set('page', String(params.page));
        if (params?.limit) query.set('limit', String(params.limit));
        const res = await client.get(`/manage/orders?${query.toString()}`, {
          headers: getAdminHeaders(),
        });
        return res.data as { orders: Order[]; total: number };
      },
      update: async (id: string, data: { status: string; shippingNotes?: string }) => {
        const res = await client.patch(`/manage/orders/${id}`, data, {
          headers: getAdminHeaders(),
        });
        return res.data as { order: Order };
      },
    },
    products: {
      list: async () => {
        const res = await client.get('/manage/products', { headers: getAdminHeaders() });
        return res.data as { products: Product[]; total: number };
      },
      create: async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
        const res = await client.post('/manage/products', data, {
          headers: getAdminHeaders(),
        });
        return res.data as { product: Product };
      },
      update: async (id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => {
        const res = await client.patch(`/manage/products/${id}`, data, {
          headers: getAdminHeaders(),
        });
        return res.data as { product: Product };
      },
      delete: async (id: string) => {
        await client.delete(`/manage/products/${id}`, { headers: getAdminHeaders() });
      },
    },
  },
};
