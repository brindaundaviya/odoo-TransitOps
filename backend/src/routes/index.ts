import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import authRoutes from '../modules/auth/auth.routes';
import vehicleRoutes from '../modules/vehicles/vehicle.routes';
import driverRoutes from '../modules/drivers/driver.routes';
import tripRoutes from '../modules/trips/trip.routes';
import maintenanceRoutes from '../modules/maintenance/maintenance.routes';
import fuelRoutes from '../modules/fuel/fuel.routes';
import expenseRoutes from '../modules/expenses/expense.routes';
import dashboardRoutes from '../modules/dashboard/dashboard.routes';
import analyticsRoutes from '../modules/analytics/analytics.routes';
import reportRoutes from '../modules/reports/report.routes';

const router = Router();

router.get(
  '/health',
  asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'TransitOps Backend Running',
    });
  }),
);

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/trips', tripRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/fuel-logs', fuelRoutes);
router.use('/expenses', expenseRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/reports', reportRoutes);

export default router;
