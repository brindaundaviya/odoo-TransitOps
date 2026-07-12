import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { dashboardController } from './dashboard.controller';

const router = Router();

router.use(authenticate);

router.get('/kpis', dashboardController.getKPIs);

export default router;
