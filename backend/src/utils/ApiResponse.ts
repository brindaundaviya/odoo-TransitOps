import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode = 200,
    meta?: PaginationMeta,
  ): Response {
    const response: ApiSuccessResponse<T> = {
      success: true,
      message,
    };

    if (data !== undefined) {
      response.data = data;
    }

    if (meta !== undefined) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }
}
