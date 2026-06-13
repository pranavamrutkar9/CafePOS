import { Router } from 'express';
import { CategoryController } from './category.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

// TODO: Define category management routes per implementation plan

const router = Router();
const controller = new CategoryController();

router.get('/', controller.getAll);
router.post('/', authenticateJWT, authorizeRoles('ADMIN', 'MANAGER'), controller.create);
router.put('/:id', authenticateJWT, authorizeRoles('ADMIN', 'MANAGER'), controller.update);
router.delete('/:id', authenticateJWT, authorizeRoles('ADMIN'), controller.delete);

export default router;
