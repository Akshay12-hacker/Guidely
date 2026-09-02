// WebSocket Real-Time Sync & Presence Context for Mobile

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { apiConfig } from '../api/config';
import { apiClient } from '../api/client';
import { Message, Notification } from '../types';

interface TypingInfo {
  userId: string;
  isTyping: boolean;
}

interface WebSocketContextType {
  isConnected: boolean;
  onlineUsers: Set<string>;
  typingState: Record<string, TypingInfo>;
  latestMessage: { conversationId: string; message: Message } | null;
  unreadNotifsCount: number;
  sendTyping: (receiverId: string, conversationId: string, isTyping: boolean) => void;
  sendReadReceipt: (conversationId: string, messageId: string) => void;
  setUnreadNotifsCount: React.Dispatch<React.SetStateAction<number>>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingState, setTypingState] = useState<Record<string, TypingInfo>>({});
  const [latestMessage, setLatestMessage] = useState<{ conversationId: string; message: Message } | null>(null);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const connect = useCallback(() => {
    const token = apiClient.getToken();
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    try {
      const wsUrl = `${apiConfig.wsBaseUrl}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { event: eventName, data } = payload;

          switch (eventName) {
            case 'PRESENCE':
              if (data?.onlineUserIds) {
                setOnlineUsers(new Set(data.onlineUserIds));
              }
              break;

            case 'CHAT_MESSAGE':
              if (data?.message) {
                setLatestMessage({
                  conversationId: data.conversationId,
                  message: data.message
                });
                if (data.message.senderId !== user?.id) {
                  showToast('info', `Message from ${data.message.senderName || 'Mentor'}`, data.message.text);
                }
              }
              break;

            case 'TYPING':
              if (data?.conversationId) {
                setTypingState(prev => ({
                  ...prev,
                  [data.conversationId]: {
                    userId: data.senderId,
                    isTyping: data.isTyping
                  }
                }));
              }
              break;

            case 'NOTIFICATION':
              if (data?.notification) {
                setUnreadNotifsCount(prev => prev + 1);
                showToast('info', data.notification.title, data.notification.message);
              }
              break;

            default:
              break;
          }
        } catch {
          // ignore non-json messages
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (isAuthenticated) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };
    } catch {
      setIsConnected(false);
    }
  }, [isAuthenticated, user?.id, showToast]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [connect]);

  const sendTyping = (receiverId: string, conversationId: string, isTyping: boolean) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        event: 'TYPING',
        data: { receiverId, conversationId, isTyping }
      }));
    }
  };

  const sendReadReceipt = (conversationId: string, messageId: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        event: 'READ_RECEIPT',
        data: { conversationId, messageId }
      }));
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        onlineUsers,
        typingState,
        latestMessage,
        unreadNotifsCount,
        sendTyping,
        sendReadReceipt,
        setUnreadNotifsCount
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
