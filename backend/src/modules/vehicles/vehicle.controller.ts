import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { vehicleService } from './vehicle.service';
import { CreateVehicleSchema, UpdateVehicleSchema, VehicleQuerySchema } from './vehicle.validator';

export const vehicleController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateVehicleSchema;
    const result = await vehicleService.create(body);
    return ApiResponse.success(res, 'Vehicle created successfully', result, 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as UpdateVehicleSchema;
    const result = await vehicleService.update(id, body);
    return ApiResponse.success(res, 'Vehicle updated successfully', result);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await vehicleService.delete(id);
    return ApiResponse.success(res, 'Vehicle deleted successfully');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await vehicleService.getById(id);
    return ApiResponse.success(res, 'Vehicle retrieved successfully', result);
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as VehicleQuerySchema;
    const { items, total } = await vehicleService.getAll(query);
    const limit = query.limit;
    const page = query.page;
    const totalPages = Math.ceil(total / limit);

    return ApiResponse.success(res, 'Vehicles retrieved successfully', items, 200, {
      page,
      limit,
      total,
      totalPages,
    });
  }),
};
