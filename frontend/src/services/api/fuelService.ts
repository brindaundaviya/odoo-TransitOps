import { axiosClient } from './axiosClient';
import type { ApiSuccessResponse, PaginationMeta } from '@/types/api.types';
import type { FuelLog } from '@/types/models';

export interface FuelQueryParams {
  vehicleId?: string;
  tripId?: string;
  driverId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface FuelCreatePayload {
  vehicleId: string;
  tripId?: string | null;
  driverId?: string | null;
  loggedAt: string;
  fuelType: string;
  quantity: number;
  cost: number;
  odometer: number;
  station?: string | null;
}

export type FuelUpdatePayload = Partial<FuelCreatePayload>;

interface FuelListResponse {
  data: FuelLog[];
  meta: PaginationMeta;
}

export const fuelService = {
  getAll: async (params: FuelQueryParams = {}): Promise<FuelListResponse> => {
    const response = await axiosClient.get<ApiSuccessResponse<FuelLog[]>>('/fuel', { params });
    return {
      data: response.data.data ?? [],
      meta: response.data.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  },

  getById: async (id: string): Promise<FuelLog> => {
    const response = await axiosClient.get<ApiSuccessResponse<FuelLog>>(`/fuel/${id}`);
    return response.data.data!;
  },

  create: async (payload: FuelCreatePayload): Promise<FuelLog> => {
    const response = await axiosClient.post<ApiSuccessResponse<FuelLog>>('/fuel', payload);
    return response.data.data!;
  },

  update: async (id: string, payload: FuelUpdatePayload): Promise<FuelLog> => {
    const response = await axiosClient.patch<ApiSuccessResponse<FuelLog>>(`/fuel/${id}`, payload);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/fuel/${id}`);
  },
};
