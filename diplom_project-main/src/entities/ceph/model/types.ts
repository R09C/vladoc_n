/**
 * CEPH — модели данных по PRD
 * Ресурс CEPH, Папка CEPH, Пользователь CEPH, Доступ к папке
 */

import type { BaseEntity } from "@/shared/lib/types/base";
import type { CephAccessType } from "@/shared/config/enums";

/** Ресурс CEPH */
export interface CephResource extends BaseEntity {
  /** Наименование (формат: ceph + NN) */
  name: string;
  /** FK → ObjectGroup (CEPH) */
  group_id: string;
  /** FK → VirtualMachine */
  vm_id: string;
}

/** Папка CEPH */
export interface CephFolder extends BaseEntity {
  /** Уникальное наименование */
  name: string;
  /** Активна */
  is_active: boolean;
  /** FK → ObjectGroup (CEPH) */
  group_id: string;
}

/** Пользователь CEPH */
export interface CephUser extends BaseEntity {
  /** FK → ObjectGroup (CEPH) */
  group_id: string;
  /** Уникальное наименование */
  name: string;
  /** Активен */
  is_active: boolean;
  /** FK → Project (nullable) */
  project_id: string | null;
  /** Ключ доступа */
  key: string;
}

/** Доступ пользователя к папке CEPH */
export interface CephFolderAccess extends BaseEntity {
  /** FK → CephUser */
  user_id: string;
  /** FK → CephFolder */
  folder_id: string;
  /** Тип доступа: R | W | RW */
  access_type: CephAccessType;
}

// ─── Request / Filter types ────────────────────────────────────────────────

export interface CreateCephResourceRequest {
  name?: string;
  group_id: string;
  vm_id: string;
}

export interface UpdateCephResourceRequest {
  name?: string;
  group_id?: string;
  vm_id?: string;
}

export interface CreateCephFolderRequest {
  name: string;
  is_active?: boolean;
  group_id: string;
}

export interface UpdateCephFolderRequest {
  name?: string;
  is_active?: boolean;
  group_id?: string;
}

export interface CreateCephUserRequest {
  group_id: string;
  name: string;
  is_active?: boolean;
  project_id?: string | null;
  key?: string;
}

export interface UpdateCephUserRequest {
  name?: string;
  is_active?: boolean;
  project_id?: string | null;
  key?: string;
}

export interface CreateCephFolderAccessRequest {
  user_id: string;
  folder_id: string;
  access_type: CephAccessType;
}

export interface UpdateCephFolderAccessRequest {
  access_type?: CephAccessType;
}

export interface CephResourceFilters {
  group_id?: string;
  vm_id?: string;
}

export interface CephFolderFilters {
  group_id?: string;
  is_active?: boolean;
}

export interface CephUserFilters {
  group_id?: string;
  is_active?: boolean;
  project_id?: string;
}

export interface CephFolderAccessFilters {
  user_id?: string;
  folder_id?: string;
  access_type?: CephAccessType;
}
