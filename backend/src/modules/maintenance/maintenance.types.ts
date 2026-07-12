export interface CreateMaintenanceInput {
  vehicleId: string;
  type: 'SCHEDULED' | 'REPAIR' | 'INSPECTION';
  description: string;
  scheduledDate: Date;
  completedDate?: Date | null;
  cost?: number | null;
  serviceProvider?: string | null;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  odometerAtService?: number | null;
}

export type UpdateMaintenanceInput = Partial<CreateMaintenanceInput>;

export interface MaintenanceQueryFilters {
  status?: string;
  vehicleId?: string;
  search?: string;
  page?: number;
  limit?: number;
}
