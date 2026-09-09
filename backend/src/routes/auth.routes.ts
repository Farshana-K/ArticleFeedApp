import { Router } from 'express';
import { getMe, login, logout, refresh, register } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

export default router;
