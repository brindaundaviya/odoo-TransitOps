import { z } from 'zod';

export const expenseCategoryEnum = z.enum(['FUEL', 'MAINTENANCE', 'TOLL', 'INSURANCE', 'FINE', 'MISC']);
export const expenseStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

export const createExpenseSchema = z.object({
  category: expenseCategoryEnum,
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  expenseDate: z.string().min(1, 'Expense date is required'),
  vehicleId: z.string().optional().nullable(),
  tripId: z.string().optional().nullable(),
  description: z.string().min(1, 'Description is required'),
  receiptRef: z.string().optional().nullable(),
  status: expenseStatusEnum.default('PENDING'),
  submittedBy: z.string().optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseSchema = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseSchema = z.infer<typeof updateExpenseSchema>;
