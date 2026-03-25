import { prisma } from '../database.service';

export class MessageService {
  // Get all conversations for a user
  async getConversations(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { id: userId },
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        lastMessage: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Just to get last message if lastMessage is null
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Format conversations and add unread counts
    const result = await Promise.all(
      conversations.map(async (conv: any) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            receiverId: userId,
            isRead: false,
          },
        });

        const otherParticipants = conv.participants.filter((p: any) => p.id !== userId);
        
        return {
          id: conv.id,
          participants: otherParticipants,
          lastMessage: conv.lastMessage || conv.messages[0] || null,
          unreadCount,
          updatedAt: conv.updatedAt,
          createdAt: conv.createdAt,
        };
      })
    );

    return result;
  }

  // Get messages for a specific conversation
  async getMessages(conversationId: string, userId: string, page: number = 1, limit: number = 50) {
    // Verify user is participant
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: userId } },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get messages with pagination
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });

    // Mark received messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      messages: messages.reverse(), // Return in chronological order
      hasMore: messages.length === limit,
    };
  }

  // Send a new message
  async sendMessage(data: {
    senderId: string;
    receiverId: string;
    content: string;
    bookingId?: string;
  }) {
    const { senderId, receiverId, content, bookingId } = data;

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: senderId } } },
          { participants: { some: { id: receiverId } } },
        ],
      },
    });

    if (!conversation) {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [{ id: senderId }, { id: receiverId }],
          },
        },
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        bookingId,
        conversationId: conversation.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });

    // Update conversation's lastMessage and updatedAt
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageId: message.id,
        updatedAt: new Date(),
      },
    });

    // Create notification for receiver
    await this.createMessageNotification(receiverId, senderId, conversation.id, content);

    return message;
  }

  // Mark messages as read
  async markAsRead(conversationId: string, userId: string) {
    return prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  // Get unread count across all conversations
  async getUnreadCount(userId: string) {
    return prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }

  // Delete a conversation
  async deleteConversation(conversationId: string, userId: string) {
    // Verify user is participant
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: userId } },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Delete all messages first (cascade should handle, but just in case)
    await prisma.message.deleteMany({
      where: { conversationId },
    });

    // Delete conversation
    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    return { success: true };
  }

  // Create notification for new message
  private async createMessageNotification(
    receiverId: string,
    senderId: string,
    conversationId: string,
    content: string
  ) {
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { firstName: true, lastName: true },
    });

    const notificationService = new (await import('../notifications/notification.service')).NotificationService();
    
    await notificationService.createNotification({
      userId: receiverId,
      type: 'MESSAGE_RECEIVED',
      title: 'New Message',
      message: `${sender?.firstName} ${sender?.lastName}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
      metadata: { conversationId: conversationId, senderId },
    });
  }
}
