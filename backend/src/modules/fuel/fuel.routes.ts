import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, authorize } from '../../middlewares/authenticate.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { fuelController } from './fuel.controller';
import { createFuelLogSchema, updateFuelLogSchema, fuelLogQuerySchema } from './fuel.validator';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validate(fuelLogQuerySchema, 'query'),
  fuelController.getAll
);

router.get('/:id', fuelController.getById);

router.post(
  '/',
  authorize(Role.ADMIN, Role.FLEET_MANAGER, Role.DRIVER),
  validate(createFuelLogSchema),
  fuelController.create
);

router.patch(
  '/:id',
  authorize(Role.ADMIN, Role.FLEET_MANAGER),
  validate(updateFuelLogSchema),
  fuelController.update
);

router.delete(
  '/:id',
  authorize(Role.ADMIN, Role.FLEET_MANAGER),
  fuelController.delete
);

export default router;
