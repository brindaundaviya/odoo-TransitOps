import { MaintenanceLog } from '@prisma/client';

export type CreateMaintenanceInput = Omit<MaintenanceLog, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMaintenanceInput = Partial<CreateMaintenanceInput>;

export interface MaintenanceQueryFilters {
  status?: MaintenanceLog['status'];
  vehicleId?: string;
  search?: string;
  page?: number;
  limit?: number;
}
