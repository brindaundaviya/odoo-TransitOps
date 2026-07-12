export interface PaginationQuery {
  page: number;
  limit: number;
  sort?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: Array<{ field?: string; message: string }>;
}

export type Environment = 'development' | 'production' | 'test';
