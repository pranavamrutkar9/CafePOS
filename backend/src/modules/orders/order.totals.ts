import { IOrderItem } from '@cafepos/shared-types';

// TODO: Implement order subtotal, tax, discount, and total pricing calculations

export function recalculateOrderTotals(items: IOrderItem[], discountAmount: number = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxRate = 0.08; // 8% tax rate placeholder
  const tax = Math.round((subtotal - discountAmount) * taxRate * 100) / 100;
  const total = Math.max(0, subtotal - discountAmount + tax);

  return {
    subtotal,
    tax,
    discount: discountAmount,
    total
  };
}
