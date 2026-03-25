import { Request, Response } from 'express';
import { NotificationService } from '../../services/notifications/notification.service';

const notificationService = new NotificationService();

export class NotificationController {
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const unreadOnly = req.query.unreadOnly === 'true';

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const notifications = await notificationService.getUserNotifications(userId, page, limit, unreadOnly);

      return res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { notificationId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      await notificationService.markAsRead(notificationId, userId);

      return res.status(200).json({
        success: true,
        message: 'Notification marked as read',
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

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      await notificationService.markAllAsRead(userId);

      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async deleteNotification(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { notificationId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      await notificationService.deleteNotification(notificationId, userId);

      return res.status(200).json({
        success: true,
        message: 'Notification deleted',
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

  async getUnreadCount(req: Request, res: Response) {
    try {
      // Ensure req.user is set
      const userId = (req as any).user?.userId;

      if (!userId) {
        console.warn('Unauthorized request to get unread notifications');
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      // Safely call service
      let count = 0;
      try {
        count = await notificationService.getUnreadCount(userId);
      } catch (serviceError) {
        console.error('Error fetching unread notifications:', serviceError);
        // Return a safe response instead of crashing
        return res.status(500).json({
          success: false,
          error: 'Could not fetch unread notifications',
        });
      }

      return res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error) {
      console.error('Unexpected error in getUnreadCount endpoint:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}
