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
      logger.info(`================================================`);
    });

    // Graceful shutdown handling
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      server.close(async () => {
        await db.close();
        logger.info('Guidely Server stopped.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (err) {
    logger.error('Failed to start Guidely server:', err);
    process.exit(1);
  }
}

bootstrap();
