/**
 * Role & Permission — модели данных RBAC по PRD
 */

import type { BaseEntity } from "@/shared/lib/types/base";
import type { Zone, ZoneAccessType } from "@/shared/config/enums";

/** Роль пользователя */
export interface Role extends BaseEntity {
  /** Уникальное наименование */
  name: string;
  /** M2M → User — пользователи с данной ролью */
  user_ids: string[];
  /** Наблюдатель (полный просмотр, без редактирования) */
  full_view: boolean;
}

/** Право доступа роли */
export interface Permission extends BaseEntity {
  /** FK → Role */
  role_id: string;
  /** Зона доступа */
  zone: Zone;
  /** Уровень доступа: R | RU | CRU | CRUD | GCRUD */
  access_type: ZoneAccessType;
  /** FK → ObjectGroup (nullable, тип соответствует зоне) */
  group_id: string | null;
}

// ─── Request / Filter types ────────────────────────────────────────────────

export interface CreateRoleRequest {
  name: string;
  user_ids?: string[];
  full_view?: boolean;
}

export interface UpdateRoleRequest {
  name?: string;
  user_ids?: string[];
  full_view?: boolean;
}

export interface CreatePermissionRequest {
  role_id: string;
  zone: Zone;
  access_type: ZoneAccessType;
  group_id?: string | null;
}

export interface UpdatePermissionRequest {
  zone?: Zone;
  access_type?: ZoneAccessType;
  group_id?: string | null;
}

export interface RoleFilters {
  full_view?: boolean;
}

export interface PermissionFilters {
  role_id?: string;
  zone?: Zone;
}
