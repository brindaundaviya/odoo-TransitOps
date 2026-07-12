import { axiosClient } from './axiosClient';
import type { ApiSuccessResponse, PaginationMeta } from '@/types/api.types';
import type { Expense } from '@/types/models';

export interface ExpenseQueryParams {
  category?: string;
  status?: string;
  vehicleId?: string;
  tripId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ExpenseCreatePayload {
  category: string;
  amount: number;
  currency?: string;
  expenseDate: string;
  vehicleId?: string | null;
  tripId?: string | null;
  description: string;
  receiptRef?: string | null;
  status?: string;
  submittedBy?: string | null;
}

export type ExpenseUpdatePayload = Partial<ExpenseCreatePayload>;

interface ExpenseListResponse {
  data: Expense[];
  meta: PaginationMeta;
}

export const expenseService = {
  getAll: async (params: ExpenseQueryParams = {}): Promise<ExpenseListResponse> => {
    const response = await axiosClient.get<ApiSuccessResponse<Expense[]>>('/expenses', { params });
    return {
      data: response.data.data ?? [],
      meta: response.data.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  },

  getById: async (id: string): Promise<Expense> => {
    const response = await axiosClient.get<ApiSuccessResponse<Expense>>(`/expenses/${id}`);
    return response.data.data!;
  },

  create: async (payload: ExpenseCreatePayload): Promise<Expense> => {
    const response = await axiosClient.post<ApiSuccessResponse<Expense>>('/expenses', payload);
    return response.data.data!;
  },

  update: async (id: string, payload: ExpenseUpdatePayload): Promise<Expense> => {
    const response = await axiosClient.patch<ApiSuccessResponse<Expense>>(`/expenses/${id}`, payload);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/expenses/${id}`);
  },
};
