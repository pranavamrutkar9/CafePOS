import { Router } from 'express';
import { FloorTableController } from './floor-table.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

// TODO: Define endpoints for Floors and Tables CRUD per implementation plan

const router = Router();
const controller = new FloorTableController();

router.get('/floors', controller.getFloors);
router.get('/tables', controller.getTables);
router.post('/floors', authenticateJWT, authorizeRoles('ADMIN'), controller.createFloor);
router.post('/tables', authenticateJWT, authorizeRoles('ADMIN'), controller.createTable);
router.put('/tables/:id', authenticateJWT, controller.updateTable);

export default router;
