import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

// TODO: Define routes for product management CRUD operations per implementation plan

const router = Router();
const controller = new ProductController();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.get('/:id/upsell', controller.getUpsellSuggestions);
router.post('/', authenticateJWT, authorizeRoles('ADMIN', 'MANAGER'), controller.create);
router.put('/:id', authenticateJWT, authorizeRoles('ADMIN', 'MANAGER'), controller.update);
router.delete('/:id', authenticateJWT, authorizeRoles('ADMIN'), controller.delete);

export default router;
