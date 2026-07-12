import { Driver } from '@prisma/client';

export type CreateDriverInput = Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateDriverInput = Partial<CreateDriverInput>;

export interface DriverQueryFilters {
  status?: Driver['status'];
  search?: string;
  page?: number;
  limit?: number;
}
