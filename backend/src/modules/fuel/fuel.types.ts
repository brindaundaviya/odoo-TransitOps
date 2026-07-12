export interface CreateFuelLogInput {
  vehicleId: string;
  tripId?: string | null;
  driverId?: string | null;
  loggedAt: Date;
  fuelType: string;
  quantity: number;
  cost: number;
  odometer: number;
  station?: string | null;
}

export type UpdateFuelLogInput = Partial<CreateFuelLogInput>;

export interface FuelLogQueryFilters {
  vehicleId?: string;
  tripId?: string;
  driverId?: string;
  page?: number;
  limit?: number;
}
