/**
 * API контракты для аутентификации
 * Содержит DTO (Data Transfer Objects) для взаимодействия с backend API
 */

import type { User } from "@/entities/user/model/types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}
