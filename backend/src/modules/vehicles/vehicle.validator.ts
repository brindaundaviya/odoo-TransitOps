import { z } from 'zod';
import { VehicleStatus } from '@prisma/client';

export const createVehicleSchema = z.object({
  registrationNumber: z
    .string({ required_error: 'Registration number is required' })
    .min(3, 'Registration number must be at least 3 characters')
    .max(20, 'Registration number must not exceed 20 characters')
    .transform((val) => val.toUpperCase().trim()),
  make: z.string({ required_error: 'Make is required' }).min(1, 'Make cannot be empty'),
  model: z.string({ required_error: 'Model is required' }).min(1, 'Model cannot be empty'),
  year: z
    .number({ required_error: 'Year is required' })
    .int()
    .min(1900, 'Year must be after 1900')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the far future'),
  vin: z
    .string()
    .max(30, 'VIN must not exceed 30 characters')
    .optional()
    .nullable()
    .transform((val) => val?.toUpperCase().trim() || null),
  fuelType: z.string({ required_error: 'Fuel type is required' }).min(1, 'Fuel type cannot be empty'),
  capacity: z.number().int().positive('Capacity must be positive').optional().nullable(),
  odometer: z.number().int().nonnegative('Odometer must be non-negative').default(0),
  status: z.nativeEnum(VehicleStatus).default(VehicleStatus.ACTIVE),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const vehicleQuerySchema = z.object({
  status: z.nativeEnum(VehicleStatus).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type CreateVehicleSchema = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleSchema = z.infer<typeof updateVehicleSchema>;
export type VehicleQuerySchema = z.infer<typeof vehicleQuerySchema>;
