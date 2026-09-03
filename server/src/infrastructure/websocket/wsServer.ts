import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { env } from '../../config/env.js';
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
    | 'AUTH_SUCCESS'
    | 'AUTH_ERROR'
    | 'CHAT_MESSAGE'
    | 'TYPING'
    | 'READ_RECEIPT'
    | 'NOTIFICATION'
    | 'PRESENCE'
    | 'PROJECT_UPDATE'
    | 'SESSION_UPDATE'
    | 'CALL_INITIATE'
    | 'CALL_INCOMING'
    | 'CALL_ANSWER'
    | 'CALL_REJECT'
    | 'ICE_CANDIDATE'
    | 'CALL_END';
  payload: any;
  // Mobile client compatibility fields
  event?: string;
  data?: any;
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

  private heartbeatTimer: NodeJS.Timeout | null = null;

  public initialize(server: any): void {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: AuthenticatedWebSocket, req: IncomingMessage) => {
      ws.isAlive = true;
      const clientIp = req.socket.remoteAddress || 'unknown';

      logger.ws('CONNECTION_OPEN', {
        ip: clientIp,
        totalClients: this.wss ? this.wss.clients.size : 1
      });

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
          logger.ws('CLIENT_AUTHENTICATED', {
            userId: payload.userId,
            role: payload.role,
            ip: clientIp
          });
        } catch {
          logger.ws('AUTH_FAILED', {
            ip: clientIp,
            reason: 'Invalid handshake token query parameter'
          });
        }
      }

      ws.on('message', (data: string) => {
        try {
          const parsed = JSON.parse(data.toString());
          const event: WsEventMessage = {
            type: parsed.type || parsed.event,
            payload: parsed.payload !== undefined ? parsed.payload : parsed.data
          };
          this.handleEvent(ws, event);
        } catch (err: any) {
          logger.ws('MESSAGE_PARSE_ERROR', {
            userId: ws.userId,
            ip: clientIp,
            error: err.message
          });
        }
      });

      ws.on('close', (code, reason) => {
        if (ws.userId) {
          this.unregisterClient(ws.userId, ws);
        }
        logger.ws('CONNECTION_CLOSED', {
          userId: ws.userId,
          ip: clientIp,
          code,
          reason: reason?.toString() || 'Normal closure'
        });
      });

      ws.on('error', (err: any) => {
        logger.ws('CLIENT_ERROR', {
          userId: ws.userId,
          ip: clientIp,
          error: err.message
        });
      });
    });

    // Heartbeat to prune dead connections
    const heartbeatInterval = parseInt(process.env.WS_HEARTBEAT_INTERVAL_MS || '', 10) || env.WS_HEARTBEAT_INTERVAL_MS;
    this.heartbeatTimer = setInterval(() => {
      if (!this.wss) return;
      this.wss.clients.forEach((ws: WebSocket) => {
        const authWs = ws as AuthenticatedWebSocket;
        if (authWs.isAlive === false) {
          logger.ws('CONNECTION_TIMED_OUT', { userId: authWs.userId });
          return ws.terminate();
        }
        authWs.isAlive = false;
        authWs.ping();
      });
    }, heartbeatInterval);

    this.wss.on('close', () => {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }
    });

    logger.info('🔌 Real-Time WebSocket Server initialized');
  }

  private handleEvent(ws: AuthenticatedWebSocket, event: WsEventMessage): void {
    switch (event.type) {
      case 'AUTH': {
        try {
          const payload = JwtService.verify(event.payload.token);
          this.registerClient(payload.userId, payload.role, ws);
          ws.send(JSON.stringify({
            type: 'AUTH_SUCCESS',
            payload: { userId: payload.userId },
            event: 'AUTH_SUCCESS',
            data: { userId: payload.userId }
          }));
        } catch {
          ws.send(JSON.stringify({
            type: 'AUTH_ERROR',
            payload: { message: 'Invalid authentication token' },
            event: 'AUTH_ERROR',
            data: { message: 'Invalid authentication token' }
          }));
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

      // WebRTC Real-Time Call Signaling
      case 'CALL_INITIATE': {
        if (!ws.userId) return;
        const { recipientId, isVideo, callRoomId, sdp } = event.payload || {};
        if (!recipientId) return;
        this.sendToUser(recipientId, {
          type: 'CALL_INCOMING',
          payload: {
            callerId: ws.userId,
            callerRole: ws.userRole,
            callRoomId: callRoomId || `call_${Date.now()}`,
            isVideo: isVideo !== false,
            sdp,
            timestamp: new Date().toISOString()
          }
        });
        break;
      }

      case 'CALL_ANSWER': {
        if (!ws.userId) return;
        const { callerId, accepted, callRoomId, sdp } = event.payload || {};
        if (!callerId) return;
        this.sendToUser(callerId, {
          type: 'CALL_ANSWER',
          payload: {
            calleeId: ws.userId,
            accepted,
            callRoomId,
            sdp
          }
        });
        break;
      }

      case 'CALL_REJECT': {
        if (!ws.userId) return;
        const { callerId, reason } = event.payload || {};
        if (!callerId) return;
        this.sendToUser(callerId, {
          type: 'CALL_REJECT',
          payload: {
            calleeId: ws.userId,
            reason: reason || 'Declined'
          }
        });
        break;
      }

      case 'ICE_CANDIDATE': {
        if (!ws.userId) return;
        const { targetUserId, candidate, callRoomId } = event.payload || {};
        if (!targetUserId) return;
        this.sendToUser(targetUserId, {
          type: 'ICE_CANDIDATE',
          payload: {
            senderId: ws.userId,
            candidate,
            callRoomId
          }
        });
        break;
      }

      case 'CALL_END': {
        if (!ws.userId) return;
        const { targetUserId, callRoomId } = event.payload || {};
        if (!targetUserId) return;
        this.sendToUser(targetUserId, {
          type: 'CALL_END',
          payload: {
            senderId: ws.userId,
            callRoomId
          }
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

    const formatted = JSON.stringify({
      type: message.type,
      payload: message.payload,
      event: message.type,
      data: message.payload
    });

    sockets.forEach((socket) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(formatted);
      }
    });
    return true;
  }

  public sendToUsers(userIds: string[], message: WsEventMessage): void {
    userIds.forEach((id) => this.sendToUser(id, message));
  }

  public broadcast(message: WsEventMessage): void {
    if (!this.wss) return;
    const formatted = JSON.stringify({
      type: message.type,
      payload: message.payload,
      event: message.type,
      data: message.payload
    });
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(formatted);
      }
    });
  }

  private broadcastPresence(userId: string, isOnline: boolean): void {
    const onlineUserIds = Array.from(this.clients.keys());
    this.broadcast({
      type: 'PRESENCE',
      payload: { 
        userId, 
        isOnline, 
        onlineUserIds, 
        timestamp: new Date().toISOString() 
      }
    });
  }

  public async close(): Promise<void> {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (!this.wss) return;

    let closedClients = 0;
    this.wss.clients.forEach((client) => {
      try {
        if (client.readyState === WebSocket.OPEN) {
          client.close(1001, 'Server shutting down');
          closedClients++;
        }
      } catch {
        // Ignore socket close errors during shutdown
      }
    });

    return new Promise<void>((resolve) => {
      this.wss?.close(() => {
        logger.ws('SERVER_SHUTDOWN', { closedClients });
        this.wss = null;
        this.clients.clear();
        resolve();
      });
    });
  }
}
