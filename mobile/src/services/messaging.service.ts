// Messaging Service

import { apiClient } from '../api/client';
import { Conversation, Message } from '../types';

export const messagingService = {
  async getConversations(): Promise<Conversation[]> {
    return apiClient.get<Conversation[]>('/messaging/conversations');
  },

  async getOrCreateConversation(studentId: string, mentorId: string): Promise<Conversation> {
    return apiClient.post<Conversation>('/messaging/conversations/get-or-create', { studentId, mentorId });
  },

  async getMessages(conversationId: string): Promise<{ conversation: Conversation; messages: Message[] }> {
    return apiClient.get<any>(`/messaging/conversations/${conversationId}/messages`);
  },

  async sendMessage(conversationId: string, data: { text: string; attachments?: any[] }): Promise<Message> {
    return apiClient.post<Message>(`/messaging/conversations/${conversationId}/messages`, data);
  },

  async markRead(conversationId: string): Promise<void> {
    return apiClient.post<void>(`/messaging/conversations/${conversationId}/read`);
  }
};
