import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { fuelService } from './fuel.service';
import { CreateFuelLogSchema, UpdateFuelLogSchema, FuelLogQuerySchema } from './fuel.validator';

export const fuelController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateFuelLogSchema;
    const result = await fuelService.create(body);
    return ApiResponse.success(res, 'Fuel log created successfully', result, 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as UpdateFuelLogSchema;
    const result = await fuelService.update(String(id), body);
    return ApiResponse.success(res, 'Fuel log updated successfully', result);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await fuelService.delete(String(id));
    return ApiResponse.success(res, 'Fuel log deleted successfully');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await fuelService.getById(String(id));
    return ApiResponse.success(res, 'Fuel log retrieved successfully', result);
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as FuelLogQuerySchema;
    const { items, total } = await fuelService.getAll(query);
    const limit = query.limit;
    const page = query.page;
    const totalPages = Math.ceil(total / limit);

    return ApiResponse.success(res, 'Fuel logs retrieved successfully', items, 200, {
      page,
      limit,
      total,
      totalPages,
    });
  }),
};
