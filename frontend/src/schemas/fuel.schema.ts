import { z } from 'zod';

export const createFuelSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  tripId: z.string().optional().nullable(),
  driverId: z.string().optional().nullable(),
  loggedAt: z.string().min(1, 'Date is required'),
  fuelType: z.string().min(1, 'Fuel type is required'),
  quantity: z.number().positive('Quantity must be positive'),
  cost: z.number().positive('Cost must be positive'),
  odometer: z.number().int().nonnegative('Odometer must be non-negative'),
  station: z.string().optional().nullable(),
});

export const updateFuelSchema = createFuelSchema.partial();

export type CreateFuelSchema = z.infer<typeof createFuelSchema>;
export type UpdateFuelSchema = z.infer<typeof updateFuelSchema>;
