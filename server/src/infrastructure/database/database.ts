import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { env } from '../../config/env.js';
import { logger } from '../../shared/utils/logger.js';

// Ensure .env is loaded in all contexts
dotenv.config();

export class Database {
  private static instance: Database;
  private isConnected = false;
  private memoryServer?: any;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected && mongoose.connection.readyState === 1) {
      return;
    }

    const localUri = 'mongodb://127.0.0.1:27017/guidely';
    const envUri = (process.env.MONGODB_URI || env.MONGODB_URI)?.trim();
    let targetUri = envUri || localUri;

    // Check if placeholder password was left unconfigured
    if (targetUri.includes('<db_password>') || targetUri.includes('<password>')) {
      logger.warn('⚠️ MONGODB_URI contains unconfigured <db_password> placeholder. Falling back to local MongoDB...');
      targetUri = localUri;
    }

    const dbName = process.env.MONGODB_DB_NAME || env.MONGODB_DB_NAME || 'guidely';
    const timeoutMs = parseInt(process.env.MONGODB_TIMEOUT_MS || '', 10) || env.MONGODB_TIMEOUT_MS || 5000;

    // In TEST mode without explicit TEST_MONGODB_URI, use isolated MongoMemoryServer to protect real data
    if (process.env.NODE_ENV === 'test' && !process.env.TEST_MONGODB_URI) {
      try {
        logger.info('🧪 Running in TEST mode: Launching isolated MongoDB Memory Server...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        this.memoryServer = await MongoMemoryServer.create();
        const memUri = this.memoryServer.getUri();
        await mongoose.connect(memUri, { autoIndex: true, dbName });
        this.isConnected = true;
        logger.info(`🍃 Connected to isolated test MongoDB at: ${memUri} (Database: ${dbName})`);
        return;
      } catch (memErr: any) {
        logger.error('Failed to start test MongoDB Memory Server:', memErr.message);
      }
    }

    try {
      mongoose.set('strictQuery', true);
      await mongoose.connect(targetUri, {
        autoIndex: true,
        serverSelectionTimeoutMS: timeoutMs,
        dbName
      });

      this.isConnected = true;
      logger.info(`🍃 Connected to MongoDB successfully at: ${targetUri.replace(/\/\/.*@/, '//***:***@')} (Database: ${dbName})`);

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        this.isConnected = false;
        logger.warn('MongoDB disconnected. Attempting reconnection...');
      });

    } catch (err: any) {
      logger.warn(`⚠️ Primary MongoDB connection failed (${err.message}). Trying local fallback...`);

      if (targetUri !== localUri) {
        try {
          await mongoose.connect(localUri, {
            autoIndex: true,
            serverSelectionTimeoutMS: 2000,
            dbName
          });
          this.isConnected = true;
          logger.info(`🍃 Successfully connected to local MongoDB fallback at: ${localUri} (Database: ${dbName})`);
          return;
        } catch (localErr: any) {
          logger.warn(`Local fallback connection to ${localUri} not available.`);
        }
      }

      // If in non-production or memory DB allowed, use MongoMemoryServer
      if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_MEMORY_DB === 'true') {
        try {
          logger.info('🚀 Launching embedded MongoDB Memory Server for local development/testing...');
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          this.memoryServer = await MongoMemoryServer.create();
          const memUri = this.memoryServer.getUri();
          await mongoose.connect(memUri, { autoIndex: true, dbName });
          this.isConnected = true;
          logger.info(`🍃 Connected to embedded in-memory MongoDB at: ${memUri} (Database: ${dbName})`);
          return;
        } catch (memErr: any) {
          logger.error('Failed to start MongoDB Memory Server:', memErr.message);
        }
      }

      logger.warn('⚠️ Server will proceed in resilient mode. Database operations will retry upon reconnection.');
    }
  }

  public async initializeSchema(): Promise<void> {
    await this.connect();
    if (this.isConnected) {
      logger.info('MongoDB models and indexes initialized.');
    }
  }

  public async close(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('MongoDB connection closed.');
    }
    if (this.memoryServer) {
      await this.memoryServer.stop();
      this.memoryServer = undefined;
    }
  }
}
