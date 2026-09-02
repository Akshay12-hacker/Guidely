import { Response, NextFunction } from 'express';
import { MessagingService } from './messaging.service.js';
import { AuthenticatedRequest } from '../auth/auth.middleware.js';
import { z } from 'zod';

const sendMessageSchema = z.object({
  text: z.string().min(1, 'Message cannot be empty'),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number()
  })).optional()
});

const getOrCreateSchema = z.object({
  studentId: z.string().min(1),
  mentorId: z.string().min(1)
});

export class MessagingController {
  constructor(private messagingService: MessagingService) {}

  getConversations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userId, role } = req.user!;
      const conversations = await this.messagingService.getConversations(userId, role);
      res.status(200).json({ success: true, data: conversations });
    } catch (err) {
      next(err);
    }
  };

  getOrCreateConversation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const validated = getOrCreateSchema.parse(req.body);
      const conversation = await this.messagingService.getOrCreateConversation(validated.studentId, validated.mentorId);
      res.status(200).json({ success: true, data: conversation });
    } catch (err) {
      next(err);
    }
  };

  getMessages = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { conversationId } = req.params;
      const { userId, role } = req.user!;
      const result = await this.messagingService.getMessages(conversationId, userId, role);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  sendMessage = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { conversationId } = req.params;
      const { userId, role } = req.user!;
      const validated = sendMessageSchema.parse(req.body);
      const message = await this.messagingService.sendMessage(userId, role, conversationId, validated);
      res.status(201).json({ success: true, data: message });
    } catch (err) {
      next(err);
    }
  };

  markAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { conversationId } = req.params;
      const { userId, role } = req.user!;
      await this.messagingService.markConversationRead(conversationId, userId, role);
      res.status(200).json({ success: true, message: 'Marked as read' });
    } catch (err) {
      next(err);
    }
  };
}
