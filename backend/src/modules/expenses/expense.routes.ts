import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, authorize } from '../../middlewares/authenticate.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { expenseController } from './expense.controller';
import { createExpenseSchema, updateExpenseSchema, expenseQuerySchema } from './expense.validator';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validate(expenseQuerySchema, 'query'),
  expenseController.getAll
);

router.get('/:id', expenseController.getById);

router.post(
  '/',
  authorize(Role.ADMIN, Role.FLEET_MANAGER, Role.DRIVER, Role.FINANCIAL_ANALYST),
  validate(createExpenseSchema),
  expenseController.create
);

router.patch(
  '/:id',
  authorize(Role.ADMIN, Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST),
  validate(updateExpenseSchema),
  expenseController.update
);

router.delete(
  '/:id',
  authorize(Role.ADMIN, Role.FLEET_MANAGER),
  expenseController.delete
);

export default router;
