import { Request, Response } from 'express';
import { CouponPromotionService } from './coupon-promotion.service';

// TODO: Handle HTTP requests for Coupons and Promotions. Controller contains no DB queries.

export class CouponPromotionController {
  private couponPromotionService = new CouponPromotionService();

  getCoupons = async (req: Request, res: Response) => {
    try {
      const coupons = await this.couponPromotionService.getAllCoupons();
      return res.status(200).json(coupons);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  createCoupon = async (req: Request, res: Response) => {
    try {
      const coupon = await this.couponPromotionService.createCoupon(req.body);
      return res.status(201).json(coupon);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  getPromotions = async (req: Request, res: Response) => {
    try {
      const promotions = await this.couponPromotionService.getAllPromotions();
      return res.status(200).json(promotions);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  createPromotion = async (req: Request, res: Response) => {
    try {
      const promotion = await this.couponPromotionService.createPromotion(req.body);
      return res.status(201).json(promotion);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
