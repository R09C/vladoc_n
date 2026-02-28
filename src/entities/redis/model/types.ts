/**
 * Redis — модели данных по PRD
 * Ресурс REDIS и БД REDIS
 */

import type { BaseEntity } from "@/shared/lib/types/base";

/** Ресурс REDIS */
export interface RedisResource extends BaseEntity {
  /** FK → ObjectGroup (RDC) */
  group_id: string;
  /** FK → VirtualMachine */
  vm_id: string;
  /** Наименование (формат: mrds + NN) */
  name: string;
}

/** БД REDIS */
export interface RedisDB extends BaseEntity {
  /** FK → ObjectGroup (RDC) */
  group_id: string;
  /** Порт (только цифры, уникальный) */
  port: string;
  /** Пароль (шифрование при хранении) */
  password: string;
  /** FK → Project (nullable) */
  project_id: string | null;
}

// ─── Request / Filter types ────────────────────────────────────────────────

export interface CreateRedisResourceRequest {
  group_id: string;
  vm_id: string;
  name?: string;
}

export interface UpdateRedisResourceRequest {
  group_id?: string;
  vm_id?: string;
  name?: string;
}

export interface CreateRedisDBRequest {
  group_id: string;
  port: string;
  password: string;
  project_id?: string | null;
}

export interface UpdateRedisDBRequest {
  group_id?: string;
  port?: string;
  password?: string;
  project_id?: string | null;
}

export interface RedisResourceFilters {
  group_id?: string;
  vm_id?: string;
}

export interface RedisDBFilters {
  group_id?: string;
  project_id?: string;
}
