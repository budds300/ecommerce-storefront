import type { HttpTypes } from '@medusajs/types';

export interface StockStatus {
  inStock: boolean;
  isBackorder: boolean;
  stockCount: number; // -1 = unmanaged (infinite)
}

export function getStockStatus(
  variant: HttpTypes.StoreProductVariant | undefined
): StockStatus {
  if (!variant) return { inStock: false, isBackorder: false, stockCount: 0 };

  // manage_inventory: false → always in stock (no tracking)
  if (!variant.manage_inventory) {
    return { inStock: true, isBackorder: false, stockCount: -1 };
  }

  const qty = variant.inventory_quantity;

  // allow_backorder: true → always purchasable; mark as backorder only when qty is a known 0
  if (variant.allow_backorder) {
    return { inStock: true, isBackorder: qty != null && qty <= 0, stockCount: qty ?? 0 };
  }

  return { inStock: (qty ?? 0) > 0, isBackorder: false, stockCount: qty ?? 0 };
}
