import { z } from 'zod';

export const vehicleStatusEnum = z.enum(['ACTIVE', 'MAINTENANCE', 'RETIRED']);

export const createVehicleSchema = z.object({
  registrationNumber: z
    .string()
    .min(3, 'Registration number must be at least 3 characters')
    .max(20, 'Registration number must not exceed 20 characters')
    .transform((val) => val.toUpperCase().trim()),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z
    .number()
    .int()
    .min(1900, 'Year must be after 1900')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the far future'),
  vin: z
    .string()
    .max(30, 'VIN must not exceed 30 characters')
    .optional()
    .nullable()
    .transform((val) => val?.toUpperCase().trim() || null),
  fuelType: z.string().min(1, 'Fuel type is required'),
  capacity: z.number().int().positive('Capacity must be positive').optional().nullable(),
  odometer: z.number().int().nonnegative('Odometer must be non-negative').default(0),
  status: vehicleStatusEnum.default('ACTIVE'),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export type CreateVehicleSchema = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleSchema = z.infer<typeof updateVehicleSchema>;
