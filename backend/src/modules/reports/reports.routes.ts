import { Router } from 'express';
import { ReportsController } from './reports.controller';

const router = Router();
const controller = new ReportsController();

// Basic routes without strict JWT auth right now just to ensure easy testing during development
// In a real production app, we would add: authenticateJWT, authorizeRoles('ADMIN', 'MANAGER')
router.get('/', controller.getDashboardData);
router.get('/export', controller.exportReport);

export default router;
