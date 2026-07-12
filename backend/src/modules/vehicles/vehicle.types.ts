import { Vehicle } from '@prisma/client';

export type CreateVehicleInput = Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateVehicleInput = Partial<CreateVehicleInput>;

export interface VehicleQueryFilters {
  status?: Vehicle['status'];
  search?: string;
  page?: number;
  limit?: number;
}
