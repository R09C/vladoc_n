/**
 * Database entities — модели данных по PRD
 * Группа СУБД → Ресурс СУБД → База данных → Пользователь БД
 */

import type { BaseEntity } from "@/shared/lib/types/base";
import type { DBMSType, DBAccessType } from "@/shared/config/enums";

/** Группа СУБД */
export interface DBMSGroup extends BaseEntity {
  /** FK → ObjectGroup (DBC) — уникальный */
  group_id: string;
  /** Порт (только цифры) */
  port: string;
  /** Тип СУБД: MySQL | PostgreSQL | MariaDB | MSSQL */
  dbms_type: DBMSType;
  /** Версия СУБД */
  version: string;
}

/** Ресурс СУБД */
export interface DBMSResource extends BaseEntity {
  /** FK → DBMSGroup */
  dbms_group_id: string;
  /** Наименование (формат: mbds + NN) */
  name: string;
  /** FK → VirtualMachine */
  vm_id: string;
}

/** База данных */
export interface Database extends BaseEntity {
  /** Уникальное наименование */
  name: string;
  /** FK → ObjectGroup (DBC) */
  group_id: string;
  /** FK → Project (nullable) */
  project_id: string | null;
}

/** Пользователь БД */
export interface DatabaseUser extends BaseEntity {
  /** FK → Database */
  database_id: string;
  /** Уникальное имя пользователя */
  username: string;
  /** Пароль (шифрование при хранении) */
  password: string;
  /** Тип доступа: S | SU | SI | SIU | FC */
  access_type: DBAccessType;
  /** FK → Project (nullable) */
  project_id: string | null;
}

// ─── Request / Filter types ────────────────────────────────────────────────

export interface CreateDBMSGroupRequest {
  group_id: string;
  port: string;
  dbms_type: DBMSType;
  version?: string;
}

export interface UpdateDBMSGroupRequest {
  port?: string;
  dbms_type?: DBMSType;
  version?: string;
}

export interface CreateDBMSResourceRequest {
  dbms_group_id: string;
  name?: string;
  vm_id: string;
}

export interface UpdateDBMSResourceRequest {
  dbms_group_id?: string;
  name?: string;
  vm_id?: string;
}

export interface CreateDatabaseRequest {
  name: string;
  group_id: string;
  project_id?: string | null;
}

export interface UpdateDatabaseRequest {
  name?: string;
  group_id?: string;
  project_id?: string | null;
}

export interface CreateDatabaseUserRequest {
  database_id: string;
  username: string;
  password: string;
  access_type: DBAccessType;
  project_id?: string | null;
}

export interface UpdateDatabaseUserRequest {
  username?: string;
  password?: string;
  access_type?: DBAccessType;
  project_id?: string | null;
}

export interface DBMSGroupFilters {
  group_id?: string;
  dbms_type?: DBMSType;
}

export interface DBMSResourceFilters {
  dbms_group_id?: string;
  vm_id?: string;
}

export interface DatabaseFilters {
  group_id?: string;
  project_id?: string;
}

export interface DatabaseUserFilters {
  database_id?: string;
  access_type?: DBAccessType;
  project_id?: string;
}
