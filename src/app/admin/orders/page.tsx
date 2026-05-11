'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';
import { formatKES, formatDate } from '@/lib/utils';
import type { Order } from '@/lib/types/order';
import { ORDER_STATUSES } from '@/lib/constants';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.admin.orders.list({
        status: statusFilter || undefined,
        limit: 50,
      });
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = '/admin/login';
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void fetchOrders();
    const interval = setInterval(() => void fetchOrders(), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.admin.orders.update(orderId, { status: newStatus });
      await fetchOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  const TRANSITIONS: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Orders ({total})</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">No orders found.</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium">Order</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">City</th>
                <th className="text-left px-4 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium">Payment</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const allowedTransitions = TRANSITIONS[order.status] ?? [];
                return (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p>{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3">{order.shippingCity}</td>
                    <td className="px-4 py-3 font-medium">{formatKES(order.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span>{order.paymentMethod === 'mpesa' ? 'M-Pesa' : 'COD'}</span>
                      <span
                        className={`ml-1 text-xs px-1.5 py-0.5 rounded ${
                          order.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] ?? ''}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {allowedTransitions.length > 0 && (
                        <select
                          disabled={updatingId === order.id}
                          onChange={(e) => {
                            if (e.target.value) {
                              void handleStatusUpdate(order.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="border rounded px-2 py-1 text-xs disabled:opacity-50"
                        >
                          <option value="">Update</option>
                          {allowedTransitions.map((s) => (
                            <option key={s} value={s}>
                              Mark {s}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
