import { z } from 'zod';

export const driverStatusEnum = z.enum(['ACTIVE', 'ON_LEAVE', 'SUSPENDED']);

export const createDriverSchema = z.object({
  userId: z.string().optional().nullable(),
  employeeId: z.string().min(1, 'Employee ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseClass: z.string().min(1, 'License class is required'),
  licenseExpiry: z.string().min(1, 'License expiry date is required'),
  phone: z.string().min(1, 'Phone number is required'),
  status: driverStatusEnum.default('ACTIVE'),
  safetyScore: z.number().int().min(0).max(100).default(100),
});

export const updateDriverSchema = createDriverSchema.partial();

export type CreateDriverSchema = z.infer<typeof createDriverSchema>;
export type UpdateDriverSchema = z.infer<typeof updateDriverSchema>;
