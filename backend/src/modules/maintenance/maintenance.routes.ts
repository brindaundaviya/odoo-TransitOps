import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, authorize } from '../../middlewares/authenticate.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { maintenanceController } from './maintenance.controller';
import { createMaintenanceSchema, updateMaintenanceSchema, maintenanceQuerySchema } from './maintenance.validator';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validate(maintenanceQuerySchema, 'query'),
  maintenanceController.getAll
);

router.get('/:id', maintenanceController.getById);

router.post(
  '/',
  authorize(Role.ADMIN, Role.FLEET_MANAGER, Role.SAFETY_OFFICER),
  validate(createMaintenanceSchema),
  maintenanceController.create
);

router.patch(
  '/:id',
  authorize(Role.ADMIN, Role.FLEET_MANAGER, Role.SAFETY_OFFICER),
  validate(updateMaintenanceSchema),
  maintenanceController.update
);

router.delete(
  '/:id',
  authorize(Role.ADMIN, Role.FLEET_MANAGER),
  maintenanceController.delete
);

export default router;
