import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, authorize } from '../../middlewares/authenticate.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { driverController } from './driver.controller';
import { createDriverSchema, updateDriverSchema, driverQuerySchema } from './driver.validator';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validate(driverQuerySchema, 'query'),
  driverController.getAll
);

router.get('/:id', driverController.getById);

router.post(
  '/',
  authorize(Role.ADMIN, Role.FLEET_MANAGER, Role.SAFETY_OFFICER),
  validate(createDriverSchema),
  driverController.create
);

router.patch(
  '/:id',
  authorize(Role.ADMIN, Role.FLEET_MANAGER, Role.SAFETY_OFFICER),
  validate(updateDriverSchema),
  driverController.update
);

router.delete(
  '/:id',
  authorize(Role.ADMIN, Role.FLEET_MANAGER),
  driverController.delete
);

export default router;
