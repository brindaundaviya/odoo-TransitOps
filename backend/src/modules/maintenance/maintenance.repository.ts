import { prisma } from '../../config/database';
import { CreateMaintenanceInput, UpdateMaintenanceInput, MaintenanceQueryFilters } from './maintenance.types';

export const maintenanceRepository = {
  create: async (data: CreateMaintenanceInput) => {
    return prisma.maintenanceLog.create({
      data,
      include: {
        vehicle: true,
      },
    });
  },

  update: async (id: string, data: UpdateMaintenanceInput) => {
    return prisma.maintenanceLog.update({
      where: { id },
      data,
      include: {
        vehicle: true,
      },
    });
  },

  delete: async (id: string) => {
    return prisma.maintenanceLog.delete({
      where: { id },
    });
  },

  findById: async (id: string) => {
    return prisma.maintenanceLog.findUnique({
      where: { id },
      include: {
        vehicle: true,
      },
    });
  },

  findAll: async (filters: MaintenanceQueryFilters) => {
    const { status, vehicleId, search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { serviceProvider: { contains: search, mode: 'insensitive' } },
        {
          vehicle: {
            registrationNumber: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.maintenanceLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledDate: 'desc' },
        include: {
          vehicle: true,
        },
      }),
      prisma.maintenanceLog.count({ where }),
    ]);

    return {
      items,
      total,
    };
  },
};
