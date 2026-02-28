/**
 * Mock API функции для аутентификации
 */

import type { AuthResponse, LoginCredentials } from "@/shared/api/auth";
import type { User } from "@/entities/user/model/types";
import { DEMO_CREDENTIALS } from "@/shared/config/constants";

/**
 * Mock login функция
 */
export const loginMock = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  // Добавляем delay для имитации сетевой задержки
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Проверяем credentials (для демо)
  if (
    credentials.email === DEMO_CREDENTIALS.email &&
    credentials.password === DEMO_CREDENTIALS.password
  ) {
    const mockUser: User = {
      id: "user-01",
      email: credentials.email,
      name: "Иванов Алексей",
      is_admin: true,
      is_partial_admin: false,
      role_ids: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return {
      accessToken: "mock_token_" + Math.random().toString(36).substr(2, 9),
      refreshToken:
        "mock_refresh_token_" + Math.random().toString(36).substr(2, 9),
      user: mockUser,
    };
  }

  throw new Error("Invalid credentials");
};

/**
 * Mock logout функция
 */
export const logoutMock = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
};

import { STORAGE_KEYS } from "@/shared/config/constants";

/**
 * Mock getMeProfile функция
 */
export const getMeProfileMock = async (): Promise<User> => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    throw new Error("No authentication token");
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
  if (storedUser) {
    return JSON.parse(storedUser);
  }

  return {
    id: "user-01",
    email: DEMO_CREDENTIALS.email,
    name: "Иванов Алексей",
    is_admin: true,
    is_partial_admin: false,
    role_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

/**
 * Mock refreshToken функция
 */
export const refreshTokenMock = async (
  refreshToken: string,
): Promise<AuthResponse> => {
  if (!refreshToken) {
    throw new Error("No refresh token provided");
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  const mockUser: User = {
    id: "user-01",
    email: DEMO_CREDENTIALS.email,
    name: "Иванов Алексей",
    is_admin: true,
    is_partial_admin: false,
    role_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return {
    accessToken: "mock_token_" + Math.random().toString(36).substr(2, 9),
    refreshToken:
      "mock_refresh_token_" + Math.random().toString(36).substr(2, 9),
    user: mockUser,
  };
};
