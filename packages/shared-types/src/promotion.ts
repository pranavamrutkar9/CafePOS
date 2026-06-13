// TODO: Implement full coupons and promotions interfaces and schemas

export interface ICoupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
}

export interface IPromotion {
  id: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  applicableProductIds: string[]; // empty means all products
}
