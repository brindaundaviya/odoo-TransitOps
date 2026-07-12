import { Trip } from '@prisma/client';

export type CreateTripInput = Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTripInput = Partial<CreateTripInput>;

export interface TripQueryFilters {
  status?: Trip['status'];
  search?: string;
  driverId?: string;
  vehicleId?: string;
  page?: number;
  limit?: number;
}
