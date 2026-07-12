export interface CreateTripInput {
  tripCode: string;
  origin: string;
  destination: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date | null;
  actualEnd?: Date | null;
  driverId: string;
  vehicleId: string;
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  distanceKm?: number | null;
  cargoWeight?: number | null;
}

export type UpdateTripInput = Partial<CreateTripInput>;

export interface TripQueryFilters {
  status?: string;
  search?: string;
  driverId?: string;
  vehicleId?: string;
  page?: number;
  limit?: number;
}
