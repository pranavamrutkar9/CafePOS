import { Router } from 'express';
import { KdsController } from './kds.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

// TODO: Define endpoints for KDS active ticket board per implementation plan

const router = Router();
const controller = new KdsController();

router.get('/tickets', authenticateJWT, controller.getActiveTickets);
router.put('/tickets/:id/status', authenticateJWT, controller.updateTicketStatus);

export default router;
