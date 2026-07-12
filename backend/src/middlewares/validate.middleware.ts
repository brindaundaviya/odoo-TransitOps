import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError';

type RequestSource = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodSchema, source: RequestSource = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.errors.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      next(new ApiError(400, 'Validation failed', errors));
      return;
    }

    req[source] = result.data;
    next();
  };
