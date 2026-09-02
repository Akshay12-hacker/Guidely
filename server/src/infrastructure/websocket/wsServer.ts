import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { JwtService } from '../../shared/utils/jwt.js';
import { logger } from '../../shared/utils/logger.js';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  userRole?: string;
  isAlive?: boolean;
}

export interface WsEventMessage {
  type: 
    | 'AUTH'
    | 'CHAT_MESSAGE'
    | 'TYPING'
    | 'READ_RECEIPT'
    | 'NOTIFICATION'
    | 'PRESENCE'
    | 'PROJECT_UPDATE'
    | 'SESSION_UPDATE';
  payload: any;
}

export class WebSocketManager {
  private static instance: WebSocketManager;
  private wss: WebSocketServer | null = null;
  private clients = new Map<string, Set<AuthenticatedWebSocket>>();

  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public initialize(server: any): void {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: AuthenticatedWebSocket, req: IncomingMessage) => {
      ws.isAlive = true;

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Parse token from query parameter if present
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      if (token) {
        try {
          const payload = JwtService.verify(token);
          this.registerClient(payload.userId, payload.role, ws);
        } catch {
          logger.warn('WebSocket connection attempt with invalid token');
        }
      }

      ws.on('message', (data: string) => {
        try {
          const event: WsEventMessage = JSON.parse(data.toString());
          this.handleEvent(ws, event);
        } catch (err) {
          logger.error('Failed to parse WebSocket message:', err);
        }
      });

      ws.on('close', () => {
        if (ws.userId) {
          this.unregisterClient(ws.userId, ws);
        }
      });

      ws.on('error', (err) => {
        logger.error('WebSocket client error:', err);
      });
    });

    // Heartbeat to prune dead connections
    const interval = setInterval(() => {
      if (!this.wss) return;
      this.wss.clients.forEach((ws: WebSocket) => {
        const authWs = ws as AuthenticatedWebSocket;
        if (authWs.isAlive === false) {
          return ws.terminate();
        }
        authWs.isAlive = false;
        authWs.ping();
      });
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(interval);
    });

    logger.info('WebSocket Server initialized');
  }

  private handleEvent(ws: AuthenticatedWebSocket, event: WsEventMessage): void {
    switch (event.type) {
      case 'AUTH': {
        try {
          const payload = JwtService.verify(event.payload.token);
          this.registerClient(payload.userId, payload.role, ws);
          ws.send(JSON.stringify({ type: 'AUTH_SUCCESS', payload: { userId: payload.userId } }));
        } catch {
          ws.send(JSON.stringify({ type: 'AUTH_ERROR', payload: { message: 'Invalid authentication token' } }));
        }
        break;
      }

      case 'TYPING': {
        if (!ws.userId) return;
        const { recipientId, isTyping, conversationId } = event.payload;
        this.sendToUser(recipientId, {
          type: 'TYPING',
          payload: { senderId: ws.userId, isTyping, conversationId }
        });
        break;
      }

      case 'READ_RECEIPT': {
        if (!ws.userId) return;
        const { recipientId, conversationId } = event.payload;
        this.sendToUser(recipientId, {
          type: 'READ_RECEIPT',
          payload: { readerId: ws.userId, conversationId }
        });
        break;
      }

      default:
        break;
    }
  }

  public registerClient(userId: string, role: string, ws: AuthenticatedWebSocket): void {
    ws.userId = userId;
    ws.userRole = role;

    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(ws);

    logger.debug(`User ${userId} (${role}) connected via WebSocket`);

    // Broadcast presence update
    this.broadcastPresence(userId, true);
  }

  public unregisterClient(userId: string, ws: AuthenticatedWebSocket): void {
    const userSockets = this.clients.get(userId);
    if (userSockets) {
      userSockets.delete(ws);
      if (userSockets.size === 0) {
        this.clients.delete(userId);
        this.broadcastPresence(userId, false);
      }
    }
    logger.debug(`User ${userId} disconnected from WebSocket`);
  }

  public isUserOnline(userId: string): boolean {
    const sockets = this.clients.get(userId);
    return !!sockets && sockets.size > 0;
  }

  public sendToUser(userId: string, message: WsEventMessage): boolean {
    const sockets = this.clients.get(userId);
    if (!sockets || sockets.size === 0) return false;

    const data = JSON.stringify(message);
    sockets.forEach((socket) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(data);
      }
    });
    return true;
  }

  public sendToUsers(userIds: string[], message: WsEventMessage): void {
    userIds.forEach((id) => this.sendToUser(id, message));
  }

  public broadcast(message: WsEventMessage): void {
    if (!this.wss) return;
    const data = JSON.stringify(message);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  private broadcastPresence(userId: string, isOnline: boolean): void {
    this.broadcast({
      type: 'PRESENCE',
      payload: { userId, isOnline, timestamp: new Date().toISOString() }
    });
  }
}
