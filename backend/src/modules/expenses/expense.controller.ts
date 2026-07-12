import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { expenseService } from './expense.service';
import { CreateExpenseSchema, UpdateExpenseSchema, ExpenseQuerySchema } from './expense.validator';
import { Decimal } from '@prisma/client/runtime/library';

export const expenseController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as CreateExpenseSchema;
    // Set submitter from authenticated user if not explicitly provided
    if (!body.submittedBy && req.user) {
      body.submittedBy = req.user.id;
    }
    // Convert number to Decimal for Prisma
    const input = {
      ...body,
      amount: new Decimal(body.amount),
    };
    const result = await expenseService.create(input as any);
    return ApiResponse.success(res, 'Expense log created successfully', result, 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as UpdateExpenseSchema;
    // Convert number to Decimal for Prisma if amount is provided
    const input = {
      ...body,
      amount: body.amount !== undefined ? new Decimal(body.amount) : undefined,
    };
    const result = await expenseService.update(String(id), input as any);
    return ApiResponse.success(res, 'Expense log updated successfully', result);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await expenseService.delete(String(id));
    return ApiResponse.success(res, 'Expense log deleted successfully');
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await expenseService.getById(String(id));
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
