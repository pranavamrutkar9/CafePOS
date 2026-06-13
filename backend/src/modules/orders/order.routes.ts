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

export default router;
