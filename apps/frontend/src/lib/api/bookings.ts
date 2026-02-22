import { apiClient } from './client';

export interface Booking {
  id: string;
  listingId: string;
  listingTitle: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  totalPrice: number;
  image?: string;
  owner?: {
    id: string;
    name: string;
    phone: string;
  };
}

export const bookingsApi = {
  // Get user's bookings
  getUserBookings: async (): Promise<{ success: boolean; data: Booking[] }> => {
    const response = await apiClient.get('/bookings/user');
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (id: string): Promise<{ success: boolean; data: Booking }> => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  },

  // Create a booking
  createBooking: async (data: any): Promise<{ success: boolean; data: Booking }> => {
    const response = await apiClient.post('/bookings', data);
    return response.data;
  },

  // Cancel a booking
  cancelBooking: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/bookings/${id}/cancel`);
    return response.data;
  },
};
