import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { expenseService } from './expense.service';
import { CreateExpenseSchema, UpdateExpenseSchema, ExpenseQuerySchema } from './expense.validator';

export const expenseController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateExpenseSchema;
    // Set submitter from authenticated user if not explicitly provided
    if (!body.submittedBy && req.user) {
      body.submittedBy = req.user.id;
    }
    const result = await expenseService.create(body);
    return ApiResponse.success(res, 'Expense log created successfully', result, 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as UpdateExpenseSchema;
    const result = await expenseService.update(id, body);
    return ApiResponse.success(res, 'Expense log updated successfully', result);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await expenseService.delete(id);
    return ApiResponse.success(res, 'Expense log deleted successfully');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await expenseService.getById(id);
    return ApiResponse.success(res, 'Expense log retrieved successfully', result);
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ExpenseQuerySchema;
    const { items, total } = await expenseService.getAll(query);
    const limit = query.limit;
    const page = query.page;
    const totalPages = Math.ceil(total / limit);

    return ApiResponse.success(res, 'Expenses retrieved successfully', items, 200, {
      page,
      limit,
      total,
      totalPages,
    });
  }),
};
