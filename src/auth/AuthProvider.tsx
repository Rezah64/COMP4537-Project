import React, { useState } from 'react';
import { User, LoginData, RegisterData, AuthResponse } from '../types';
import { AuthContext } from './useAuth';
import { api } from './axios';
import { storage } from './storage';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_CALL_LIMIT = 20;

  const login = async (data: LoginData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      storage.setTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
      });
      setUser(response.data.user);
    } catch (err) {
      setError('Failed to login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      storage.setTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
      });
      setUser(response.data.user);
    } catch (err) {
      setError('Failed to register');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      storage.clearTokens();
      setUser(null);
    } catch (err) {
      setError('Failed to logout');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const incrementApiCalls = () => {
    if (!user) return false;
    if (user.apiCalls >= API_CALL_LIMIT) {
      setError('API call limit reached');
      return false;
    }
    
    setUser(prev => prev ? {
      ...prev,
      apiCalls: prev.apiCalls + 1
    } : null);
    
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        incrementApiCalls
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}