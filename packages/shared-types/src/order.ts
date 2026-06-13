// TODO: Implement full order interfaces and schemas
import { IProduct } from './product';

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: IProduct;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface IOrder {
  id: string;
  tableId?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethodId?: string;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  customerId?: string;
  employeeId: string;
  createdAt: Date;
  updatedAt: Date;
}
