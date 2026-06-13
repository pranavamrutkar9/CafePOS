import { Router } from 'express';
import { PaymentMethodController } from './payment-method.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

// TODO: Define endpoints for payment methods selection per implementation plan

const router = Router();
const controller = new PaymentMethodController();

router.get('/', authenticateJWT, controller.getAll);
router.post('/', authenticateJWT, controller.create);
router.put('/:id', authenticateJWT, controller.update);
router.delete('/:id', authenticateJWT, controller.delete);

export default router;
