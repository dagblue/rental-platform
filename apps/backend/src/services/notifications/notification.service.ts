import { prisma } from '../database.service';
import { NotificationType } from '@prisma/client';

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;  // We'll store this in metadata
  metadata?: any;
}

export class NotificationService {
  async createNotification(data: CreateNotificationData) {
    // Prepare metadata with actionUrl included
    const metadata = {
      ...(data.metadata || {}),
      ...(data.actionUrl ? { actionUrl: data.actionUrl } : {}),
    };

    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        // Store everything in the data JSON field
        data: metadata,
        // Required fields with defaults
        channels: ['IN_APP'],
        emailSent: false,
        smsSent: false,
        pushSent: false,
        inAppSent: true,
        isRead: false,
      },
    });
  }

  async getUserNotifications(userId: string, page: number = 1, limit: number = 20, unreadOnly: boolean = false) {
    const where: any = {
      userId,
    };
    
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    const unreadCount = await prisma.notification.count({
      where: { 
        userId, 
        isRead: false
      },
    });

    return {
      items: notifications,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { 
        isRead: true,
        readAt: new Date()
      },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { 
        userId, 
        isRead: false
      },
      data: { 
        isRead: true,
        readAt: new Date()
      },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  async getUnreadCount(userId: string) {
    try {
      const count = await prisma.notification.count({
        where: { 
          userId, 
          isRead: false
        },
      });
      return count;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      throw error;
    }
  }

  // Helper methods
  async createBookingRequestNotification(userId: string, bookingId: string, listingTitle: string) {
    return this.createNotification({
      userId,
      type: NotificationType.BOOKING_REQUEST,
      title: 'New Booking Request',
      message: `Someone wants to book your ${listingTitle}`,
      actionUrl: `/dashboard/bookings/${bookingId}`,
      metadata: { bookingId },
    });
  }

  async createBookingConfirmedNotification(userId: string, bookingId: string, listingTitle: string) {
    return this.createNotification({
      userId,
      type: NotificationType.BOOKING_CONFIRMED,
      title: 'Booking Confirmed',
      message: `Your booking for ${listingTitle} has been confirmed`,
      actionUrl: `/dashboard/bookings/${bookingId}`,
      metadata: { bookingId },
    });
  }

  async createPaymentReceivedNotification(userId: string, bookingId: string, amount: number) {
    return this.createNotification({
      userId,
      type: NotificationType.PAYMENT_RECEIVED,
      title: 'Payment Received',
      message: `You received ETB ${amount} for booking #${bookingId.slice(-6)}`,
      actionUrl: `/dashboard/payments`,
      metadata: { bookingId, amount },
    });
  }

  async createReviewReceivedNotification(userId: string, reviewId: string, listingTitle: string) {
    return this.createNotification({
      userId,
      type: NotificationType.NEW_REVIEW,
      title: 'New Review',
      message: `Someone left a review for your ${listingTitle}`,
      actionUrl: `/dashboard/reviews`,
      metadata: { reviewId },
    });
  }

  async createMessageReceivedNotification(userId: string, conversationId: string, senderName: string) {
    return this.createNotification({
      userId,
      type: NotificationType.MESSAGE_RECEIVED,
      title: 'New Message',
      message: `You have a new message from ${senderName}`,
      actionUrl: `/dashboard/messages?conversation=${conversationId}`,
      metadata: { conversationId },
    });
  }
}