import { prisma } from '../../config/database';
import { CreateFuelLogInput, UpdateFuelLogInput, FuelLogQueryFilters } from './fuel.types';

export const fuelRepository = {
  create: async (data: CreateFuelLogInput) => {
    return prisma.fuelLog.create({
      data,
      include: {
        vehicle: true,
        driver: true,
        trip: true,
      },
    });
  },

  update: async (id: string, data: UpdateFuelLogInput) => {
    return prisma.fuelLog.update({
      where: { id },
      data,
      include: {
        vehicle: true,
        driver: true,
        trip: true,
      },
    });
  },

  delete: async (id: string) => {
    return prisma.fuelLog.delete({
      where: { id },
    });
  },

  findById: async (id: string) => {
    return prisma.fuelLog.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: true,
        trip: true,
      },
    });
  },

  findAll: async (filters: FuelLogQueryFilters) => {
    const { vehicleId, tripId, driverId, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (tripId) {
      where.tripId = tripId;
    }

    if (driverId) {
      where.driverId = driverId;
    }

    const [items, total] = await Promise.all([
      prisma.fuelLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { loggedAt: 'desc' },
        include: {
          vehicle: true,
          driver: true,
          trip: true,
        },
      }),
      prisma.fuelLog.count({ where }),
    ]);

    return {
      items,
      total,
    };
  },
};
