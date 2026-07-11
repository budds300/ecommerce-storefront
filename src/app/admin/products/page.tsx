'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, ApiError } from '@/lib/api';
import { formatKES } from '@/lib/utils';
import { createProductSchema, type CreateProductInput, CATEGORIES } from '@/lib/schemas/product';
import type { Product } from '@/lib/types/product';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.admin.products.list();
      setProducts(data.products);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = '/admin/login';
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const openCreate = () => {
    setEditProduct(null);
    reset({});
    setShowForm(true);
    setFormError(null);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    reset({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      images: product.images,
      category: product.category,
    });
    setShowForm(true);
    setFormError(null);
  };

  const onSubmit = async (data: CreateProductInput) => {
    setFormError(null);
    try {
      if (editProduct) {
        await api.admin.products.update(editProduct.id, data);
      } else {
        await api.admin.products.create(data);
      }
      setShowForm(false);
      reset({});
      await fetchProducts();
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError('Something went wrong.');
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.admin.products.delete(id);
      await fetchProducts();
    } catch {
      alert('Failed to delete product.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Products ({products.length})</h1>
        <button
          onClick={openCreate}
          className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
        >
          Add Product
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold mb-4">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  {...register('name')}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full border rounded px-3 py-2 text-sm resize-none"
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (KES)</label>
                  <input
                    {...register('price', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input
                    {...register('stock', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                  {errors.stock && (
                    <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select {...register('category')} className="w-full border rounded px-3 py-2 text-sm">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  {...register('images.0')}
                  type="url"
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="https://..."
                />
                {errors.images && (
                  <p className="text-red-500 text-xs mt-1">{errors.images.message}</p>
                )}
              </div>
              {formError && <p className="text-red-500 text-sm">{formError}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-900 text-white py-2 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editProduct ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); reset({}); }}
                  className="flex-1 border py-2 rounded text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading products...</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Price</th>
                <th className="text-left px-4 py-3 font-medium">Stock</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{product.category}</td>
                  <td className="px-4 py-3">{formatKES(product.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        product.stock === 0
                          ? 'bg-red-100 text-red-700'
                          : product.stock <= 5
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="text-xs text-gray-600 hover:text-gray-900 underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => void handleDelete(product.id, product.name)}
                        className="text-xs text-red-600 hover:text-red-800 underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
