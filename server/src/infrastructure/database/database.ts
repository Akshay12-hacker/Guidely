import mongoose from 'mongoose';
import { logger } from '../../shared/utils/logger.js';

export class Database {
  private static instance: Database;
  private isConnected = false;

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
    let targetUri = process.env.MONGODB_URI || localUri;

    // Check if placeholder password was left unconfigured
    if (targetUri.includes('<db_password>') || targetUri.includes('<password>')) {
      logger.warn('⚠️ MONGODB_URI contains unconfigured <db_password> placeholder. Falling back to local MongoDB...');
      targetUri = localUri;
    }

    try {
      mongoose.set('strictQuery', true);
      await mongoose.connect(targetUri, {
        autoIndex: true,
        serverSelectionTimeoutMS: 4000
      });

      this.isConnected = true;
      logger.info(`🍃 Connected to MongoDB successfully at: ${targetUri.replace(/\/\/.*@/, '//***:***@')}`);

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        this.isConnected = false;
        logger.warn('MongoDB disconnected. Attempting reconnection...');
      });

    } catch (err: any) {
      logger.error(`❌ Primary MongoDB connection failed (${err.message}). Trying local fallback...`);

      if (targetUri !== localUri) {
        try {
          await mongoose.connect(localUri, {
            autoIndex: true,
            serverSelectionTimeoutMS: 3000
          });
          this.isConnected = true;
          logger.info(`🍃 Successfully connected to local MongoDB fallback at: ${localUri}`);
          return;
        } catch (localErr: any) {
          logger.error(`❌ Local fallback also failed (${localErr.message}).`);
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
  }
}
