import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, authorize } from '../../middlewares/authenticate.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { vehicleController } from './vehicle.controller';
import { createVehicleSchema, updateVehicleSchema, vehicleQuerySchema } from './vehicle.validator';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validate(vehicleQuerySchema, 'query'),
  vehicleController.getAll
);

router.get('/:id', vehicleController.getById);

router.post(
  '/',
  authorize(Role.ADMIN, Role.FLEET_MANAGER),
  validate(createVehicleSchema),
  vehicleController.create
);

router.patch(
  '/:id',
  authorize(Role.ADMIN, Role.FLEET_MANAGER),
  validate(updateVehicleSchema),
  vehicleController.update
);

router.delete(
  '/:id',
  authorize(Role.ADMIN, Role.FLEET_MANAGER),
  vehicleController.delete
);

export default router;
