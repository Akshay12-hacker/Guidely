import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { env } from '../../config/env.js';
import { logger } from '../../shared/utils/logger.js';

// Ensure .env is loaded in all contexts
dotenv.config();

// Helper to sanitize MongoDB connection string and prevent credential leakage in logs
function sanitizeMongoUri(uri: string): string {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
}

export class Database {
  private static instance: Database;
  private isConnected = false;
  private memoryServer?: any;
  private listenersAttached = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private attachConnectionListeners(): void {
    if (this.listenersAttached) return;
    this.listenersAttached = true;

    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      logger.database('CONNECTED', {
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      });
    });

    mongoose.connection.on('error', (err: any) => {
      logger.database('CONNECTION_ERROR', {
        error: err.message,
        name: err.name,
        code: err.code
      });
    });

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      logger.database('DISCONNECTED', {
        message: 'MongoDB disconnected. Drivers will attempt automatic reconnection.'
      });
    });

    mongoose.connection.on('reconnected', () => {
      this.isConnected = true;
      logger.database('RECONNECTED', {
        host: mongoose.connection.host,
        name: mongoose.connection.name
      });
    });
  }

  public async connect(): Promise<void> {
    if (this.isConnected && mongoose.connection.readyState === 1) {
      return;
    }

    this.attachConnectionListeners();

    const localUri = 'mongodb://127.0.0.1:27017/guidely';
    const envUri = (process.env.MONGODB_URI || env.MONGODB_URI)?.trim();
    let targetUri = envUri || localUri;

    // Check if placeholder password was left unconfigured
    if (targetUri.includes('<db_password>') || targetUri.includes('<password>')) {
      logger.database('CONFIG_WARNING', {
        message: 'MONGODB_URI contains unconfigured <db_password> placeholder. Falling back to local MongoDB.'
      });
      targetUri = localUri;
    }

    const dbName = process.env.MONGODB_DB_NAME || env.MONGODB_DB_NAME || 'guidely';
    const timeoutMs = parseInt(process.env.MONGODB_TIMEOUT_MS || '', 10) || env.MONGODB_TIMEOUT_MS || 5000;

    // In TEST mode without explicit TEST_MONGODB_URI, use isolated MongoMemoryServer to protect real data
    if (process.env.NODE_ENV === 'test' && !process.env.TEST_MONGODB_URI) {
      try {
        logger.database('TEST_INSTANCE_STARTING', { message: 'Launching isolated MongoDB Memory Server' });
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        this.memoryServer = await MongoMemoryServer.create();
        const memUri = this.memoryServer.getUri();
        await mongoose.connect(memUri, { autoIndex: true, dbName });
        this.isConnected = true;
        logger.database('CONNECTED', { dbName, uri: sanitizeMongoUri(memUri) });
        return;
      } catch (memErr: any) {
        logger.database('TEST_INSTANCE_FAILED', { error: memErr.message });
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
      logger.database('CONNECTED', {
        dbName,
        uri: sanitizeMongoUri(targetUri)
      });

    } catch (err: any) {
      logger.database('CONNECTION_FAILED', {
        uri: sanitizeMongoUri(targetUri),
        error: err.message
      });

      if (targetUri !== localUri) {
        try {
          await mongoose.connect(localUri, {
            autoIndex: true,
            serverSelectionTimeoutMS: 2000,
            dbName
          });
          this.isConnected = true;
          logger.database('FALLBACK_CONNECTED', {
            uri: localUri,
            dbName
          });
          return;
        } catch (localErr: any) {
          logger.database('FALLBACK_UNAVAILABLE', {
            uri: localUri,
            error: localErr.message
          });
        }
      }

      // If in non-production or memory DB allowed, use MongoMemoryServer
      if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_MEMORY_DB === 'true') {
        try {
          logger.database('MEMORY_DB_STARTING', { message: 'Launching embedded MongoDB Memory Server for local development' });
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          this.memoryServer = await MongoMemoryServer.create();
          const memUri = this.memoryServer.getUri();
          await mongoose.connect(memUri, { autoIndex: true, dbName });
          this.isConnected = true;
          logger.database('MEMORY_DB_CONNECTED', {
            uri: sanitizeMongoUri(memUri),
            dbName
          });
          return;
        } catch (memErr: any) {
          logger.database('MEMORY_DB_FAILED', { error: memErr.message });
        }
      }

      logger.database('RESILIENT_MODE', {
        message: 'Server will proceed in resilient mode. Database operations will retry upon reconnection.'
      });
    }
  }

  public async initializeSchema(): Promise<void> {
    await this.connect();
    if (this.isConnected) {
      logger.database('SCHEMA_INITIALIZED', { message: 'MongoDB models and indexes initialized.' });
    }
  }

  public async close(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.database('CLOSED', { message: 'MongoDB connection cleanly closed.' });
    }
    if (this.memoryServer) {
      await this.memoryServer.stop();
      this.memoryServer = undefined;
    }
  }
}
