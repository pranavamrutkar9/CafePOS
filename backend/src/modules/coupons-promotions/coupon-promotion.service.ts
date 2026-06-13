import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CouponPromotionService {
  async getAllCoupons() {
    return prisma.coupon.findMany();
  }

  async createCoupon(data: any) {
    return prisma.coupon.create({ data });
  }

  async getAllPromotions() {
    return prisma.promotion.findMany({
      include: { product: true }
    });
  }

  async createPromotion(data: any) {
    return prisma.promotion.create({ data });
  }

  async getActivePromotions() {
    const all = await prisma.promotion.findMany({
      where: { active: true },
      include: { product: true }
    });

    const now = new Date();
    const currentDay = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return all.filter(promo => {
      // If no time bound, active
      if (!promo.startTime || !promo.endTime) return true;

      const [startH, startM] = promo.startTime.split(':').map(Number);
      const [endH, endM] = promo.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      let dayMatches = true;
      if (promo.daysOfWeek) {
        const days = promo.daysOfWeek.split(',').map(Number);
        if (days.length > 0) {
          dayMatches = days.includes(currentDay);
        }
      }

      const timeMatches = currentMinutes >= startMinutes && currentMinutes <= endMinutes;

      return dayMatches && timeMatches;
    });
  }

  async applyPromotionsToCart(items: any[], subtotal: number) {
    const activePromos = await this.getActivePromotions();
    let orderDiscount = 0;
    const updatedItems = [...items];

    for (const promo of activePromos) {
      // PRODUCT_QUANTITY trigger (using type mapping to minQty / productId)
      if (promo.scope === 'PRODUCT' && promo.productId && promo.minQty) {
        const item = updatedItems.find(i => i.productId === promo.productId);
        if (item && item.qty >= promo.minQty) {
          const discount = (promo.type === 'PERCENT' || promo.type === 'PERCENTAGE')
            ? item.lineTotal * (promo.value / 100)
            : promo.value;
          item.lineDiscount = discount;
          item.lineTotal -= discount;
        }
      }

      // ORDER_AMOUNT trigger
      if (promo.scope === 'ORDER' && promo.minAmount && subtotal >= promo.minAmount) {
        orderDiscount += (promo.type === 'PERCENT' || promo.type === 'PERCENTAGE')
          ? subtotal * (promo.value / 100)
          : promo.value;
      }
    }

    return { items: updatedItems, orderDiscount };
  }
}
