import { Router } from 'express';
import { EmployeeController } from './employee.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

// TODO: Define routes for employee management per implementation plan

const router = Router();
const controller = new EmployeeController();

router.get('/', authenticateJWT, authorizeRoles('ADMIN', 'MANAGER'), controller.getAll);
router.post('/', authenticateJWT, authorizeRoles('ADMIN'), controller.create);
router.put('/:id', authenticateJWT, authorizeRoles('ADMIN'), controller.update);
router.delete('/:id', authenticateJWT, authorizeRoles('ADMIN'), controller.delete);

export default router;
