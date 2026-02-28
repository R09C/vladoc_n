/**
 * Auth Context - глобальное состояние аутентификации
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import type { User } from "@/entities/user/model/types";
import type { AuthResponse } from "@/shared/api/auth";
import {
  loginMock,
  logoutMock,
  getMeProfileMock,
  refreshTokenMock,
} from "@/shared/api/mocks/auth.mock";
import { STORAGE_KEYS } from "@/shared/config/constants";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingSession: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check session on app load
  const checkSession = useCallback(async () => {
    setIsCheckingSession(true);
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (!token) {
      setIsCheckingSession(false);
      return;
    }

    try {
      const userData = await getMeProfileMock();
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    } catch {
      // Если ошибка, пытаемся обновить токен
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        try {
          const response = await refreshTokenMock(refreshToken);
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
          if (response.refreshToken) {
            localStorage.setItem(
              STORAGE_KEYS.REFRESH_TOKEN,
              response.refreshToken,
            );
          }
          setUser(response.user);
          setIsAuthenticated(true);
        } catch {
          // Если refresh не сработал - выходим
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsCheckingSession(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: AuthResponse = await loginMock({ email, password });

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

      setUser(response.user);
      setIsAuthenticated(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Login failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await logoutMock();

      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    const token = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!token) {
      throw new Error("No refresh token");
    }

    try {
      const response: AuthResponse = await refreshTokenMock(token);

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      }

      setUser(response.user);
      setIsAuthenticated(true);
    } catch (err) {
      // Если refresh не сработал - выходим
      await logout();
      throw err;
    }
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isCheckingSession,
        error,
        login,
        logout,
        checkSession,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
