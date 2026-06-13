import { Router } from 'express';
import { CustomerController } from './customer.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

// TODO: Define customer routes mapping to controller methods per implementation plan

const router = Router();
const controller = new CustomerController();

router.get('/', authenticateJWT, controller.getAll);
router.post('/', authenticateJWT, controller.create);
router.put('/:id', authenticateJWT, controller.update);
router.delete('/:id', authenticateJWT, controller.delete);

export default router;
