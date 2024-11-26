import React, { useEffect, useState } from "react";
import { User, LoginData, RegisterData, AuthResponse } from "../types";
import { AuthContext } from "./useAuth";
import { api } from "./axios";
import { incrementCounterAPI } from "../utils/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_CALL_LIMIT = 20;

  console.log("AuthProvider render:", { user, isLoading, error });

  const checkAuth = async () => {
    console.log("Checking auth...");
    try {
      const response = await api.get<User>("/auth/me");
      console.log("/me response:", response.data);

      if (response) {
        incrementCounterAPI("/auth/me");
      }

      const userData: User = {
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        isAdmin: response.data.isAdmin,
        apiCalls: response.data.apiCalls,
        createdAt: response.data.createdAt,
        lastActive: response.data.lastActive,
      };

      setUser(userData);
    } catch (error) {
      console.error("Auth check failed:", error);
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
      const response = await api.post<AuthResponse>("/auth/login", data);
      setUser(response.data.user);
      if (response) {
        incrementCounterAPI("/auth/login");
      }
    } catch (err) {
      setError("Failed to login");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<AuthResponse>("/auth/register", data);
      setUser(response.data.user);
      if (response) {
        incrementCounterAPI("/auth/register");
      }
    } catch (err) {
      setError("Failed to register");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post("/auth/logout");
      setUser(null);
      incrementCounterAPI("/auth/logout");
    } catch (err) {
      setError("Failed to logout");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateName = async (name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch<User>("/auth/updateName", { name });
      setUser(response.data);
    } catch (err) {
      setError("Failed to update name");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    const body = { data: { userId } };
    try {
      const response = await api.delete<User>("/auth/delete", body);
      console.log("Delete response:", response);
      setUser(null);
    } catch (err) {
      console.log("Delete error:", err);
      setError("Failed to delete account");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const incrementApiCalls = () => {
    if (!user) return false;

    setUser((prev) => {
      if (!prev) return null;
      const currentApiCalls =
        typeof prev.apiCalls === "number" ? prev.apiCalls : 0;

      if (currentApiCalls >= API_CALL_LIMIT) {
        setError("API call limit reached");
        console.log("API call limit reached");
        return prev;
      }

      const updatedUser = {
        ...prev,
        apiCalls: currentApiCalls + 1,
      };

      console.log("Updated user after increment:", updatedUser);
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
        incrementApiCalls,
        updateName,
        deleteAccount,
        updateUser: setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
