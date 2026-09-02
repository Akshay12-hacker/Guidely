// Server and Network Configuration for Android

import { Platform } from 'react-native';
import { storage, STORAGE_KEYS } from '../utils/storage';

// Default development hosts
const DEFAULT_EMULATOR_HOST = '10.0.2.2'; // Standard Android Emulator host loopback
const DEFAULT_DEVICE_HOST = '192.168.1.100'; // Default local LAN placeholder
const DEFAULT_PORT = '5000';

class ApiConfig {
  private currentHost: string = Platform.OS === 'android' ? DEFAULT_EMULATOR_HOST : 'localhost';
  private currentPort: string = DEFAULT_PORT;
  private customBaseUrl: string | null = null;
  private customWsUrl: string | null = null;

  async init() {
    const savedHost = await storage.getItem<string>(STORAGE_KEYS.SERVER_IP);
    if (savedHost) {
      this.currentHost = savedHost;
    }
    const savedWs = await storage.getItem<string>(STORAGE_KEYS.WS_URL);
    if (savedWs) {
      this.customWsUrl = savedWs;
    }
  }

  async setServerHost(host: string, port: string = DEFAULT_PORT) {
    this.currentHost = host.trim();
    this.currentPort = port.trim();
    this.customBaseUrl = null;
    this.customWsUrl = null;
    await storage.setItem(STORAGE_KEYS.SERVER_IP, this.currentHost);
  }

  get host(): string {
    return this.currentHost;
  }

  get port(): string {
    return this.currentPort;
  }

  get httpBaseUrl(): string {
    if (this.customBaseUrl) return this.customBaseUrl;
    return `http://${this.currentHost}:${this.currentPort}/api`;
  }

  get wsBaseUrl(): string {
    if (this.customWsUrl) return this.customWsUrl;
    return `ws://${this.currentHost}:${this.currentPort}/ws`;
  }
}

export const apiConfig = new ApiConfig();
