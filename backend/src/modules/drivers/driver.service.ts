import { ApiError } from '../../utils/ApiError';
import { driverRepository } from './driver.repository';
import { CreateDriverInput, UpdateDriverInput, DriverQueryFilters } from './driver.types';

export const driverService = {
  create: async (input: CreateDriverInput) => {
    // Unique employee ID validation
    const existingEmp = await driverRepository.findByEmployeeId(input.employeeId);
    if (existingEmp) {
      throw new ApiError(400, 'Employee ID already exists', [
        { field: 'employeeId', message: 'Employee ID already exists' },
      ]);
    }

    // Unique license number validation
    const existingLic = await driverRepository.findByLicenseNumber(input.licenseNumber);
    if (existingLic) {
      throw new ApiError(400, 'License number already exists', [
        { field: 'licenseNumber', message: 'License number already exists' },
      ]);
    }

    // Unique user ID validation (if user ID is provided)
    if (input.userId) {
      const existingUser = await driverRepository.findByUserId(input.userId);
      if (existingUser) {
        throw new ApiError(400, 'User is already linked to another driver profile', [
          { field: 'userId', message: 'User is already linked to another driver profile' },
        ]);
      }
    }

    return driverRepository.create(input);
  },

  update: async (id: string, input: UpdateDriverInput) => {
    const driver = await driverRepository.findById(id);
    if (!driver) {
      throw new ApiError(404, 'Driver not found');
    }

    if (input.employeeId && input.employeeId !== driver.employeeId) {
      const existingEmp = await driverRepository.findByEmployeeId(input.employeeId);
      if (existingEmp) {
        throw new ApiError(400, 'Employee ID already exists', [
          { field: 'employeeId', message: 'Employee ID already exists' },
        ]);
      }
    }

    if (input.licenseNumber && input.licenseNumber !== driver.licenseNumber) {
      const existingLic = await driverRepository.findByLicenseNumber(input.licenseNumber);
      if (existingLic) {
        throw new ApiError(400, 'License number already exists', [
          { field: 'licenseNumber', message: 'License number already exists' },
        ]);
      }
    }

    if (input.userId && input.userId !== driver.userId) {
      const existingUser = await driverRepository.findByUserId(input.userId);
      if (existingUser) {
        throw new ApiError(400, 'User is already linked to another driver profile', [
          { field: 'userId', message: 'User is already linked to another driver profile' },
        ]);
      }
    }

    return driverRepository.update(id, input);
  },

  delete: async (id: string) => {
    const driver = await driverRepository.findById(id);
    if (!driver) {
      throw new ApiError(404, 'Driver not found');
    }
    return driverRepository.delete(id);
  },

  getById: async (id: string) => {
    const driver = await driverRepository.findById(id);
    if (!driver) {
      throw new ApiError(404, 'Driver not found');
    }
    return driver;
  },

  getAll: async (filters: DriverQueryFilters) => {
    return driverRepository.findAll(filters);
  },
};
