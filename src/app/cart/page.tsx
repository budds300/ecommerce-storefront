'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '@/store/cart';
import { formatKES } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-3">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Add some products to get started.</p>
        <Link
          href="/products"
          className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Your Cart</h1>
      <p className="text-sm text-gray-500 mb-8">
        {totalItems} {totalItems === 1 ? 'item' : 'items'}
      </p>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-4 border rounded-lg p-4">
              <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                <Image
                  src={item.image || '/placeholder.png'}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.product.id}`}
                  className="font-medium text-sm hover:underline line-clamp-2"
                >
                  {item.title}
                </Link>
                <p className="text-gray-900 font-bold text-sm mt-1">{formatKES(item.price)}</p>

                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="p-1.5 hover:bg-gray-100 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="p-1.5 hover:bg-gray-100 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="text-right text-sm font-bold flex-shrink-0">
                {formatKES(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-20 border rounded-lg p-5">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm mb-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between text-gray-600">
                  <span className="truncate pr-2">
                    {item.title} <span className="text-gray-400">×{item.quantity}</span>
                  </span>
                  <span className="flex-shrink-0">{formatKES(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 mb-5">
              <div className="flex justify-between font-bold">
                <span>Subtotal</span>
                <span>{formatKES(subtotal)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Shipping calculated at checkout</p>
            </div>

            <Link
              href="/checkout"
              className="block w-full text-center bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/products"
              className="block w-full text-center text-sm text-gray-600 hover:text-gray-900 mt-3 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
