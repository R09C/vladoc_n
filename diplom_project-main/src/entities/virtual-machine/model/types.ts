/**
 * Virtual Machine — модель данных по PRD
 * Виртуальная машина с вычислительными ресурсами и связями
 */

import type { BaseEntity } from "@/shared/lib/types/base";

export type { BaseEntity };

/** Виртуальная машина */
export interface VirtualMachine extends BaseEntity {
  /** Уникальное наименование (автогенерация) */
  name: string;
  /** Описание */
  description: string;
  /** Признак закрытого контура */
  is_closed_circuit: boolean;
  /** Активна (не может быть true одновременно с is_deleted) */
  is_active: boolean;
  /** Дата активации */
  activation_date: string | null;
  /** Признак удалённой (soft delete) */
  is_deleted: boolean;
  /** Дата удаления */
  deletion_date: string | null;
  /** FK → ObjectGroup (NSC) — DNS-группа */
  dns_group_id: string | null;
  /** FK → Gateway */
  gateway_id: string | null;
  /** Размер swap, ГБ */
  swap_size: number;
  /** Размер rem, ГБ */
  rem_size: number;
  /** Размер RAM, ГБ */
  ram_size: number;
  /** Количество CPU */
  cpu_count: number;
  /** FK → OperatingSystem */
  os_id: string | null;
}

/** Запрос на создание ВМ */
export interface CreateVMRequest {
  name: string;
  description?: string;
  is_closed_circuit?: boolean;
  dns_group_id?: string | null;
  gateway_id?: string | null;
  swap_size: number;
  rem_size: number;
  ram_size: number;
  cpu_count: number;
  os_id?: string | null;
}

/** Запрос на обновление ВМ */
export interface UpdateVMRequest {
  name?: string;
  description?: string;
  is_closed_circuit?: boolean;
  is_active?: boolean;
  is_deleted?: boolean;
  dns_group_id?: string | null;
  gateway_id?: string | null;
  swap_size?: number;
  rem_size?: number;
  ram_size?: number;
  cpu_count?: number;
  os_id?: string | null;
}

/** Фильтры для списка ВМ */
export interface VMFilters {
  is_active?: boolean;
  is_deleted?: boolean;
  is_closed_circuit?: boolean;
  os_id?: string[];
  dns_group_id?: string[];
}
