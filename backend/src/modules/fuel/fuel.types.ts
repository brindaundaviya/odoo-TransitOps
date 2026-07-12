import { FuelLog } from '@prisma/client';

export type CreateFuelLogInput = Omit<FuelLog, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateFuelLogInput = Partial<CreateFuelLogInput>;

export interface FuelLogQueryFilters {
  vehicleId?: string;
  tripId?: string;
  driverId?: string;
  page?: number;
  limit?: number;
}
