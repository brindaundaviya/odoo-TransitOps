import { axiosClient } from './axiosClient';
import type { ApiSuccessResponse, PaginationMeta } from '@/types/api.types';
import type { Driver } from '@/types/models';

export interface DriverQueryParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DriverCreatePayload {
  userId?: string | null;
  employeeId: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiry: string;
  phone: string;
  status?: string;
  safetyScore?: number;
}

export type DriverUpdatePayload = Partial<DriverCreatePayload>;

interface DriverListResponse {
  data: Driver[];
  meta: PaginationMeta;
}

export const driverService = {
  getAll: async (params: DriverQueryParams = {}): Promise<DriverListResponse> => {
    const response = await axiosClient.get<ApiSuccessResponse<Driver[]>>('/drivers', { params });
    return {
      data: response.data.data ?? [],
      meta: response.data.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  },

  getById: async (id: string): Promise<Driver> => {
    const response = await axiosClient.get<ApiSuccessResponse<Driver>>(`/drivers/${id}`);
    return response.data.data!;
  },

  create: async (payload: DriverCreatePayload): Promise<Driver> => {
    const response = await axiosClient.post<ApiSuccessResponse<Driver>>('/drivers', payload);
    return response.data.data!;
  },

  update: async (id: string, payload: DriverUpdatePayload): Promise<Driver> => {
    const response = await axiosClient.patch<ApiSuccessResponse<Driver>>(`/drivers/${id}`, payload);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/drivers/${id}`);
  },
};
