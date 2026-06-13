import { Router } from 'express';
import { AuthController } from './auth.controller';

// TODO: Define signin and signup routes mapping to controllers per the implementation plan

const router = Router();
const controller = new AuthController();

router.post('/login', controller.login);
router.post('/signup', controller.signup);

export default router;
