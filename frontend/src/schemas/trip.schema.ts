import { z } from 'zod';

export const tripStatusEnum = z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

export const createTripSchema = z.object({
  tripCode: z.string().min(1, 'Trip code is required'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  scheduledStart: z.string().min(1, 'Scheduled start is required'),
  scheduledEnd: z.string().min(1, 'Scheduled end is required'),
  driverId: z.string().min(1, 'Driver is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  status: tripStatusEnum.default('SCHEDULED'),
  distanceKm: z.number().positive().optional().nullable(),
  cargoWeight: z.number().int().nonnegative().optional().nullable(),
});

export const updateTripSchema = createTripSchema.partial().extend({
  actualStart: z.string().optional().nullable(),
  actualEnd: z.string().optional().nullable(),
});

export type CreateTripSchema = z.infer<typeof createTripSchema>;
export type UpdateTripSchema = z.infer<typeof updateTripSchema>;
