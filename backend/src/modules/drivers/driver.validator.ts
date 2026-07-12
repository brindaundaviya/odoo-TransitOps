import { z } from 'zod';
import { DriverStatus } from '@prisma/client';

export const createDriverSchema = z.object({
  userId: z.string().uuid('Invalid User ID').optional().nullable(),
  employeeId: z
    .string({ required_error: 'Employee ID is required' })
    .min(3, 'Employee ID must be at least 3 characters')
    .transform((val) => val.toUpperCase().trim()),
  firstName: z.string({ required_error: 'First name is required' }).min(1, 'First name cannot be empty'),
  lastName: z.string({ required_error: 'Last name is required' }).min(1, 'Last name cannot be empty'),
  licenseNumber: z
    .string({ required_error: 'License number is required' })
    .min(5, 'License number must be at least 5 characters')
    .transform((val) => val.toUpperCase().trim()),
  licenseClass: z.string({ required_error: 'License class is required' }).min(1, 'License class cannot be empty'),
  licenseExpiry: z.coerce.date({ required_error: 'License expiry date is required' }),
  phone: z.string({ required_error: 'Phone number is required' }).min(5, 'Phone number must be at least 5 characters'),
  status: z.nativeEnum(DriverStatus).default(DriverStatus.ACTIVE),
  safetyScore: z
    .number()
    .int()
    .min(0, 'Safety score cannot be less than 0')
    .max(100, 'Safety score cannot be greater than 100')
    .default(100),
});

export const updateDriverSchema = createDriverSchema.partial();

export const driverQuerySchema = z.object({
  status: z.nativeEnum(DriverStatus).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type CreateDriverSchema = z.infer<typeof createDriverSchema>;
export type UpdateDriverSchema = z.infer<typeof updateDriverSchema>;
export type DriverQuerySchema = z.infer<typeof driverQuerySchema>;
