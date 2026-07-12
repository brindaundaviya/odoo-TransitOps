import { ApiError } from '../../utils/ApiError';
import { fuelRepository } from './fuel.repository';
import { vehicleRepository } from '../vehicles/vehicle.repository';
import { driverRepository } from '../drivers/driver.repository';
import { tripRepository } from '../trips/trip.repository';
import { CreateFuelLogInput, UpdateFuelLogInput, FuelLogQueryFilters } from './fuel.types';

export const fuelService = {
  create: async (input: CreateFuelLogInput) => {
    const vehicle = await vehicleRepository.findById(input.vehicleId);
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }

    if (input.driverId) {
      const driver = await driverRepository.findById(input.driverId);
      if (!driver) {
        throw new ApiError(404, 'Driver not found');
      }
    }

    if (input.tripId) {
      const trip = await tripRepository.findById(input.tripId);
      if (!trip) {
        throw new ApiError(404, 'Trip not found');
      }
    }

    // Odometer validation: cannot be less than current odometer
    if (input.odometer < vehicle.odometer) {
      throw new ApiError(400, `Odometer reading (${input.odometer}) cannot be less than the vehicle's current odometer (${vehicle.odometer})`, [
        { field: 'odometer', message: `Odometer is less than vehicle's current ${vehicle.odometer} km` },
      ]);
    }

    const log = await fuelRepository.create(input);

    // Update vehicle's odometer
    await vehicleRepository.update(input.vehicleId, { odometer: input.odometer });

    return log;
  },

  update: async (id: string, input: UpdateFuelLogInput) => {
    const log = await fuelRepository.findById(id);
    if (!log) {
      throw new ApiError(404, 'Fuel log not found');
    }

    if (input.vehicleId && input.vehicleId !== log.vehicleId) {
      const vehicle = await vehicleRepository.findById(input.vehicleId);
      if (!vehicle) {
        throw new ApiError(404, 'Vehicle not found');
      }
    }

    const updatedLog = await fuelRepository.update(id, input);

    // Update vehicle's odometer if updated log has a higher odometer
    if (input.odometer) {
      const vehicleId = input.vehicleId || log.vehicleId;
      const vehicle = await vehicleRepository.findById(vehicleId);
      if (vehicle && input.odometer > vehicle.odometer) {
        await vehicleRepository.update(vehicleId, { odometer: input.odometer });
      }
    }

    return updatedLog;
  },

  delete: async (id: string) => {
    const log = await fuelRepository.findById(id);
    if (!log) {
      throw new ApiError(404, 'Fuel log not found');
    }
    return fuelRepository.delete(id);
  },

  getById: async (id: string) => {
    const log = await fuelRepository.findById(id);
    if (!log) {
      throw new ApiError(404, 'Fuel log not found');
    }
    return log;
  },

  getAll: async (filters: FuelLogQueryFilters) => {
    return fuelRepository.findAll(filters);
  },
};
