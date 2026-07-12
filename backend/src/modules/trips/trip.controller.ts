import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { tripService } from './trip.service';
import { CreateTripSchema, UpdateTripSchema, TripQuerySchema } from './trip.validator';

export const tripController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateTripSchema;
    const result = await tripService.create(body);
    return ApiResponse.success(res, 'Trip created successfully', result, 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as UpdateTripSchema;
    const result = await tripService.update(id, body);
    return ApiResponse.success(res, 'Trip updated successfully', result);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await tripService.delete(id);
    return ApiResponse.success(res, 'Trip deleted successfully');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await tripService.getById(id);
    return ApiResponse.success(res, 'Trip retrieved successfully', result);
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as TripQuerySchema;
    const { items, total } = await tripService.getAll(query);
    const limit = query.limit;
    const page = query.page;
    const totalPages = Math.ceil(total / limit);

    return ApiResponse.success(res, 'Trips retrieved successfully', items, 200, {
      page,
      limit,
      total,
      totalPages,
    });
  }),
};
