import { ApiError } from '../../utils/ApiError';
import { expenseRepository } from './expense.repository';
import { vehicleRepository } from '../vehicles/vehicle.repository';
import { tripRepository } from '../trips/trip.repository';
import { CreateExpenseInput, UpdateExpenseInput, ExpenseQueryFilters } from './expense.types';

export const expenseService = {
  create: async (input: CreateExpenseInput) => {
    if (input.vehicleId) {
      const vehicle = await vehicleRepository.findById(input.vehicleId);
      if (!vehicle) {
        throw new ApiError(404, 'Vehicle not found');
      }
    }

    if (input.tripId) {
      const trip = await tripRepository.findById(input.tripId);
      if (!trip) {
        throw new ApiError(404, 'Trip not found');
      }
    }

    return expenseRepository.create(input);
  },

  update: async (id: string, input: UpdateExpenseInput) => {
    const expense = await expenseRepository.findById(id);
    if (!expense) {
      throw new ApiError(404, 'Expense record not found');
    }

    if (input.vehicleId && input.vehicleId !== expense.vehicleId) {
      const vehicle = await vehicleRepository.findById(input.vehicleId);
      if (!vehicle) {
        throw new ApiError(404, 'Vehicle not found');
      }
    }

    if (input.tripId && input.tripId !== expense.tripId) {
      const trip = await tripRepository.findById(input.tripId);
      if (!trip) {
        throw new ApiError(404, 'Trip not found');
      }
    }

    return expenseRepository.update(id, input);
  },

  delete: async (id: string) => {
    const expense = await expenseRepository.findById(id);
    if (!expense) {
      throw new ApiError(404, 'Expense record not found');
    }
    return expenseRepository.delete(id);
  },

  getById: async (id: string) => {
    const expense = await expenseRepository.findById(id);
    if (!expense) {
      throw new ApiError(404, 'Expense record not found');
    }
    return expense;
  },

  getAll: async (filters: ExpenseQueryFilters) => {
    return expenseRepository.findAll(filters);
  },
};
