export const SHIPPING_COSTS = {
  Nairobi: 200,
  Mombasa: 500,
  Kisumu: 450,
  Nakuru: 350,
  Eldoret: 400,
} as const;

export const SHIPPING_CITIES = Object.keys(SHIPPING_COSTS) as Array<
  keyof typeof SHIPPING_COSTS
>;

export const CATEGORIES = [
  'electronics',
  'fashion',
  'home',
  'beauty',
  'sports',
  'books',
  'other',
] as const;

export const CATEGORY_LABELS: Record<typeof CATEGORIES[number], string> = {
  electronics: 'Electronics',
  fashion: 'Fashion',
  home: 'Home',
  beauty: 'Beauty',
  sports: 'Sports',
  books: 'Books',
  other: 'Other',
};

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export const API_BASE_URL =
  process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:9000';
