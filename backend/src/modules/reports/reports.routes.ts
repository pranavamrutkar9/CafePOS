import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

// TODO: Define endpoints for admin POS sales reports per implementation plan

const router = Router();
const controller = new ReportsController();

router.get('/revenue', authenticateJWT, authorizeRoles('ADMIN', 'MANAGER'), controller.getRevenueReport);
router.get('/popular-products', authenticateJWT, authorizeRoles('ADMIN', 'MANAGER'), controller.getPopularProductsReport);

export default router;
