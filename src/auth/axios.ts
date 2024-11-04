import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthTokens } from '../types';
import { storage } from './storage';

const API_URL = import.meta.env.VITE_API_GATEWAY_URL;

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const attachToken = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const tokens = storage.getTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
};

api.interceptors.request.use(attachToken);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    
    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const tokens = storage.getTokens();

    try {
      if (!tokens?.refreshToken) throw new Error('No refresh token available');
      
      const response = await api.post<AuthTokens>('/auth/refresh', {
        refreshToken: tokens.refreshToken
      });
      
      storage.setTokens(response.data);
      originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
      
      return api(originalRequest);
    } catch (refreshError) {
      storage.clearTokens();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);