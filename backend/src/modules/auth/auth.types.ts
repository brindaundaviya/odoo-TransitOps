import { Role, UserStatus } from '@prisma/client';

export interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResult {
  accessToken: string;
  user: SafeUser;
}

export interface LoginInput {
  email: string;
  password: string;
}
