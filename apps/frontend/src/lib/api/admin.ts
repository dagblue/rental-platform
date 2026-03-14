import { apiClient } from './client';

export interface AdminUser {
  id: string;
  phone: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: 'RENTER' | 'OWNER' | 'AGENT' | 'ADMIN' | 'SUPPORT' | 'MODERATOR';
  trustLevel: 'NEW' | 'BASIC' | 'VERIFIED' | 'TRUSTED';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
  createdAt: string;
  lastActive?: string;
  listingsCount: number;
  bookingsCount: number;
}

export interface AdminListing {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  pricePerDay: number;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'INACTIVE' | 'BANNED';
  createdAt: string;
  reportsCount: number;
  views: number;
}

export interface AdminReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  targetId: string;
  targetType: 'USER' | 'LISTING';
  rating: number;
  comment: string;
  reportsCount: number;
  status: 'ACTIVE' | 'FLAGGED' | 'REMOVED';
  createdAt: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalListings: number;
  totalBookings: number;
  totalRevenue: number;
  pendingListings: number;
  pendingReviews: number;
  openDisputes: number;
  recentActivity: {
    date: string;
    users: number;
    listings: number;
    bookings: number;
  }[];
}

export const adminApi = {
  // Dashboard Stats
  getStats: async (): Promise<{ success: boolean; data: PlatformStats }> => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  // User Management
  getUsers: async (params?: { page?: number; limit?: number; role?: string; status?: string }): Promise<{ success: boolean; data: { items: AdminUser[]; total: number } }> => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  updateUserStatus: async (userId: string, status: string, reason?: string): Promise<{ success: boolean }> => {
    const response = await apiClient.put(`/admin/users/${userId}/status`, { status, reason });
    return response.data;
  },

  updateUserRole: async (userId: string, role: string): Promise<{ success: boolean }> => {
    const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  // Listing Management
  getListings: async (params?: { page?: number; limit?: number; status?: string }): Promise<{ success: boolean; data: { items: AdminListing[]; total: number } }> => {
    const response = await apiClient.get('/admin/listings', { params });
    return response.data;
  },

  updateListingStatus: async (listingId: string, status: string, reason?: string): Promise<{ success: boolean }> => {
    const response = await apiClient.put(`/admin/listings/${listingId}/status`, { status, reason });
    return response.data;
  },

  // Review Management
  getReviews: async (params?: { page?: number; limit?: number; status?: string }): Promise<{ success: boolean; data: { items: AdminReview[]; total: number } }> => {
    const response = await apiClient.get('/admin/reviews', { params });
    return response.data;
  },

  removeReview: async (reviewId: string, reason: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/admin/reviews/${reviewId}`, { data: { reason } });
    return response.data;
  },

  // Reports and Disputes
  getReports: async (params?: { page?: number; limit?: number; type?: string }): Promise<{ success: boolean; data: any }> => {
    const response = await apiClient.get('/admin/reports', { params });
    return response.data;
  },

  resolveReport: async (reportId: string, action: string, notes?: string): Promise<{ success: boolean }> => {
    const response = await apiClient.put(`/admin/reports/${reportId}`, { action, notes });
    return response.data;
  },
};