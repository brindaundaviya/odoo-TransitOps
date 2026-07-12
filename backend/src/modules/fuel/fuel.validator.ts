import { z } from 'zod';

export const createFuelLogSchema = z.object({
  vehicleId: z.string({ required_error: 'Vehicle ID is required' }).uuid('Invalid Vehicle ID'),
  tripId: z.string().uuid('Invalid Trip ID').optional().nullable(),
  driverId: z.string().uuid('Invalid Driver ID').optional().nullable(),
  loggedAt: z.coerce.date({ required_error: 'Logged date is required' }),
  fuelType: z.string({ required_error: 'Fuel type is required' }).min(1, 'Fuel type cannot be empty'),
  quantity: z.coerce.number({ required_error: 'Quantity is required' }).positive('Quantity must be positive'),
  cost: z.coerce.number({ required_error: 'Cost is required' }).positive('Cost must be positive'),
  odometer: z.coerce.number({ required_error: 'Odometer is required' }).int().nonnegative('Odometer must be non-negative'),
  station: z.string().optional().nullable(),
});

export const updateFuelLogSchema = createFuelLogSchema.partial();

export const fuelLogQuerySchema = z.object({
  vehicleId: z.string().uuid().optional(),
  tripId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type CreateFuelLogSchema = z.infer<typeof createFuelLogSchema>;
export type UpdateFuelLogSchema = z.infer<typeof updateFuelLogSchema>;
export type FuelLogQuerySchema = z.infer<typeof fuelLogQuerySchema>;
