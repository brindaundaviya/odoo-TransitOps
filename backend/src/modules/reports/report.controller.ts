import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { reportService } from './report.service';

export const reportController = {
  getSummary: asyncHandler(async (_req: Request, res: Response) => {
    const result = await reportService.getSummary();
    return ApiResponse.success(res, 'Reports retrieved successfully', result);
  }),

  exportCSV: asyncHandler(async (req: Request, res: Response) => {
    const { type } = req.params;
    const csv = await reportService.exportCSV(String(type));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-report.csv`);
    return res.send(csv);
  }),
};
