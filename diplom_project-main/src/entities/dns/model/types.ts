/**
 * DNS Resource — модель данных по PRD
 */

import type { BaseEntity } from "@/shared/lib/types/base";
import type { DNSType } from "@/shared/config/enums";

/** Ресурс DNS */
export interface DNSResource extends BaseEntity {
  /** FK → ObjectGroup (NSC) */
  group_id: string;
  /** Наименование (формат: mnsc + NN) */
  name: string;
  /** FK → ObjectGroup (NSC) — вышестоящая DNS-группа (nullable) */
  parent_group_id: string | null;
  /** Тип DNS: MASTER | SLAVE | RESERVE */
  type: DNSType;
  /** FK → VirtualMachine */
  vm_id: string;
}

/** Запрос на создание DNS-ресурса */
export interface CreateDNSResourceRequest {
  group_id: string;
  name?: string;
  parent_group_id?: string | null;
  type: DNSType;
  vm_id: string;
}

/** Запрос на обновление DNS-ресурса */
export interface UpdateDNSResourceRequest {
  group_id?: string;
  name?: string;
  parent_group_id?: string | null;
  type?: DNSType;
  vm_id?: string;
}

/** Фильтры для списка DNS-ресурсов */
export interface DNSResourceFilters {
  group_id?: string;
  type?: DNSType;
  vm_id?: string;
}
