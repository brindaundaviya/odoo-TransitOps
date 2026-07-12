import { prisma } from '../../config/database';
import { CreateDriverInput, UpdateDriverInput, DriverQueryFilters } from './driver.types';

export const driverRepository = {
  create: async (data: CreateDriverInput) => {
    return prisma.driver.create({
      data,
    });
  },

  update: async (id: string, data: UpdateDriverInput) => {
    return prisma.driver.update({
      where: { id },
      data,
    });
  },

  delete: async (id: string) => {
    return prisma.driver.delete({
      where: { id },
    });
  },

  findById: async (id: string) => {
    return prisma.driver.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            trips: true,
          },
        },
      },
    });
  },

  findByEmployeeId: async (employeeId: string) => {
    return prisma.driver.findUnique({
      where: { employeeId },
    });
  },

  findByLicenseNumber: async (licenseNumber: string) => {
    return prisma.driver.findUnique({
      where: { licenseNumber },
    });
  },

  findByUserId: async (userId: string) => {
    return prisma.driver.findUnique({
      where: { userId },
    });
  },

  findAll: async (filters: DriverQueryFilters) => {
    const { status, search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { employeeId: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.driver.count({ where }),
    ]);

    return {
      items,
      total,
    };
  },
};
