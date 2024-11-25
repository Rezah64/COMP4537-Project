export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    apiCalls: number;
    createdAt: string;
    lastActive: string;
  }
  
  export interface LoginData {
    email: string;
    password: string;
  }
  
  export interface RegisterData extends LoginData {
    name: string;
  }
  
  export interface AuthResponse {
    user: User;
  }
  
  export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    incrementApiCalls: () => boolean;
  }
  