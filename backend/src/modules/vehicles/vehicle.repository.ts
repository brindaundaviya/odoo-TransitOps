import { prisma } from '../../config/database';
import { CreateVehicleInput, UpdateVehicleInput, VehicleQueryFilters } from './vehicle.types';

export const vehicleRepository = {
  create: async (data: CreateVehicleInput) => {
    return prisma.vehicle.create({
      data,
    });
  },

  update: async (id: string, data: UpdateVehicleInput) => {
    return prisma.vehicle.update({
      where: { id },
      data,
    });
  },

  delete: async (id: string) => {
    return prisma.vehicle.delete({
      where: { id },
    });
  },

  findById: async (id: string) => {
    return prisma.vehicle.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            trips: true,
            maintenanceLogs: true,
          },
        },
      },
    });
  },

  findByRegistrationNumber: async (registrationNumber: string) => {
    return prisma.vehicle.findUnique({
      where: { registrationNumber },
    });
  },

  findByVin: async (vin: string) => {
    return prisma.vehicle.findUnique({
      where: { vin },
    });
  },

  findAll: async (filters: VehicleQueryFilters) => {
    const { status, search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { registrationNumber: { contains: search, mode: 'insensitive' } },
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return {
      items,
      total,
    };
  },
};
