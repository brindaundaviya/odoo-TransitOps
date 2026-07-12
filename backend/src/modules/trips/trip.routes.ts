import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, authorize } from '../../middlewares/authenticate.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { tripController } from './trip.controller';
import { createTripSchema, updateTripSchema, tripQuerySchema } from './trip.validator';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validate(tripQuerySchema, 'query'),
  tripController.getAll
);

router.get('/:id', tripController.getById);

router.post(
  '/',
  authorize(Role.ADMIN, Role.FLEET_MANAGER, Role.SAFETY_OFFICER),
  validate(createTripSchema),
  tripController.create
);

router.patch(
  '/:id',
  authorize(Role.ADMIN, Role.FLEET_MANAGER, Role.SAFETY_OFFICER, Role.DRIVER),
  validate(updateTripSchema),
  tripController.update
);

router.delete(
  '/:id',
  authorize(Role.ADMIN, Role.FLEET_MANAGER),
  tripController.delete
);

export default router;
