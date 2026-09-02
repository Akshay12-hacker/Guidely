// Authentication Service

import { apiClient } from '../api/client';
import { AuthResponse, User, UserRole } from '../types';

export const authService = {
  async register(
    email: string,
    passwordHash: string,
    fullName: string,
    role: UserRole
  ): Promise<AuthResponse> {
    const res = await apiClient.post<any>('/auth/register', {
      email,
      password: passwordHash,
      fullName,
      role
    }, { skipAuth: true });

    const authData: AuthResponse = (res && 'token' in res && 'user' in res)
      ? res
      : (res?.data || res);

    if (authData?.token) {
      apiClient.setToken(authData.token);
    }
    return authData;
  },

  async login(email: string, passwordHash: string): Promise<AuthResponse> {
    const res = await apiClient.post<any>('/auth/login', {
      email,
      password: passwordHash
    }, { skipAuth: true });

    const authData: AuthResponse = (res && 'token' in res && 'user' in res)
      ? res
      : (res?.data || res);

    if (authData?.token) {
      apiClient.setToken(authData.token);
    }
    return authData;
  },

  async googleLogin(email: string, fullName: string, role: UserRole = 'STUDENT'): Promise<AuthResponse> {
    const res = await apiClient.post<any>('/auth/google', {
      email,
      fullName,
      role
    }, { skipAuth: true });

    const authData: AuthResponse = (res && 'token' in res && 'user' in res)
      ? res
      : (res?.data || res);

    if (authData?.token) {
      apiClient.setToken(authData.token);
    }
    return authData;
  },

  async getCurrentUser(): Promise<{ user: User; profile?: any }> {
    const data = await apiClient.get<any>('/auth/me');
    let user: User | null = null;
    let profile: any = null;

    if (data && 'user' in data) {
      user = data.user;
      profile = data.profile || null;
    } else if (data && data.id) {
      user = data;
    } else if (data && data.data && data.data.id) {
      user = data.data;
    }

    return { user: user!, profile };
  },

  async forgotPassword(email: string): Promise<{ message: string; demoResetToken: string }> {
    return apiClient.post<{ message: string; demoResetToken: string }>('/auth/forgot-password', { email }, { skipAuth: true });
  },

  async resetPassword(token: string, newPasswordHash: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword: newPasswordHash
    }, { skipAuth: true });
  },

  async selectRole(role: UserRole): Promise<User> {
    return apiClient.post<User>('/auth/select-role', { role });
  },

  logout() {
    apiClient.setToken(null);
  }
};
