import { apiClient } from './client';

export interface ProfileData {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  region?: string;
  city?: string;
  subcity?: string;
  woreda?: string;
  kebele?: string;
  houseNumber?: string;
  occupation?: string;
  bio?: string;
  profileImage?: string;
}

export interface TrustData {
  level: 'NEW' | 'BASIC' | 'VERIFIED' | 'TRUSTED';
  score: number;
  verifications: {
    phone: boolean;
    email: boolean;
    id: boolean;
    address: boolean;
    guarantors: number;
  };
}

export const profileApi = {
  getProfile: async (): Promise<{ success: boolean; data: ProfileData }> => {
    const response = await apiClient.get<{ success: boolean; data: { user: ProfileData } }>(
      '/users/profile'
    );
    const body = response.data;
    if (body.success && body.data?.user) {
      return { success: true, data: body.data.user };
    }
    return { success: false, data: {} as ProfileData };
  },

  updateProfile: async (data: Partial<ProfileData>): Promise<{ success: boolean; data: ProfileData }> => {
    const response = await apiClient.put<{ success: boolean; data: { user: ProfileData } }>(
      '/users/profile',
      data
    );
    const body = response.data;
    if (body.success && body.data?.user) {
      return { success: true, data: body.data.user };
    }
    return { success: false, data: {} as ProfileData };
  },

  getTrustData: async (): Promise<{ success: boolean; data: TrustData }> => {
    const response = await apiClient.get('/users/trust');
    return response.data;
  },

  uploadProfilePicture: async (file: File): Promise<{ success: boolean; data: { url: string } }> => {
    const formData = new FormData();
    formData.append('picture', file);
    const response = await apiClient.post('/users/upload/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  requestIdVerification: async (data: {
    idNumber: string;
    idType: string;
    documentFront: string;
    documentBack?: string;
  }): Promise<{ success: boolean; data: unknown }> => {
    const response = await apiClient.post('/users/verify-id', data);
    return response.data;
  },

  getVerificationStatus: async (): Promise<{ success: boolean; data: unknown[] }> => {
    const response = await apiClient.get('/users/verification-status');
    return response.data;
  },

  addGuarantor: async (data: {
    guarantorPhone: string;
    relationship: string;
  }): Promise<{ success: boolean; data: unknown }> => {
    const response = await apiClient.post('/users/guarantors', data);
    return response.data;
  },

  getGuarantors: async (): Promise<{ success: boolean; data: unknown[] }> => {
    const response = await apiClient.get('/users/guarantors');
    return response.data;
  },
};
