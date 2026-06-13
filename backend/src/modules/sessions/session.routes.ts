import { Router } from 'express';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { SessionController } from './session.controller';

const router = Router();
const controller = new SessionController();

router.get('/current', authenticateJWT, controller.getCurrent);
router.get('/last', authenticateJWT, controller.getLast);
router.post('/open', authenticateJWT, controller.open);
router.post('/:id/close', authenticateJWT, controller.close);

export default router;
