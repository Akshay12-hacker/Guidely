import crypto from 'crypto';
import { IMessagingRepository } from './messaging.repository.js';
import { UserModel, NotificationModel } from '../../infrastructure/database/models/index.js';
import { WebSocketManager } from '../../infrastructure/websocket/wsServer.js';
import { AppError } from '../../shared/errors/AppError.js';
import { Conversation, Message, MessageAttachment, UserRole } from '../../shared/types.js';

export class MessagingService {
  private ws = WebSocketManager.getInstance();

  constructor(private messagingRepo: IMessagingRepository) {}

  async getConversations(userId: string, role: UserRole): Promise<Conversation[]> {
    return this.messagingRepo.getConversationsForUser(userId, role);
  }

  async getOrCreateConversation(studentId: string, mentorId: string): Promise<Conversation> {
    return this.messagingRepo.findOrCreateConversation(studentId, mentorId);
  }

  async getMessages(conversationId: string, userId: string, userRole: UserRole): Promise<{
    conversation: Conversation;
    messages: Message[];
  }> {
    const conversation = await this.messagingRepo.getConversationById(conversationId);
    if (!conversation) throw AppError.notFound('Conversation not found');

    if (conversation.studentId !== userId && conversation.mentorId !== userId && userRole !== 'ADMIN') {
      throw AppError.forbidden('Unauthorized to access this conversation');
    }

    // Auto mark as read when fetching messages
    await this.messagingRepo.markAsRead(conversationId, userId, userRole);

    const messages = await this.messagingRepo.getMessages(conversationId);
    return { conversation, messages };
  }

  async sendMessage(senderId: string, senderRole: UserRole, conversationId: string, data: {
    text: string;
    attachments?: MessageAttachment[];
  }): Promise<Message> {
    const conversation = await this.messagingRepo.getConversationById(conversationId);
    if (!conversation) throw AppError.notFound('Conversation not found');

    if (conversation.studentId !== senderId && conversation.mentorId !== senderId) {
      throw AppError.forbidden('Unauthorized to post in this conversation');
    }

    const senderUser = await UserModel.findById(senderId).lean();
    const senderName = senderUser?.fullName || 'User';

    const messageId = 'msg_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const now = new Date().toISOString();

    const message: Message = {
      id: messageId,
      conversationId,
      senderId,
      senderRole,
      senderName,
      text: data.text,
      attachments: data.attachments || [],
      isRead: false,
      createdAt: now
    };

    const saved = await this.messagingRepo.createMessage(message);

    const recipientId = conversation.studentId === senderId ? conversation.mentorId : conversation.studentId;

    // Send real-time chat event via WebSocket
    this.ws.sendToUser(recipientId, {
      type: 'CHAT_MESSAGE',
      payload: {
        message: saved,
        conversationId
      }
    });

    // Check if recipient is offline, create in-app notification
    const isOnline = this.ws.isUserOnline(recipientId);
    if (!isOnline) {
      const notifId = 'notif_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
      await NotificationModel.create({
        _id: notifId,
        userId: recipientId,
        title: `New message from ${senderName}`,
        message: data.text.slice(0, 80),
        type: 'NEW_MESSAGE',
        link: `/messages?conv=${conversationId}`,
        isRead: false
      });
    }

    return saved;
  }

  async markConversationRead(conversationId: string, userId: string, userRole: UserRole): Promise<void> {
    await this.messagingRepo.markAsRead(conversationId, userId, userRole);
  }
}
