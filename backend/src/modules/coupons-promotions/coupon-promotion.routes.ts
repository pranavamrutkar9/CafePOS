import { Router } from 'express';
import { CouponPromotionController } from './coupon-promotion.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

// TODO: Define endpoints for Coupons and Promotions management per implementation plan

const router = Router();
const controller = new CouponPromotionController();

router.get('/coupons', authenticateJWT, controller.getCoupons);
router.post('/coupons', authenticateJWT, authorizeRoles('ADMIN', 'MANAGER'), controller.createCoupon);
router.get('/promotions', controller.getPromotions);
router.post('/promotions', authenticateJWT, authorizeRoles('ADMIN', 'MANAGER'), controller.createPromotion);

export default router;
