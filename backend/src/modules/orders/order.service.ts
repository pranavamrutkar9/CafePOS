import { IOrder, OrderStatus, PaymentStatus } from '@cafepos/shared-types';
import { recalculateOrderTotals } from './order.totals';

// TODO: Handle Order database transactions, integrate with socket notification calls. Service has no req/res.

export class OrderService {
  async getAllOrders(): Promise<IOrder[]> {
    return [];
  }

  async getOrderById(id: string): Promise<IOrder | null> {
    return null;
  }

  async createOrder(data: any): Promise<IOrder> {
    const calculated = recalculateOrderTotals(data.items || [], data.discount || 0);
    return {
      id: 'mock-order-id',
      tableId: data.tableId,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      items: data.items || [],
      subtotal: calculated.subtotal,
      tax: calculated.tax,
      discount: calculated.discount,
      total: calculated.total,
      employeeId: data.employeeId || 'mock-employee-id',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateOrder(id: string, data: any): Promise<IOrder> {
    const calculated = recalculateOrderTotals(data.items || [], data.discount || 0);
    return {
      id,
      tableId: data.tableId,
      status: data.status || OrderStatus.PENDING,
      paymentStatus: data.paymentStatus || PaymentStatus.PENDING,
      items: data.items || [],
      subtotal: calculated.subtotal,
      tax: calculated.tax,
      discount: calculated.discount,
      total: calculated.total,
      employeeId: data.employeeId || 'mock-employee-id',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
