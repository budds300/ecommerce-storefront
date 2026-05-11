import { z } from 'zod';

export const CATEGORIES = [
  'electronics',
  'fashion',
  'home',
  'beauty',
  'sports',
  'books',
  'other',
] as const;

export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(10),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  images: z
    .array(z.string().url('Invalid image URL'))
    .min(1, 'At least one image required'),
  category: z.enum(CATEGORIES),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
