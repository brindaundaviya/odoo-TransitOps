import { z } from 'zod';
import { MaintenanceType, MaintenanceStatus } from '@prisma/client';

export const createMaintenanceSchema = z.object({
  vehicleId: z.string({ required_error: 'Vehicle ID is required' }).uuid('Invalid Vehicle ID'),
  type: z.nativeEnum(MaintenanceType, { required_error: 'Maintenance type is required' }),
  description: z.string({ required_error: 'Description is required' }).min(1, 'Description cannot be empty'),
  scheduledDate: z.coerce.date({ required_error: 'Scheduled date is required' }),
  completedDate: z.coerce.date().optional().nullable(),
  cost: z.coerce.number().positive('Cost must be positive').optional().nullable(),
  serviceProvider: z.string().optional().nullable(),
  status: z.nativeEnum(MaintenanceStatus).default(MaintenanceStatus.PENDING),
  odometerAtService: z.coerce.number().int().nonnegative('Odometer must be non-negative').optional().nullable(),
});

export const updateMaintenanceSchema = createMaintenanceSchema.partial();

export const maintenanceQuerySchema = z.object({
  status: z.nativeEnum(MaintenanceStatus).optional(),
  vehicleId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type CreateMaintenanceSchema = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceSchema = z.infer<typeof updateMaintenanceSchema>;
export type MaintenanceQuerySchema = z.infer<typeof maintenanceQuerySchema>;
