import { z } from 'zod';

export const maintenanceTypeEnum = z.enum(['SCHEDULED', 'REPAIR', 'INSPECTION']);
export const maintenanceStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']);

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  type: maintenanceTypeEnum,
  description: z.string().min(1, 'Description is required'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  completedDate: z.string().optional().nullable(),
  cost: z.number().positive().optional().nullable(),
  serviceProvider: z.string().optional().nullable(),
  status: maintenanceStatusEnum.default('PENDING'),
  odometerAtService: z.number().int().nonnegative().optional().nullable(),
});

export const updateMaintenanceSchema = createMaintenanceSchema.partial();

export type CreateMaintenanceSchema = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceSchema = z.infer<typeof updateMaintenanceSchema>;
