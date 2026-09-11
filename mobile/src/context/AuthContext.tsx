// Authentication Context & State Manager for Mobile

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { studentService } from '../services/student.service';
import { mentorService } from '../services/mentor.service';
import { apiClient } from '../api/client';
import { apiConfig } from '../api/config';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { User, UserRole, StudentProfile, MentorProfile } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | MentorProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, passwordHash: string) => Promise<void>;
  register: (email: string, passwordHash: string, fullName: string, role: UserRole) => Promise<void>;
  googleLogin: (email: string, fullName: string, role?: UserRole) => Promise<void>;
  quickLoginAs: (email: string) => Promise<void>;
  selectRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | MentorProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const loadSession = useCallback(async () => {
    try {
      await apiConfig.init();
      await apiClient.initToken();
      const token = apiClient.getToken();

      if (token) {
        const { user: userData, profile: profileData } = await authService.getCurrentUser();
        if (userData && userData.id) {
          setUser(userData);
          setProfile(profileData || null);
          await storage.setItem(STORAGE_KEYS.USER_DATA, userData);
        } else {
          apiClient.setToken(null);
          setUser(null);
          setProfile(null);
          await storage.removeItem(STORAGE_KEYS.USER_DATA);
        }
      }
    } catch (e) {
      console.warn('Session restore failed:', e);
      apiClient.setToken(null);
      setUser(null);
      setProfile(null);
      await storage.removeItem(STORAGE_KEYS.USER_DATA);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();

    // Register 401 session expiration handler
    const unsubscribeAuthExpired = apiClient.onAuthExpired(() => {
      setUser(null);
      setProfile(null);
      storage.removeItem(STORAGE_KEYS.USER_DATA);
      showToast('warning', 'Session Expired', 'Your session has ended. Please sign in again.');
    });

    return () => {
      unsubscribeAuthExpired();
    };
  }, [loadSession, showToast]);

  const refreshUser = async () => {
    try {
      const { user: userData, profile: profileData } = await authService.getCurrentUser();
      if (userData && userData.id) {
        setUser(userData);
        setProfile(profileData || null);
        await storage.setItem(STORAGE_KEYS.USER_DATA, userData);
      }
    } catch {
      // ignore
    }
  };

  const login = async (email: string, passwordHash: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, passwordHash);
      if (res && res.user) {
        setUser(res.user);
        setProfile(res.profile || null);
        await storage.setItem(STORAGE_KEYS.USER_DATA, res.user);
        showToast('success', `Welcome back, ${res.user?.fullName || res.user?.email || 'User'}!`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      showToast('error', 'Login Failed', err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, passwordHash: string, fullName: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await authService.register(email, passwordHash, fullName, role);
      if (res && res.user) {
        setUser(res.user);
        setProfile(res.profile || null);
        await storage.setItem(STORAGE_KEYS.USER_DATA, res.user);
        showToast('success', 'Account Created! 🎉', 'Please complete your onboarding profile.');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      showToast('error', 'Registration Failed', err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (email: string, fullName: string, role: UserRole = 'STUDENT') => {
    setIsLoading(true);
    try {
      const res = await authService.googleLogin(email, fullName, role);
      if (res && res.user) {
        setUser(res.user);
        setProfile(res.profile || null);
        await storage.setItem(STORAGE_KEYS.USER_DATA, res.user);
        showToast('success', `Signed in as ${res.user?.fullName || res.user?.email || 'User'}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      showToast('error', 'Google Sign-In Failed', err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const quickLoginAs = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, 'password123');
      if (res && res.user) {
        setUser(res.user);
        setProfile(res.profile || null);
        await storage.setItem(STORAGE_KEYS.USER_DATA, res.user);
        showToast('success', 'Switched Identity ⚡', `Now viewing as ${res.user?.fullName || res.user?.email || 'User'} (${res.user?.role || 'Guest'})`);
      }
    } catch (err: any) {
      showToast('error', 'Quick Switch Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectRole = async (role: UserRole) => {
    try {
      const updatedUser = await authService.selectRole(role);
      setUser(updatedUser);
      await storage.setItem(STORAGE_KEYS.USER_DATA, updatedUser);
    } catch (err: any) {
      showToast('error', 'Role Selection Failed', err.message);
    }
  };

  const logout = () => {
    authService.logout();
    storage.removeItem(STORAGE_KEYS.USER_DATA).catch(() => {});
    setUser(null);
    setProfile(null);
    showToast('info', 'Signed Out', 'You have been logged out of your session.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        googleLogin,
        quickLoginAs,
        selectRole,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
