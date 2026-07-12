import { axiosClient } from './axiosClient';
import type { ApiSuccessResponse, PaginationMeta } from '@/types/api.types';
import type { MaintenanceLog } from '@/types/models';

export interface MaintenanceQueryParams {
  status?: string;
  vehicleId?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MaintenanceCreatePayload {
  vehicleId: string;
  type: string;
  description: string;
  scheduledDate: string;
  completedDate?: string | null;
  cost?: number | null;
  serviceProvider?: string | null;
  status?: string;
  odometerAtService?: number | null;
}

export type MaintenanceUpdatePayload = Partial<MaintenanceCreatePayload>;

interface MaintenanceListResponse {
  data: MaintenanceLog[];
  meta: PaginationMeta;
}

export const maintenanceService = {
  getAll: async (params: MaintenanceQueryParams = {}): Promise<MaintenanceListResponse> => {
    const response = await axiosClient.get<ApiSuccessResponse<MaintenanceLog[]>>('/maintenance', { params });
    return {
      data: response.data.data ?? [],
      meta: response.data.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  },

  getById: async (id: string): Promise<MaintenanceLog> => {
    const response = await axiosClient.get<ApiSuccessResponse<MaintenanceLog>>(`/maintenance/${id}`);
    return response.data.data!;
  },

  create: async (payload: MaintenanceCreatePayload): Promise<MaintenanceLog> => {
    const response = await axiosClient.post<ApiSuccessResponse<MaintenanceLog>>('/maintenance', payload);
    return response.data.data!;
  },

  update: async (id: string, payload: MaintenanceUpdatePayload): Promise<MaintenanceLog> => {
    const response = await axiosClient.patch<ApiSuccessResponse<MaintenanceLog>>(`/maintenance/${id}`, payload);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/maintenance/${id}`);
  },
};
