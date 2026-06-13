import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Recalculates order totals using the database-backed products, coupons, and promotions.
 * Stacking rules applied:
 * 1. Totals order: subtotal -> product discounts -> order discount -> tax -> total
 * 2. Coupon vs Promotion stacking rule:
 *    If Order.couponId is set, ignore order-level (scope="ORDER") Promotions for that order — coupon wins.
 *    Product-level (scope="PRODUCT") Promotions always apply regardless.
 */
export async function calculateOrderTotals(
  items: { productId: string; qty: number; unitPrice?: number }[],
  couponId?: string | null
) {
  // 1. Fetch products to get accurate prices and tax rates
  const productIds = items.map(item => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } }
  });

  const productMap = new Map(products.map(p => [p.id, p]));

  // 2. Fetch active promotions
  const activePromos = await prisma.promotion.findMany({
    where: { active: true }
  });

  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Filter promotions based on time and days of week
  const filteredPromos = activePromos.filter(promo => {
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

  // 3. Calculate subtotal and product-level discounts
  let subtotal = 0;
  let totalProductDiscounts = 0;

  const calculatedItems = items.map(item => {
    const product = productMap.get(item.productId);
    const unitPrice = product ? product.price : (item.unitPrice || 0);
    const lineSubtotal = item.qty * unitPrice;
    subtotal += lineSubtotal;

    let lineDiscount = 0;
    let appliedPromoLabel: string | null = null;

    // Coupon vs Promotion stacking rule: Product-level promotions always apply regardless of coupon.
    const prodPromos = filteredPromos.filter(p => p.scope === 'PRODUCT' && p.productId === item.productId);

    for (const promo of prodPromos) {
      if (!promo.minQty || item.qty >= promo.minQty) {
        const discountVal = (promo.type === 'PERCENT' || promo.type === 'PERCENTAGE')
          ? lineSubtotal * (promo.value / 100)
          : promo.value;
        if (discountVal > lineDiscount) {
          lineDiscount = discountVal;
          appliedPromoLabel = `PROMOTION_${promo.id}`;
        }
      }
    }

    lineDiscount = Math.min(lineSubtotal, lineDiscount);
    totalProductDiscounts += lineDiscount;
    const lineTotal = lineSubtotal - lineDiscount;

    return {
      productId: item.productId,
      qty: item.qty,
      unitPrice,
      lineSubtotal,
      lineDiscount,
      lineTotal,
      discountLabel: appliedPromoLabel,
      taxRate: product ? product.tax : 5 // Default to 5% tax if not specified
    };
  });

  const subtotalAfterProductDiscounts = subtotal - totalProductDiscounts;

  // 4. Calculate order-level discount (Coupon vs Promotion stacking rule)
  let orderDiscount = 0;
  let orderDiscountLabel: string | null = null;

  /*
    Coupon vs Promotion stacking rule:
    If Order.couponId is set, ignore order-level (scope="ORDER") Promotions for that order — coupon wins.
    Product-level (scope="PRODUCT") Promotions always apply regardless.
  */
  if (couponId) {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId }
    });
    if (coupon && coupon.active) {
      orderDiscount = (coupon.type === 'PERCENT' || coupon.type === 'PERCENTAGE')
        ? subtotalAfterProductDiscounts * (coupon.value / 100)
        : coupon.value;
      orderDiscountLabel = `COUPON:${coupon.code}`;
    }
  } else {
    // If no coupon is set, check order-level promotions (scope="ORDER")
    const orderPromos = filteredPromos.filter(p => p.scope === 'ORDER');
    let bestOrderDiscount = 0;
    let bestPromoLabel: string | null = null;

    for (const promo of orderPromos) {
      if (!promo.minAmount || subtotalAfterProductDiscounts >= promo.minAmount) {
        const discountVal = (promo.type === 'PERCENT' || promo.type === 'PERCENTAGE')
          ? subtotalAfterProductDiscounts * (promo.value / 100)
          : promo.value;
        if (discountVal > bestOrderDiscount) {
          bestOrderDiscount = discountVal;
          bestPromoLabel = `PROMOTION_${promo.id}`;
        }
      }
    }
    orderDiscount = bestOrderDiscount;
    orderDiscountLabel = bestPromoLabel;
  }

  orderDiscount = Math.min(subtotalAfterProductDiscounts, orderDiscount);
  const subtotalAfterAllDiscounts = subtotalAfterProductDiscounts - orderDiscount;

  // 5. Calculate tax (discount before tax: subtotal -> product discounts -> order discount -> tax -> total)
  let totalTax = 0;
  calculatedItems.forEach(item => {
    let itemTaxableAmount = 0;
    if (subtotalAfterProductDiscounts > 0) {
      const share = item.lineTotal / subtotalAfterProductDiscounts;
      itemTaxableAmount = item.lineTotal - (orderDiscount * share);
    }
    const itemTax = itemTaxableAmount * (item.taxRate / 100);
    totalTax += itemTax;
  });

  totalTax = Math.round(totalTax * 100) / 100;
  const total = Math.max(0, Math.round((subtotalAfterAllDiscounts + totalTax) * 100) / 100);

  return {
    subtotal,
    productDiscounts: totalProductDiscounts,
    orderDiscount,
    discountLabel: orderDiscountLabel,
    tax: totalTax,
    total,
    items: calculatedItems
  };
}

// Keep a synchronous recalculateOrderTotals for basic compatibility or fallback
export function recalculateOrderTotals(items: any[], discountAmount: number = 0) {
  const subtotal = items.reduce((sum, item) => sum + (item.qty || item.quantity || 0) * item.unitPrice, 0);
  const taxRate = 0.05; // Use 5% tax rate by default to match frontend/seed
  const tax = Math.round((subtotal - discountAmount) * taxRate * 100) / 100;
  const total = Math.max(0, subtotal - discountAmount + tax);

  return {
    subtotal,
    tax,
    discount: discountAmount,
    total
  };
}
