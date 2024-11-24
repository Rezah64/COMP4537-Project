import React, { useEffect, useState } from 'react';
import { User, LoginData, RegisterData, AuthResponse } from '../types';
import { AuthContext } from './useAuth';
import { api } from './axios';
import { storage } from './storage';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_CALL_LIMIT = 20;

  console.log('AuthProvider render:', { user, isLoading, error });

  const checkAuth = async () => {
    console.log('Checking auth...');
    try {
      const tokens = storage.getTokens();
      console.log('Stored tokens:', tokens);

      if (!tokens?.accessToken) {
        console.log('No tokens found');
        setIsLoading(false);
        return;
      }

      const response = await api.get<User>('/auth/me');
      console.log('/me response:', response.data);
      
      const userData: User = {
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        isAdmin: response.data.isAdmin,
        apiCalls: response.data.apiCalls,
        createdAt: response.data.createdAt,
        lastActive: response.data.lastActive
        }

      setUser(userData);
      
    } catch (error) {
      console.error('Auth check failed:', error);
      storage.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

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

  setUser(prev => {
    if (!prev) return null;
    const currentApiCalls = typeof prev.apiCalls === 'number' ? prev.apiCalls : 0;

    if (currentApiCalls >= API_CALL_LIMIT) {
      setError('API call limit reached');
      console.log('API call limit reached');
      return prev;
    }

    const updatedUser = {
      ...prev,
      apiCalls: currentApiCalls + 1,
    };

    console.log('Updated user after increment:', updatedUser);
    return updatedUser;
  });

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