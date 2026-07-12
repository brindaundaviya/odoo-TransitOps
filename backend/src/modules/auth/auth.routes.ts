import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { authController } from './auth.controller';
import { loginSchema } from './auth.validator';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);

export default router;
