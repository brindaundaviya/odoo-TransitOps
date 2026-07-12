import { ApiError } from '../../utils/ApiError';
import { vehicleRepository } from './vehicle.repository';
import { CreateVehicleInput, UpdateVehicleInput, VehicleQueryFilters } from './vehicle.types';

export const vehicleService = {
  create: async (input: CreateVehicleInput) => {
    // Unique registration number validation
    const existingReg = await vehicleRepository.findByRegistrationNumber(input.registrationNumber);
    if (existingReg) {
      throw new ApiError(400, 'Registration number already exists', [
        { field: 'registrationNumber', message: 'Registration number already exists' },
      ]);
    }

    // Unique VIN validation
    if (input.vin) {
      const existingVin = await vehicleRepository.findByVin(input.vin);
      if (existingVin) {
        throw new ApiError(400, 'VIN already exists', [
          { field: 'vin', message: 'VIN already exists' },
        ]);
      }
    }

    return vehicleRepository.create(input);
  },

  update: async (id: string, input: UpdateVehicleInput) => {
    const vehicle = await vehicleRepository.findById(id);
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }

    if (input.registrationNumber && input.registrationNumber !== vehicle.registrationNumber) {
      const existingReg = await vehicleRepository.findByRegistrationNumber(input.registrationNumber);
      if (existingReg) {
        throw new ApiError(400, 'Registration number already exists', [
          { field: 'registrationNumber', message: 'Registration number already exists' },
        ]);
      }
    }

    if (input.vin && input.vin !== vehicle.vin) {
      const existingVin = await vehicleRepository.findByVin(input.vin);
      if (existingVin) {
        throw new ApiError(400, 'VIN already exists', [
          { field: 'vin', message: 'VIN already exists' },
        ]);
      }
    }

    return vehicleRepository.update(id, input);
  },

  delete: async (id: string) => {
    const vehicle = await vehicleRepository.findById(id);
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }
    return vehicleRepository.delete(id);
  },

  getById: async (id: string) => {
    const vehicle = await vehicleRepository.findById(id);
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }
    return vehicle;
  },

  getAll: async (filters: VehicleQueryFilters) => {
    return vehicleRepository.findAll(filters);
  },
};
