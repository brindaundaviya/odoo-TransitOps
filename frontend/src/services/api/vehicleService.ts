import { axiosClient } from './axiosClient';
import type { ApiSuccessResponse, PaginationMeta } from '@/types/api.types';
import type { Vehicle } from '@/types/models';

export interface VehicleQueryParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface VehicleCreatePayload {
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  vin?: string | null;
  fuelType: string;
  capacity?: number | null;
  odometer?: number;
  status?: string;
}

export type VehicleUpdatePayload = Partial<VehicleCreatePayload>;

interface VehicleListResponse {
  data: Vehicle[];
  meta: PaginationMeta;
}

export const vehicleService = {
  getAll: async (params: VehicleQueryParams = {}): Promise<VehicleListResponse> => {
    const response = await axiosClient.get<ApiSuccessResponse<Vehicle[]>>('/vehicles', { params });
    return {
      data: response.data.data ?? [],
      meta: response.data.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  },

  getById: async (id: string): Promise<Vehicle> => {
    const response = await axiosClient.get<ApiSuccessResponse<Vehicle>>(`/vehicles/${id}`);
    return response.data.data!;
  },

  create: async (payload: VehicleCreatePayload): Promise<Vehicle> => {
    const response = await axiosClient.post<ApiSuccessResponse<Vehicle>>('/vehicles', payload);
    return response.data.data!;
  },

  update: async (id: string, payload: VehicleUpdatePayload): Promise<Vehicle> => {
    const response = await axiosClient.patch<ApiSuccessResponse<Vehicle>>(`/vehicles/${id}`, payload);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/vehicles/${id}`);
  },
};
