import { axiosClient } from './axiosClient';
import type { ApiSuccessResponse, PaginationMeta } from '@/types/api.types';
import type { Trip } from '@/types/models';

export interface TripQueryParams {
  status?: string;
  driverId?: string;
  vehicleId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TripCreatePayload {
  tripCode: string;
  origin: string;
  destination: string;
  scheduledStart: string;
  scheduledEnd: string;
  driverId: string;
  vehicleId: string;
  status?: string;
  distanceKm?: number | null;
  cargoWeight?: number | null;
}

export type TripUpdatePayload = Partial<TripCreatePayload> & {
  actualStart?: string | null;
  actualEnd?: string | null;
};

interface TripListResponse {
  data: Trip[];
  meta: PaginationMeta;
}

export const tripService = {
  getAll: async (params: TripQueryParams = {}): Promise<TripListResponse> => {
    const response = await axiosClient.get<ApiSuccessResponse<Trip[]>>('/trips', { params });
    return {
      data: response.data.data ?? [],
      meta: response.data.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  },

  getById: async (id: string): Promise<Trip> => {
    const response = await axiosClient.get<ApiSuccessResponse<Trip>>(`/trips/${id}`);
    return response.data.data!;
  },

  create: async (payload: TripCreatePayload): Promise<Trip> => {
    const response = await axiosClient.post<ApiSuccessResponse<Trip>>('/trips', payload);
    return response.data.data!;
  },

  update: async (id: string, payload: TripUpdatePayload): Promise<Trip> => {
    const response = await axiosClient.patch<ApiSuccessResponse<Trip>>(`/trips/${id}`, payload);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/trips/${id}`);
  },
};
