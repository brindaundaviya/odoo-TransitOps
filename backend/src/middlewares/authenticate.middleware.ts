import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt.util';
import { ApiError } from '../utils/ApiError';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next(new ApiError(401, 'Authentication required'));
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    next(new ApiError(401, 'Authentication required'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize =
  (...allowedRoles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, 'Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      next(new ApiError(403, 'You do not have permission to access this resource'));
      return;
    }

    next();
  };
