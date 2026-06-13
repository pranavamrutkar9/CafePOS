import { ICoupon, IPromotion } from '@cafepos/shared-types';

// TODO: Handle Coupon and Promotion database operations via PrismaClient. Service has no req/res.

export class CouponPromotionService {
  async getAllCoupons(): Promise<ICoupon[]> {
    return [];
  }

  async createCoupon(data: any): Promise<ICoupon> {
    return {
      id: 'mock-coupon-id',
      code: data.code || 'MOCK50',
      discountType: data.discountType || 'PERCENTAGE',
      discountValue: data.discountValue || 10,
      minOrderValue: data.minOrderValue,
      maxDiscount: data.maxDiscount,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
  }

  async getAllPromotions(): Promise<IPromotion[]> {
    return [];
  }

  async createPromotion(data: any): Promise<IPromotion> {
    return {
      id: 'mock-promotion-id',
      name: data.name || 'Mock Promo',
      description: data.description || '',
      discountType: data.discountType || 'FIXED',
      discountValue: data.discountValue || 5,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      applicableProductIds: data.applicableProductIds || []
    };
  }
}
