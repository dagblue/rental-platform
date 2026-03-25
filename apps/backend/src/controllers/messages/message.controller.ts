import { Request, Response } from 'express';
import { MessageService } from '../../services/messages/message.service';

const messageService = new MessageService();

export class MessageController {
  // Get all conversations for current user
  async getConversations(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const conversations = await messageService.getConversations(userId);

      return res.status(200).json({
        success: true,
        data: conversations,
      });
    } catch (error) {
      console.error('Get conversations error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Get messages for a conversation
  async getMessages(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { conversationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const result = await messageService.getMessages(conversationId, userId, page, limit);

      return res.status(200).json({
        success: true,
        data: result.messages,
        hasMore: result.hasMore,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Send a new message
  async sendMessage(req: Request, res: Response) {
    try {
      const senderId = (req as any).user?.userId;
      const { receiverId, content, bookingId } = req.body;

      if (!senderId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      if (!receiverId || !content) {
        return res.status(400).json({
          success: false,
          error: 'Receiver ID and content are required',
        });
      }

      if (senderId === receiverId) {
        return res.status(400).json({
          success: false,
          error: 'Cannot send message to yourself',
        });
      }

      const message = await messageService.sendMessage({
        senderId,
        receiverId,
        content,
        bookingId,
      });

      return res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      console.error('Send message error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Mark messages as read
  async markAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { conversationId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      await messageService.markAsRead(conversationId, userId);

      return res.status(200).json({
        success: true,
        message: 'Messages marked as read',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Get unread count
  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const count = await messageService.getUnreadCount(userId);

      return res.status(200).json({
        success: true,
        data: { total: count },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Delete conversation
  async deleteConversation(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { conversationId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      await messageService.deleteConversation(conversationId, userId);

      return res.status(200).json({
        success: true,
        message: 'Conversation deleted',
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}
