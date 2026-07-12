import { axiosClient } from './axiosClient';
import type { LoginSchema } from '@/schemas/auth.schema';
import type { User } from '@/types/auth.types';

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export const authService = {
  login: async (credentials: LoginSchema): Promise<LoginResponse> => {
    const response = await axiosClient.post('/auth/login', credentials);
    const { success, data, message } = response.data;
    if (success && data) {
      return data;
    }
    throw new Error(message || 'Login failed');
  },

  getProfile: async (): Promise<User> => {
    const response = await axiosClient.get('/auth/me');
    const { success, data, message } = response.data;
    if (success && data && data.user) {
      return data.user;
    }
    throw new Error(message || 'Failed to retrieve profile');
  },
};
