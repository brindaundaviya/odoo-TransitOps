import { z } from 'zod';
import { TripStatus } from '@prisma/client';

export const createTripSchema = z.object({
  tripCode: z
    .string({ required_error: 'Trip code is required' })
    .min(3, 'Trip code must be at least 3 characters')
    .transform((val) => val.toUpperCase().trim()),
  origin: z.string({ required_error: 'Origin is required' }).min(1, 'Origin cannot be empty'),
  destination: z.string({ required_error: 'Destination is required' }).min(1, 'Destination cannot be empty'),
  scheduledStart: z.coerce.date({ required_error: 'Scheduled start is required' }),
  scheduledEnd: z.coerce.date({ required_error: 'Scheduled end is required' }),
  driverId: z.string({ required_error: 'Driver is required' }).uuid('Invalid Driver ID'),
  vehicleId: z.string({ required_error: 'Vehicle is required' }).uuid('Invalid Vehicle ID'),
  status: z.nativeEnum(TripStatus).default(TripStatus.SCHEDULED),
  distanceKm: z.coerce.number().positive('Distance must be positive').optional().nullable(),
  cargoWeight: z.coerce.number().int().nonnegative('Cargo weight must be positive').optional().nullable(),
});

export const updateTripSchema = createTripSchema.partial().extend({
  actualStart: z.coerce.date().optional().nullable(),
  actualEnd: z.coerce.date().optional().nullable(),
});

export const tripQuerySchema = z.object({
  status: z.nativeEnum(TripStatus).optional(),
  driverId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type CreateTripSchema = z.infer<typeof createTripSchema>;
export type UpdateTripSchema = z.infer<typeof updateTripSchema>;
export type TripQuerySchema = z.infer<typeof tripQuerySchema>;
