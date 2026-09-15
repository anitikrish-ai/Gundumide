/**
 * Authentication Context Provider
 * Uses the real backend API via AuthService for all auth operations.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { AuthService } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
  showWelcome: boolean;
  dismissWelcome: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  // On mount: try to restore session from stored JWT via server validation
  useEffect(() => {
    AuthService.restoreSession()
      .then(profile => {
        if (profile) setUser(profile);
      })
      .catch(() => {
        // Token invalid or network error — stay logged out
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, pass: string) => {
    const profile = await AuthService.login(email, pass);
    setUser(profile);
    setShowWelcome(true);
  };

  const register = async (email: string, pass: string, name: string) => {
    const profile = await AuthService.register(email, pass, name);
    setUser(profile);
    setShowWelcome(true);
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setShowWelcome(false);
  };

  const dismissWelcome = () => {
    setShowWelcome(false);
  };

  const refreshUser = async () => {
    const profile = await AuthService.restoreSession();
    if (profile) setUser(profile);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      showWelcome,
      dismissWelcome,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
