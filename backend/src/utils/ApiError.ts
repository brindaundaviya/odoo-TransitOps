export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: Array<{ field?: string; message: string }>;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    errors: Array<{ field?: string; message: string }> = [],
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors.length > 0 ? errors : [{ message }];
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
