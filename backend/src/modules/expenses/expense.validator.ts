import { z } from 'zod';
import { ExpenseCategory, ExpenseStatus } from '@prisma/client';

export const createExpenseSchema = z.object({
  category: z.nativeEnum(ExpenseCategory, { required_error: 'Expense category is required' }),
  amount: z.coerce.number({ required_error: 'Amount is required' }).positive('Amount must be positive'),
  currency: z.string().default('USD'),
  expenseDate: z.coerce.date({ required_error: 'Expense date is required' }),
  vehicleId: z.string().uuid('Invalid Vehicle ID').optional().nullable(),
  tripId: z.string().uuid('Invalid Trip ID').optional().nullable(),
  description: z.string({ required_error: 'Description is required' }).min(1, 'Description cannot be empty'),
  receiptRef: z.string().optional().nullable(),
  status: z.nativeEnum(ExpenseStatus).default(ExpenseStatus.PENDING),
  submittedBy: z.string().uuid('Invalid Submitter User ID').optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const expenseQuerySchema = z.object({
  status: z.nativeEnum(ExpenseStatus).optional(),
  category: z.nativeEnum(ExpenseCategory).optional(),
  vehicleId: z.string().uuid().optional(),
  tripId: z.string().uuid().optional(),
  submittedBy: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type CreateExpenseSchema = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseSchema = z.infer<typeof updateExpenseSchema>;
export type ExpenseQuerySchema = z.infer<typeof expenseQuerySchema>;
