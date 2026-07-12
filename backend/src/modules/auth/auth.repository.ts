import { User } from '@prisma/client';
import { prisma } from '../../config/database';
import { SafeUser } from './auth.types';

const safeUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const toSafeUser = (user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: User['role'];
  status: User['status'];
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): SafeUser => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
  status: user.status,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const authRepository = {
  findByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  findById: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    });
  },

  updateLastLogin: async (id: string) => {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
      select: safeUserSelect,
    });
  },
};
