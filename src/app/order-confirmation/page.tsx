'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useCustomer } from '@/store/customer';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const method = searchParams.get('method');
  const { customer } = useCustomer();
  const isGuest = !customer;

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold mb-2">Order Placed</h1>

      {orderNumber && (
        <p className="text-gray-600 mb-4">
          Order number: <span className="font-bold text-gray-900">{orderNumber}</span>
        </p>
      )}

      {method === 'mpesa' ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
          <p className="font-medium text-green-800 mb-1">M-Pesa Payment Confirmed</p>
          <p className="text-sm text-green-700">
            Your M-Pesa payment has been successfully processed.
          </p>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="font-medium text-blue-800 mb-1">Cash on Delivery</p>
          <p className="text-sm text-blue-700">
            Have the exact amount ready when your order arrives.
          </p>
        </div>
      )}

      <p className="text-gray-500 text-sm mb-8">
        A confirmation email has been sent to your address.
      </p>

      {/* Account prompt for guests */}
      {isGuest && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 text-left">
          <h2 className="font-semibold text-gray-900 mb-2">Stay in the loop on your order</h2>
          <p className="text-sm text-gray-600 mb-5">
            Create a free account to check your delivery status, view order history, and reorder.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/account/register"
              className="flex-1 text-center bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Create Account
            </Link>
            <Link
              href="/account/login"
              className="flex-1 text-center border border-gray-900 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      {/* Actions for logged-in customers */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {!isGuest && (
          <Link
            href="/account"
            className="border border-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            View Orders
          </Link>
        )}
        <Link
          href="/products"
          className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
