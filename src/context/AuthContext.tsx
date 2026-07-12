'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import api from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for saved token and user on mount
  useEffect(() => {
    const initAuth = async () => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('dexon_admin_token');
        const storedUser = localStorage.getItem('dexon_admin_user');
        
        if (storedToken && storedUser) {
          try {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            
            // Verify session with the backend
            const response = await api.get('/auth/me');
            if (response.data.success) {
              setUser(response.data.user);
              localStorage.setItem('dexon_admin_user', JSON.stringify(response.data.user));
            } else {
              // Token was invalid
              handleLogoutCleanup();
            }
          } catch (error) {
            console.error('Session validation failed:', error);
            // On network failure we keep the session active locally so they can retry,
            // unless the error was an explicit auth error (handled by axios interceptor anyway).
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (jwtToken: string, userData: User) => {
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('dexon_admin_token', jwtToken);
    localStorage.setItem('dexon_admin_user', JSON.stringify(userData));
  };

  const handleLogoutCleanup = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('dexon_admin_token');
    localStorage.removeItem('dexon_admin_user');
  };

  const logout = async () => {
    handleLogoutCleanup();
    // Redirect admin to the login page after logging out
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
