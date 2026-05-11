import type { Category } from './order';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: Category;
  createdAt: Date;
  updatedAt: Date;
}
