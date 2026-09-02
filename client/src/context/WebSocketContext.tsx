import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext.js';
import { useToast } from './ToastContext.js';
import { Message, Notification } from '../../../shared/types.js';

interface WebSocketContextType {
  isConnected: boolean;
  onlineUsers: Set<string>;
  unreadNotifsCount: number;
  setUnreadNotifsCount: React.Dispatch<React.SetStateAction<number>>;
  latestMessage: { message: Message; conversationId: string } | null;
  typingState: { [conversationId: string]: { senderId: string; isTyping: boolean } };
  sendTyping: (recipientId: string, conversationId: string, isTyping: boolean) => void;
  sendReadReceipt: (recipientId: string, conversationId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);
  const [latestMessage, setLatestMessage] = useState<{ message: Message; conversationId: string } | null>(null);
  const [typingState, setTypingState] = useState<{ [conversationId: string]: { senderId: string; isTyping: boolean } }>({});

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const connect = useCallback(() => {
    if (!token || !isAuthenticated) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        ws.send(JSON.stringify({ type: 'AUTH', payload: { token } }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case 'PRESENCE': {
              const { userId, isOnline } = data.payload;
              setOnlineUsers(prev => {
                const next = new Set(prev);
                if (isOnline) next.add(userId);
                else next.delete(userId);
                return next;
              });
              break;
            }

            case 'CHAT_MESSAGE': {
              const { message, conversationId } = data.payload;
              setLatestMessage({ message, conversationId });
              showToast('info', `Message from ${message.senderName || 'Mentor/Student'}`, message.text.slice(0, 50));
              break;
            }

            case 'TYPING': {
              const { senderId, isTyping, conversationId } = data.payload;
              setTypingState(prev => ({
                ...prev,
                [conversationId]: { senderId, isTyping }
              }));
              break;
            }

            case 'NOTIFICATION': {
              const notif: Notification = data.payload;
              setUnreadNotifsCount(prev => prev + 1);
              showToast('info', notif.title, notif.message);
              break;
            }

            case 'PROJECT_UPDATE': {
              showToast('success', 'Project Updated 🚀', data.payload.message);
              break;
            }

            default:
              break;
          }
        } catch {
          // ignore non-json messages
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt reconnect after 4 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 4000);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch {
      // ignore
    }
  }, [token, isAuthenticated, showToast]);

  useEffect(() => {
    if (isAuthenticated && token) {
      connect();
    } else {
      if (wsRef.current) {
        wsRef.current.close();
      }
    }

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [isAuthenticated, token, connect]);

  const sendTyping = (recipientId: string, conversationId: string, isTyping: boolean) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'TYPING',
        payload: { recipientId, conversationId, isTyping }
      }));
    }
  };

  const sendReadReceipt = (recipientId: string, conversationId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'READ_RECEIPT',
        payload: { recipientId, conversationId }
      }));
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        onlineUsers,
        unreadNotifsCount,
        setUnreadNotifsCount,
        latestMessage,
        typingState,
        sendTyping,
        sendReadReceipt
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within WebSocketProvider');
  return context;
};
