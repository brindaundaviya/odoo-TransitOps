import { prisma } from '../../config/database';
import { CreateExpenseInput, UpdateExpenseInput, ExpenseQueryFilters } from './expense.types';

export const expenseRepository = {
  create: async (data: CreateExpenseInput) => {
    return prisma.expense.create({
      data,
      include: {
        vehicle: true,
        trip: true,
        submitter: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  },

  update: async (id: string, data: UpdateExpenseInput) => {
    return prisma.expense.update({
      where: { id },
      data,
      include: {
        vehicle: true,
        trip: true,
        submitter: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  },

  delete: async (id: string) => {
    return prisma.expense.delete({
      where: { id },
    });
  },

  findById: async (id: string) => {
    return prisma.expense.findUnique({
      where: { id },
      include: {
        vehicle: true,
        trip: true,
        submitter: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  },

  findAll: async (filters: ExpenseQueryFilters) => {
    const { status, category, vehicleId, tripId, submittedBy, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (tripId) {
      where.tripId = tripId;
    }

    if (submittedBy) {
      where.submittedBy = submittedBy;
    }

    const [items, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { expenseDate: 'desc' },
        include: {
          vehicle: true,
          trip: true,
          submitter: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.expense.count({ where }),
    ]);

    return {
      items,
      total,
    };
  },
};
