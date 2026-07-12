export interface CreateVehicleInput {
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  vin?: string | null;
  fuelType: string;
  capacity?: number | null;
  odometer?: number;
  status?: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';
}

export type UpdateVehicleInput = Partial<CreateVehicleInput>;

export interface VehicleQueryFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}
