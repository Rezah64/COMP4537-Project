import { AuthTokens } from "../types";

export const storage = {
    getTokens: (): AuthTokens | null => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!accessToken || !refreshToken) return null;
      return { accessToken, refreshToken };
    },
    
    setTokens: (tokens: AuthTokens): void => {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    },
    
    clearTokens: (): void => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };