import { Router } from 'express';
import { BookingsController } from './bookings.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router();
const controller = new BookingsController();

router.get('/', authenticateJWT, controller.getAll);
router.post('/', authenticateJWT, controller.create);

export default router;
