import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { dashboardService } from './dashboard.service';

export const dashboardController = {
  getKPIs: asyncHandler(async (_req: Request, res: Response) => {
    const result = await dashboardService.getKPIs();
    return ApiResponse.success(res, 'Dashboard KPIs retrieved successfully', result);
  }),

  getFleetUtilization: asyncHandler(async (_req: Request, res: Response) => {
    const result = await dashboardService.getFleetUtilization();
    return ApiResponse.success(res, 'Fleet utilization data retrieved successfully', result);
  }),

  getFuelConsumption: asyncHandler(async (_req: Request, res: Response) => {
    const result = await dashboardService.getFuelConsumption();
    return ApiResponse.success(res, 'Fuel consumption data retrieved successfully', result);
  }),

  getMonthlyExpenses: asyncHandler(async (_req: Request, res: Response) => {
    const result = await dashboardService.getMonthlyExpenses();
    return ApiResponse.success(res, 'Monthly expenses data retrieved successfully', result);
  }),

  getTripDistribution: asyncHandler(async (_req: Request, res: Response) => {
    const result = await dashboardService.getTripDistribution();
    return ApiResponse.success(res, 'Trip distribution data retrieved successfully', result);
  }),
};
