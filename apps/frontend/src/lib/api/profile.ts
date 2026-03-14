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
  // Get profile data
  getProfile: async (): Promise<{ success: boolean; data: ProfileData }> => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (data: Partial<ProfileData>): Promise<{ success: boolean; data: ProfileData }> => {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },

  // Get trust data
  getTrustData: async (): Promise<{ success: boolean; data: TrustData }> => {
    const response = await apiClient.get('/users/trust');
    return response.data;
  },

  // Upload profile picture
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

  // Request ID verification
  requestIdVerification: async (data: {
    idNumber: string;
    idType: string;
    documentFront: string;
    documentBack?: string;
  }): Promise<{ success: boolean; data: any }> => {
    const response = await apiClient.post('/users/verify-id', data);
    return response.data;
  },

  // Get verification status
  getVerificationStatus: async (): Promise<{ success: boolean; data: any[] }> => {
    const response = await apiClient.get('/users/verification-status');
    return response.data;
  },

  // Add guarantor
  addGuarantor: async (data: { guarantorPhone: string; relationship: string }): Promise<{ success: boolean; data: any }> => {
    const response = await apiClient.post('/users/guarantors', data);
    return response.data;
  },

  // Get guarantors
  getGuarantors: async (): Promise<{ success: boolean; data: any[] }> => {
    const response = await apiClient.get('/users/guarantors');
    return response.data;
  },
};