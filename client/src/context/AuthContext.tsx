import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthResponse } from '../../../shared/types.js';
import { api } from '../services/api.js';
import { useToast } from './ToastContext.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, role: 'STUDENT' | 'MENTOR') => Promise<void>;
  googleLogin: (
    credentialOrData: string | { idToken?: string; credential?: string; role?: 'STUDENT' | 'MENTOR'; email?: string; fullName?: string },
    nameOrRole?: string | 'STUDENT' | 'MENTOR',
    role?: 'STUDENT' | 'MENTOR'
  ) => Promise<AuthResponse>;
  logout: () => void;
  updateCurrentUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('guidely_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const handleAuthSuccess = (res: AuthResponse) => {
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('guidely_token', res.token);
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('guidely_token');
      if (storedToken) {
        try {
          const currentUser = await api.getCurrentUser();
          setUser(currentUser);
          setToken(storedToken);
        } catch {
          localStorage.removeItem('guidely_token');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    handleAuthSuccess(res);
    showToast('success', `Welcome back, ${res.user.fullName}!`);
  };

  const register = async (email: string, pass: string, name: string, role: 'STUDENT' | 'MENTOR') => {
    const res = await api.register({ email, password: pass, fullName: name, role });
    handleAuthSuccess(res);
    showToast('success', 'Account created successfully!', 'Let us set up your profile next.');
  };

  const googleLogin = async (
    credentialOrData: string | { idToken?: string; credential?: string; role?: 'STUDENT' | 'MENTOR'; email?: string; fullName?: string },
    nameOrRole?: string | 'STUDENT' | 'MENTOR',
    role?: 'STUDENT' | 'MENTOR'
  ): Promise<AuthResponse> => {
    let payload: any;
    if (typeof credentialOrData === 'string') {
      if (credentialOrData.includes('.') && credentialOrData.split('.').length >= 3) {
        const assignedRole = nameOrRole === 'STUDENT' || nameOrRole === 'MENTOR' ? nameOrRole : role;
        payload = { credential: credentialOrData, role: assignedRole };
      } else {
        const fullName = typeof nameOrRole === 'string' && nameOrRole !== 'STUDENT' && nameOrRole !== 'MENTOR' ? nameOrRole : '';
        payload = { email: credentialOrData, fullName, role };
      }
    } else {
      payload = { ...credentialOrData };
      if (role && !payload.role) {
        payload.role = role;
      }
    }

    const res = await api.googleAuth(payload);
    handleAuthSuccess(res);
    showToast('success', `Signed in as ${res.user.fullName}`);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('guidely_token');
    setUser(null);
    setToken(null);
    showToast('info', 'Logged out', 'You have been safely signed out.');
  };

  const updateCurrentUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        googleLogin,
        logout,
        updateCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
