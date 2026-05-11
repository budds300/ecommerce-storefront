export type Category =
  | 'electronics'
  | 'fashion'
  | 'home'
  | 'beauty'
  | 'sports'
  | 'books'
  | 'other';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'mpesa' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  shippingLandmark: string;
  shippingCity: string;
  shippingCost: number;
  shippingNotes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  intasendInvoiceId?: string;
  items: OrderItem[];
  createdAt: Date;
}
