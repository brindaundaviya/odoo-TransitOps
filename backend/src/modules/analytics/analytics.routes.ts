import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { analyticsController } from './analytics.controller';

const router = Router();

router.use(authenticate);

router.get('/charts', analyticsController.getChartsData);

export default router;
