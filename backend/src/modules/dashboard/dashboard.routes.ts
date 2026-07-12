import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { dashboardController } from './dashboard.controller';

const router = Router();

router.use(authenticate);

router.get('/kpis', dashboardController.getKPIs);
router.get('/fleet-utilization', dashboardController.getFleetUtilization);
router.get('/fuel-consumption', dashboardController.getFuelConsumption);
router.get('/monthly-expenses', dashboardController.getMonthlyExpenses);
router.get('/trip-distribution', dashboardController.getTripDistribution);

export default router;
