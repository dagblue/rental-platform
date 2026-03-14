import { apiClient } from './client';

export interface Notification {
  id: string;
  type: 'BOOKING_REQUEST' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'PAYMENT_RECEIVED' | 'PAYMENT_REFUNDED' | 'REVIEW_RECEIVED' | 'MESSAGE_RECEIVED' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: any;
  createdAt: string;
}

export const notificationsApi = {
  // Get all notifications for the current user
  getNotifications: async (params?: { page?: number; limit?: number; unreadOnly?: boolean }): Promise<{ success: boolean; data: { items: Notification[]; total: number; unreadCount: number } }> => {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  // Mark a notification as read
  markAsRead: async (notificationId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ success: boolean }> => {
    const response = await apiClient.put('/notifications/read-all');
    return response.data;
  },

  // Delete a notification
  deleteNotification: async (notificationId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ success: boolean; data: { count: number } }> => {
    const response = await apiClient.get('/notifications/unread/count');
    return response.data;
  },
};
