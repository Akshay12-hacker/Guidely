// Storage manager with in-memory fallback and persistent AsyncStorage support

interface StorageDriver {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

// In-Memory Storage Driver for fast, synchronous, zero-dependency reliability
class MemoryStorageDriver implements StorageDriver {
  private memory = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.memory.has(key) ? this.memory.get(key)! : null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.memory.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.memory.delete(key);
  }

  async clear(): Promise<void> {
    this.memory.clear();
  }
}

class StorageService {
  private driver: StorageDriver = new MemoryStorageDriver();

  public setDriver(driver: StorageDriver) {
    this.driver = driver;
  }

  async getItem<T = string>(key: string): Promise<T | null> {
    try {
      const raw = await this.driver.getItem(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as unknown as T;
      }
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: any): Promise<void> {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      await this.driver.setItem(key, serialized);
    } catch (e) {
      console.warn('Storage set error:', e);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await this.driver.removeItem(key);
    } catch (e) {
      console.warn('Storage remove error:', e);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.driver.clear();
    } catch (e) {
      console.warn('Storage clear error:', e);
    }
  }
}

export const storage = new StorageService();

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'guidely_mobile_auth_token',
  USER_DATA: 'guidely_mobile_user',
  SERVER_IP: 'guidely_mobile_server_ip',
  WS_URL: 'guidely_mobile_ws_url',
  ACTIVE_PROJECT_ID: 'guidely_mobile_active_project'
};
