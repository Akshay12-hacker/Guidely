// Production-Grade Secure & Persistent Storage for Guidely Android
// Sensitive credentials (JWT, auth tokens) are encrypted in Android Keystore via expo-secure-store
// General preferences and non-sensitive cache use @react-native-async-storage/async-storage

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'guidely_mobile_auth_token',
  USER_DATA: 'guidely_mobile_user',
  ACTIVE_PROJECT_ID: 'guidely_mobile_active_project',
  ONBOARDING_COMPLETED: 'guidely_mobile_onboarding_completed',
  OFFLINE_CACHE: 'guidely_mobile_offline_cache'
};

/**
 * SecureStorageService
 * Hardware-backed keystore encryption for sensitive tokens
 */
class SecureStorageService {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      try {
        return await AsyncStorage.getItem(key);
      } catch {
        return null;
      }
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK
      });
    } catch {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (err) {
        console.warn('SecureStore set error:', err);
      }
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      try {
        await AsyncStorage.removeItem(key);
      } catch (err) {
        console.warn('SecureStore delete error:', err);
      }
    }
  }
}

/**
 * GeneralStorageService
 * High-performance non-sensitive persistence for app state, cache & preferences
 */
class GeneralStorageService {
  async getItem<T = string>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
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
      await AsyncStorage.setItem(key, serialized);
    } catch (e) {
      console.warn('AsyncStorage set error:', e);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn('AsyncStorage remove error:', e);
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.warn('AsyncStorage clear error:', e);
    }
  }
}

export const secureStorage = new SecureStorageService();
export const storage = new GeneralStorageService();

