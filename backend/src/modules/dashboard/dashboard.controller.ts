import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { dashboardService } from './dashboard.service';

export const dashboardController = {
  getKPIs: asyncHandler(async (_req: Request, res: Response) => {
    const result = await dashboardService.getKPIs();
    return ApiResponse.success(res, 'Dashboard KPIs retrieved successfully', result);
  }),
};
