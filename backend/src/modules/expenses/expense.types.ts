import { Expense } from '@prisma/client';

export type CreateExpenseInput = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export interface ExpenseQueryFilters {
  status?: Expense['status'];
  category?: Expense['category'];
  vehicleId?: string;
  tripId?: string;
  submittedBy?: string;
  page?: number;
  limit?: number;
}
