// Production WebSocket Real-Time Sync & Presence Manager for Guidely Mobile
// Supports exponential backoff reconnection, token query auth, presence, chat, typing, project & session updates

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

type WsEventListener = (data: any) => void;

interface WebSocketContextType {
  isConnected: boolean;
  onlineUsers: Set<string>;
  typingState: Record<string, TypingInfo>;
  latestMessage: { conversationId: string; message: Message } | null;
  unreadNotifsCount: number;
  sendTyping: (recipientId: string, conversationId: string, isTyping: boolean) => void;
  sendReadReceipt: (recipientId: string, conversationId: string) => void;
  setUnreadNotifsCount: React.Dispatch<React.SetStateAction<number>>;
  addEventListener: (eventType: string, listener: WsEventListener) => () => void;
  reconnect: () => void;
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
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<any>(null);
  const listenersRef = useRef<Map<string, Set<WsEventListener>>>(new Map());

  const addEventListener = useCallback((eventType: string, listener: WsEventListener): (() => void) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    listenersRef.current.get(eventType)!.add(listener);
    return () => {
      listenersRef.current.get(eventType)?.delete(listener);
    };
  }, []);

  const dispatchEventToListeners = useCallback((eventType: string, payload: any) => {
    const listeners = listenersRef.current.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(payload);
        } catch (err) {
          console.warn(`Error in WS listener for ${eventType}:`, err);
        }
      });
    }
  }, []);

  const connect = useCallback(() => {
    const token = apiClient.getToken();
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch {}
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    try {
      // Clear any pending reconnect
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      const wsUrl = `${apiConfig.wsBaseUrl}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const eventType = parsed.type || parsed.event;
          const payload = parsed.payload !== undefined ? parsed.payload : parsed.data;

          // Dispatch to external listeners
          if (eventType) {
            dispatchEventToListeners(eventType, payload);
          }

          switch (eventType) {
            case 'PRESENCE':
              if (payload?.onlineUserIds) {
                setOnlineUsers(new Set(payload.onlineUserIds));
              }
              break;

            case 'CHAT_MESSAGE':
              if (payload?.message) {
                setLatestMessage({
                  conversationId: payload.conversationId,
                  message: payload.message
                });
                if (payload.message.senderId !== user?.id) {
                  showToast('info', `Message from ${payload.message.senderName || 'Mentor'}`, payload.message.text);
                }
              }
              break;

            case 'TYPING':
              if (payload?.conversationId) {
                setTypingState(prev => ({
                  ...prev,
                  [payload.conversationId]: {
                    userId: payload.senderId,
                    isTyping: !!payload.isTyping
                  }
                }));
              }
              break;

            case 'NOTIFICATION':
              if (payload?.notification) {
                setUnreadNotifsCount(prev => prev + 1);
                showToast('info', payload.notification.title || 'Notification', payload.notification.message);
              }
              break;

            case 'PROJECT_UPDATE':
              showToast('info', 'Project Updated 📁', payload?.message || 'New changes in your project workspace.');
              break;

            case 'SESSION_UPDATE':
              showToast('info', 'Session Update 📅', payload?.message || 'Your mentorship session details have changed.');
              break;

            default:
              break;
          }
        } catch {
          // Ignore non-json heartbeats
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        socketRef.current = null;

        // Exponential backoff reconnect with jitter (1s, 2s, 4s, 8s, up to 30s)
        if (isAuthenticated) {
          const attempt = reconnectAttemptsRef.current;
          const baseDelay = Math.min(1000 * Math.pow(2, attempt), 30000);
          const jitter = Math.random() * 1000;
          const delay = baseDelay + jitter;
          reconnectAttemptsRef.current = attempt + 1;

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch {
      setIsConnected(false);
    }
  }, [isAuthenticated, user?.id, showToast, dispatchEventToListeners]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch {}
        socketRef.current = null;
      }
    };
  }, [connect]);

  const sendTyping = (recipientId: string, conversationId: string, isTyping: boolean) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'TYPING',
        payload: { recipientId, conversationId, isTyping },
        event: 'TYPING',
        data: { recipientId, conversationId, isTyping }
      }));
    }
  };

  const sendReadReceipt = (recipientId: string, conversationId: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'READ_RECEIPT',
        payload: { recipientId, conversationId },
        event: 'READ_RECEIPT',
        data: { recipientId, conversationId }
      }));
    }
  };

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

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
        setUnreadNotifsCount,
        addEventListener,
        reconnect
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
