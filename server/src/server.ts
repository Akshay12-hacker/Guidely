import dotenv from 'dotenv';
import { env } from './config/env.js';
import http from 'http';
import { createApp } from './app.js';
import { Database } from './infrastructure/database/database.js';
import { seedDatabase } from './infrastructure/database/seed.js';
import { WebSocketManager } from './infrastructure/websocket/wsServer.js';
import { logger } from './shared/utils/logger.js';

// Ensure .env is loaded
dotenv.config();

const PORT = parseInt(process.env.PORT || '', 10) || env.PORT;

async function bootstrap() {
  try {
    // 1. Initialize Relational Database & Migrations
    const db = Database.getInstance();
    await db.initializeSchema();
    const shouldSeed = process.env.SEED_DEMO_DATA !== undefined
      ? process.env.SEED_DEMO_DATA === 'true'
      : env.SEED_DEMO_DATA;

    if (shouldSeed) {
      try {
        await seedDatabase();
      } catch (seedErr: any) {
        logger.warn('Seed step skipped or encountered issue:', seedErr.message);
      }
    }

    // 2. Create Express Application
    const app = createApp();
    const server = http.createServer(app);

    // 3. Attach WebSocket Server
    const wsManager = WebSocketManager.getInstance();
    wsManager.initialize(server);

    // 4. Start Server
    server.listen(PORT, () => {
      logger.info(`================================================`);
      logger.info(`🚀 Guidely Full-Stack Server running on port ${PORT}`);
      logger.info(`🔌 Real-Time WebSocket active on port ${PORT}`);
      logger.info(`🌱 Health endpoint: http://localhost:${PORT}/api/health`);
      logger.info(`🛡️ Environment: ${process.env.NODE_ENV || env.NODE_ENV} | Logging: ${env.LOG_FORMAT}`);
      logger.info(`================================================`);
    });

    // 5. Production Graceful Shutdown Handling
    let isShuttingDown = false;

    const gracefulShutdown = async (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      logger.info({ signal }, `🛑 Received ${signal}. Initiating graceful shutdown...`);

      // Emergency force-exit timeout safeguard for production (e.g. Render deployments)
      const forceExitTimer = setTimeout(() => {
        logger.error('⏰ Shutdown timeout (10s) reached. Forcing immediate termination.');
        process.exit(1);
      }, 10000);
      forceExitTimer.unref();

      try {
        // Step 1: Close HTTP server (stop accepting new HTTP traffic)
        await new Promise<void>((resolve) => {
          server.close((err) => {
            if (err) {
              logger.error('Error during HTTP server close:', err);
            } else {
              logger.info('🛑 HTTP server stopped accepting connections.');
            }
            resolve();
          });
        });

        // Step 2: Cleanly close WebSocket connections and heartbeat timers
        await wsManager.close();
        logger.info('🔌 All real-time WebSocket connections cleanly terminated.');

        // Step 3: Disconnect database safely
        await db.close();
        logger.info('🍃 Database connection cleanly disconnected.');

        logger.info('✅ Guidely server shutdown completed cleanly.');
        process.exit(0);
      } catch (shutdownErr) {
        logger.error('Error occurred during graceful shutdown sequence:', shutdownErr);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Process-level failure handling
    process.on('uncaughtException', (err) => {
      logger.fatal({ err }, `🚨 UNCAUGHT EXCEPTION: ${err.message}`);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason: any) => {
      logger.fatal({ err: reason instanceof Error ? reason : undefined, reason }, `🚨 UNHANDLED PROMISE REJECTION: ${reason}`);
      gracefulShutdown('unhandledRejection');
    });

  } catch (err) {
    logger.fatal('Failed to bootstrap Guidely server:', err);
    process.exit(1);
  }
}

bootstrap();
