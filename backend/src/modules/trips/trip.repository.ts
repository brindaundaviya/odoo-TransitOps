import { TripStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { CreateTripInput, UpdateTripInput, TripQueryFilters } from './trip.types';

export const tripRepository = {
  create: async (data: CreateTripInput) => {
    return prisma.trip.create({
      data,
      include: {
        driver: true,
        vehicle: true,
      },
    });
  },

  update: async (id: string, data: UpdateTripInput) => {
    return prisma.trip.update({
      where: { id },
      data,
      include: {
        driver: true,
        vehicle: true,
      },
    });
  },

  delete: async (id: string) => {
    return prisma.trip.delete({
      where: { id },
    });
  },

  findById: async (id: string) => {
    return prisma.trip.findUnique({
      where: { id },
      include: {
        driver: true,
        vehicle: true,
        fuelLogs: true,
        expenses: true,
      },
    });
  },

  findByTripCode: async (tripCode: string) => {
    return prisma.trip.findUnique({
      where: { tripCode },
    });
  },

  findActiveTripByDriver: async (driverId: string, excludeTripId?: string) => {
    return prisma.trip.findFirst({
      where: {
        driverId,
        status: TripStatus.IN_PROGRESS,
        NOT: excludeTripId ? { id: excludeTripId } : undefined,
      },
    });
  },

  findActiveTripByVehicle: async (vehicleId: string, excludeTripId?: string) => {
    return prisma.trip.findFirst({
      where: {
        vehicleId,
        status: TripStatus.IN_PROGRESS,
        NOT: excludeTripId ? { id: excludeTripId } : undefined,
      },
    });
  },

  findAll: async (filters: TripQueryFilters) => {
    const { status, search, driverId, vehicleId, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (driverId) {
      where.driverId = driverId;
    }

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (search) {
      where.OR = [
        { tripCode: { contains: search, mode: 'insensitive' } },
        { origin: { contains: search, mode: 'insensitive' } },
        { destination: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          driver: true,
          vehicle: true,
        },
      }),
      prisma.trip.count({ where }),
    ]);

    return {
      items,
      total,
    };
  },
};
