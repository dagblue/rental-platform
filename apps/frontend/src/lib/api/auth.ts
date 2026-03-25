import { apiClient } from './client';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '@/types/user.types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Map phone to identifier for the backend
    const payload = {
      identifier: credentials.phone,  // ← Map phone to identifier
      password: credentials.password,
    };
    const response = await apiClient.post('/auth/login', payload);
    if (response.data.success && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.data.data.tokens.access_token);
    }
    return response.data;
  },

  register: async (data: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },

  getProfile: async (): Promise<AuthResponse> => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },
};