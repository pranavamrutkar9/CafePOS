import { Router } from 'express';
import { CouponPromotionController } from './coupon-promotion.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router();
const controller = new CouponPromotionController();

router.get('/coupons', authenticateJWT, controller.getCoupons);
router.post('/coupons', authenticateJWT, controller.createCoupon);
router.patch('/coupons/:id', authenticateJWT, controller.updateCoupon);
router.delete('/coupons/:id', authenticateJWT, controller.deleteCoupon);

router.get('/promotions', authenticateJWT, controller.getPromotions);
router.get('/promotions/active', authenticateJWT, controller.getActivePromotions);
router.post('/promotions', authenticateJWT, controller.createPromotion);
router.patch('/promotions/:id', authenticateJWT, controller.updatePromotion);
router.delete('/promotions/:id', authenticateJWT, controller.deletePromotion);

export default router;
