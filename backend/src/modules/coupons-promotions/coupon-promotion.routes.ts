import { Router } from 'express';
import { CouponPromotionController } from './coupon-promotion.controller';

const router = Router();
const controller = new CouponPromotionController();

router.get('/coupons', controller.getCoupons);
router.post('/coupons', controller.createCoupon);

router.get('/promotions', controller.getPromotions);
router.get('/promotions/active', controller.getActivePromotions);
router.post('/promotions', controller.createPromotion);

export default router;
