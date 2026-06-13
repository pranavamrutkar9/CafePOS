import { Router } from 'express';
import { OrderController } from './order.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

// TODO: Define endpoints for Order CRUD operations per implementation plan

const router = Router();
const controller = new OrderController();

router.get('/', authenticateJWT, controller.getAll);
router.get('/:id', authenticateJWT, controller.getById);
router.post('/voice-parse', authenticateJWT, controller.parseVoiceOrder);
router.post('/', authenticateJWT, controller.create);
router.put('/:id', authenticateJWT, controller.update);
router.patch('/:id/items', authenticateJWT, controller.patchItems);
router.post('/:id/send-to-kitchen', authenticateJWT, controller.sendToKitchen);
router.post('/:id/send-receipt', authenticateJWT, controller.sendReceipt);

export default router;
