import { apiClient } from './client';

export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  targetId: string;
  targetType: 'USER' | 'LISTING';
  rating: number;
  comment: string;
  pros: string[];
  cons: string[];
  images: string[];
  isAnonymous: boolean;
  verified: boolean;
  helpful: number;
  response?: {
    id: string;
    comment: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  targetId: string;
  targetType: 'USER' | 'LISTING';
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentTrend: number;
  verifiedPercentage: number;
}

export interface CreateReviewData {
  bookingId: string;
  targetId: string;
  targetType: 'USER' | 'LISTING';
  rating: number;
  comment: string;
  pros?: string[];
  cons?: string[];
  images?: string[];
  isAnonymous?: boolean;
}

export const reviewsApi = {
  // Get reviews for a target (user or listing)
  getReviews: async (
    targetId: string, 
    params?: { page?: number; limit?: number; sortBy?: string }
  ): Promise<{ success: boolean; data: { items: Review[]; total: number; page: number; limit: number; totalPages: number; stats: ReviewStats } }> => {
    const response = await apiClient.get(`/reviews/target/${targetId}`, { params });
    return response.data;
  },

  // Get rating statistics for a target
  getReviewStats: async (targetId: string): Promise<{ success: boolean; data: ReviewStats }> => {
    const response = await apiClient.get(`/reviews/target/${targetId}/stats`);
    return response.data;
  },

  // Create a new review
  createReview: async (data: CreateReviewData): Promise<{ success: boolean; data: Review }> => {
    const response = await apiClient.post('/reviews', data);
    return response.data;
  },

  // Update a review
  updateReview: async (reviewId: string, data: Partial<CreateReviewData>): Promise<{ success: boolean; data: Review }> => {
    const response = await apiClient.put(`/reviews/${reviewId}`, data);
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Mark review as helpful
  markHelpful: async (reviewId: string): Promise<{ success: boolean; data: { helpful: number } }> => {
    const response = await apiClient.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  },

  // Add response to review (for owners)
  addResponse: async (reviewId: string, comment: string): Promise<{ success: boolean; data: any }> => {
    const response = await apiClient.post(`/reviews/${reviewId}/response`, { comment });
    return response.data;
  },

  // Get user's reviews (reviews written by user)
  getUserReviews: async (params?: { page?: number; limit?: number }): Promise<{ success: boolean; data: { items: Review[]; total: number } }> => {
    const response = await apiClient.get('/reviews/user/me', { params });
    return response.data;
  },
};