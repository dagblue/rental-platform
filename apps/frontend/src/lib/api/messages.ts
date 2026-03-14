import { apiClient } from './client';

export interface Conversation {
  id: string;
  participants: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface SendMessageData {
  conversationId?: string;
  recipientId?: string;
  content: string;
  listingId?: string;
  bookingId?: string;
}

export const messagesApi = {
  // Get all conversations for the current user
  getConversations: async (): Promise<{ success: boolean; data: Conversation[] }> => {
    const response = await apiClient.get('/messages/conversations');
    return response.data;
  },

  // Get messages for a specific conversation
  getMessages: async (conversationId: string, page?: number): Promise<{ success: boolean; data: Message[]; hasMore: boolean }> => {
    const response = await apiClient.get(`/messages/conversations/${conversationId}`, {
      params: { page, limit: 50 }
    });
    return response.data;
  },

  // Send a new message
  sendMessage: async (data: SendMessageData): Promise<{ success: boolean; data: Message }> => {
    const response = await apiClient.post('/messages', data);
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (conversationId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.put(`/messages/conversations/${conversationId}/read`);
    return response.data;
  },

  // Delete a conversation
  deleteConversation: async (conversationId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/messages/conversations/${conversationId}`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ success: boolean; data: { total: number } }> => {
    const response = await apiClient.get('/messages/unread/count');
    return response.data;
  },
};