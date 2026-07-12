import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { analyticsService } from './analytics.service';

export const analyticsController = {
  getChartsData: asyncHandler(async (_req: Request, res: Response) => {
    const result = await analyticsService.getChartsData();
    return ApiResponse.success(res, 'Analytics charts data retrieved successfully', result);
  }),
};
