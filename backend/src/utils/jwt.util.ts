import jwt, { type SignOptions } from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { jwtConfig } from '../config/jwt';
import { ApiError } from './ApiError';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

const signOptions: SignOptions = {
  expiresIn: jwtConfig.expiresIn as SignOptions['expiresIn'],
  algorithm: jwtConfig.algorithm,
};

export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, jwtConfig.secret, signOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, jwtConfig.secret, {
      algorithms: [jwtConfig.algorithm],
    });

    if (typeof decoded === 'string' || !decoded.sub || !decoded.email || !decoded.role) {
      throw new ApiError(401, 'Invalid token payload');
    }

    return {
      sub: decoded.sub,
      email: decoded.email as string,
      role: decoded.role as Role,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(401, 'Invalid or expired token');
  }
};
