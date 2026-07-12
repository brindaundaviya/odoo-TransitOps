import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { maintenanceService } from './maintenance.service';
import { CreateMaintenanceSchema, UpdateMaintenanceSchema, MaintenanceQuerySchema } from './maintenance.validator';

export const maintenanceController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateMaintenanceSchema;
    const result = await maintenanceService.create(body);
    return ApiResponse.success(res, 'Maintenance log created successfully', result, 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as UpdateMaintenanceSchema;
    const result = await maintenanceService.update(String(id), body);
    return ApiResponse.success(res, 'Maintenance log updated successfully', result);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await maintenanceService.delete(String(id));
    return ApiResponse.success(res, 'Maintenance log deleted successfully');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await maintenanceService.getById(String(id));
    return ApiResponse.success(res, 'Maintenance log retrieved successfully', result);
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as MaintenanceQuerySchema;
    const { items, total } = await maintenanceService.getAll(query);
    const limit = query.limit;
    const page = query.page;
    const totalPages = Math.ceil(total / limit);

    return ApiResponse.success(res, 'Maintenance logs retrieved successfully', items, 200, {
      page,
      limit,
      total,
      totalPages,
    });
  }),
};
