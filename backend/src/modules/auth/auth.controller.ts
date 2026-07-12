import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { authService } from './auth.service';
import { LoginSchema } from './auth.validator';

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as LoginSchema;
    const result = await authService.login(body);

    return ApiResponse.success(res, 'Login successful', result);
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getProfile(req.user!.id);

    return ApiResponse.success(res, 'Profile retrieved successfully', { user });
  }),
};
