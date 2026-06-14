import { Router } from 'express';
import { KdsController } from './kds.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

// TODO: Define endpoints for KDS active ticket board per implementation plan

const router = Router();
const controller = new KdsController();

router.get('/tickets', authenticateJWT, controller.getActiveTickets);
router.get('/load', authenticateJWT, controller.getLoad);
router.put('/tickets/:id/status', authenticateJWT, controller.updateTicketStatus);
router.patch('/tickets/:id/advance', authenticateJWT, controller.advance);
router.patch('/tickets/:id/items/:itemId', authenticateJWT, controller.updateItemStatus);

export default router;
