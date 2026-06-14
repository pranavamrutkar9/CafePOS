import { Router } from 'express';
import { PaymentsController } from './payments.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router();
const controller = new PaymentsController();

router.post('/create-order', authenticateJWT, controller.createOrder);
router.post('/verify-payment', authenticateJWT, controller.verifyPayment);

export default router;
