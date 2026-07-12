import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { driverService } from './driver.service';
import { CreateDriverSchema, UpdateDriverSchema, DriverQuerySchema } from './driver.validator';

export const driverController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateDriverSchema;
    const result = await driverService.create(body);
    return ApiResponse.success(res, 'Driver created successfully', result, 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as UpdateDriverSchema;
    const result = await driverService.update(id, body);
    return ApiResponse.success(res, 'Driver updated successfully', result);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await driverService.delete(id);
    return ApiResponse.success(res, 'Driver deleted successfully');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await driverService.getById(id);
    return ApiResponse.success(res, 'Driver retrieved successfully', result);
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as DriverQuerySchema;
    const { items, total } = await driverService.getAll(query);
    const limit = query.limit;
    const page = query.page;
    const totalPages = Math.ceil(total / limit);

    return ApiResponse.success(res, 'Drivers retrieved successfully', items, 200, {
      page,
      limit,
      total,
      totalPages,
    });
  }),
};
