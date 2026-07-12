import { TripStatus, VehicleStatus } from '@prisma/client';
import { ApiError } from '../../utils/ApiError';
import { tripRepository } from './trip.repository';
import { driverRepository } from '../drivers/driver.repository';
import { vehicleRepository } from '../vehicles/vehicle.repository';
import { CreateTripInput, UpdateTripInput, TripQueryFilters } from './trip.types';

export const tripService = {
  validateDispatch: async (
    data: {
      driverId: string;
      vehicleId: string;
      cargoWeight?: number | null;
      status: TripStatus;
    },
    tripId?: string
  ) => {
    if (data.status !== TripStatus.IN_PROGRESS) {
      return;
    }

    const driver = await driverRepository.findById(data.driverId);
    if (!driver) {
      throw new ApiError(404, 'Driver not found');
    }

    const vehicle = await vehicleRepository.findById(data.vehicleId);
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }

    // Business Rules validation:
    // 1. Retired vehicles cannot be dispatched
    if (vehicle.status === VehicleStatus.RETIRED) {
      throw new ApiError(400, 'Retired vehicles cannot be dispatched', [
        { field: 'vehicleId', message: 'Vehicle is retired' },
      ]);
    }

    // 2. Vehicles in maintenance cannot be dispatched
    if (vehicle.status === VehicleStatus.MAINTENANCE) {
      throw new ApiError(400, 'Vehicles in maintenance cannot be dispatched', [
        { field: 'vehicleId', message: 'Vehicle is in maintenance' },
      ]);
    }

    // 3. Vehicle already on trip cannot be dispatched
    const activeVehicleTrip = await tripRepository.findActiveTripByVehicle(data.vehicleId, tripId);
    if (activeVehicleTrip) {
      throw new ApiError(400, 'Vehicle is already assigned to another active trip', [
        { field: 'vehicleId', message: 'Vehicle already on active trip' },
      ]);
    }

    // 4. Driver already on trip cannot be dispatched
    const activeDriverTrip = await tripRepository.findActiveTripByDriver(data.driverId, tripId);
    if (activeDriverTrip) {
      throw new ApiError(400, 'Driver is already assigned to another active trip', [
        { field: 'driverId', message: 'Driver already on active trip' },
      ]);
    }

    // 5. Suspended drivers cannot be dispatched
    if (driver.status === 'SUSPENDED') {
      throw new ApiError(400, 'Suspended drivers cannot be dispatched', [
        { field: 'driverId', message: 'Driver is suspended' },
      ]);
    }

    // 6. Expired licenses cannot be dispatched
    if (new Date(driver.licenseExpiry) < new Date()) {
      throw new ApiError(400, 'Drivers with expired licenses cannot be dispatched', [
        { field: 'driverId', message: 'Driver license has expired' },
      ]);
    }

    // 7. Cargo weight must not exceed vehicle capacity
    if (data.cargoWeight !== undefined && data.cargoWeight !== null && vehicle.capacity) {
      if (data.cargoWeight > vehicle.capacity) {
        throw new ApiError(
          400,
          `Cargo weight (${data.cargoWeight} kg) must not exceed vehicle capacity (${vehicle.capacity} kg)`,
          [{ field: 'cargoWeight', message: `Exceeds capacity of ${vehicle.capacity} kg` }]
        );
      }
    }
  },

  create: async (input: CreateTripInput) => {
    // Check if tripCode is unique
    const existingTrip = await tripRepository.findByTripCode(input.tripCode);
    if (existingTrip) {
      throw new ApiError(400, 'Trip code already exists', [
        { field: 'tripCode', message: 'Trip code already exists' },
      ]);
    }

    // Run dispatch rules if created directly in IN_PROGRESS status
    await tripService.validateDispatch({
      driverId: input.driverId,
      vehicleId: input.vehicleId,
      cargoWeight: input.cargoWeight,
      status: input.status || 'SCHEDULED',
    });

    const data: any = { ...input };
    if (input.status === TripStatus.IN_PROGRESS) {
      data.actualStart = new Date();
    } else if (input.status === TripStatus.COMPLETED) {
      data.actualStart = data.actualStart || new Date();
      data.actualEnd = new Date();
    }

    return tripRepository.create(data);
  },

  update: async (id: string, input: UpdateTripInput) => {
    const trip = await tripRepository.findById(id);
    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    if (input.tripCode && input.tripCode !== trip.tripCode) {
      const existingTrip = await tripRepository.findByTripCode(input.tripCode);
      if (existingTrip) {
        throw new ApiError(400, 'Trip code already exists', [
          { field: 'tripCode', message: 'Trip code already exists' },
        ]);
      }
    }

    // Merge trip details to validate dispatch
    const merged = {
      driverId: input.driverId || trip.driverId,
      vehicleId: input.vehicleId || trip.vehicleId,
      cargoWeight: input.cargoWeight !== undefined ? input.cargoWeight : trip.cargoWeight,
      status: input.status || trip.status,
    };

    // If changing status to IN_PROGRESS, or if active trip attributes change
    if (
      (input.status === TripStatus.IN_PROGRESS && trip.status !== TripStatus.IN_PROGRESS) ||
      (merged.status === TripStatus.IN_PROGRESS &&
        (input.driverId || input.vehicleId || input.cargoWeight !== undefined))
    ) {
      await tripService.validateDispatch(merged, id);
    }

    const data: any = { ...input };

    // Auto set actual timestamps based on status transition
    if (input.status === TripStatus.IN_PROGRESS && !trip.actualStart) {
      data.actualStart = new Date();
    } else if (input.status === TripStatus.COMPLETED) {
      if (!trip.actualStart) {
        data.actualStart = new Date();
      }
      data.actualEnd = new Date();
    }

    return tripRepository.update(id, data);
  },

  delete: async (id: string) => {
    const trip = await tripRepository.findById(id);
    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }
    return tripRepository.delete(id);
  },

  getById: async (id: string) => {
    const trip = await tripRepository.findById(id);
    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }
    return trip;
  },

  getAll: async (filters: TripQueryFilters) => {
    return tripRepository.findAll(filters);
  },
};
