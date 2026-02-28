/**
 * User — бизнес-сущность пользователя по PRD
 * Определяет структуру пользователя в приложении
 */

import type { BaseEntity } from "@/shared/lib/types/base";

/** Пользователь системы */
export interface User extends BaseEntity {
  /** Уникальный email */
  email: string;
  /** Имя пользователя */
  name: string;
  /** Администратор (полный доступ) */
  is_admin: boolean;
  /** Неполный администратор (без управления другими администраторами) */
  is_partial_admin: boolean;
  /** Список ID ролей, назначенных пользователю */
  role_ids: string[];
}

/** Запрос на создание пользователя */
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  is_admin?: boolean;
  is_partial_admin?: boolean;
  role_ids?: string[];
}

/** Запрос на обновление пользователя */
export interface UpdateUserRequest {
  email?: string;
  password?: string;
  name?: string;
  is_admin?: boolean;
  is_partial_admin?: boolean;
  role_ids?: string[];
}

/** Фильтры для списка пользователей */
export interface UserFilters {
  is_admin?: boolean;
  is_partial_admin?: boolean;
  role_id?: string;
}
