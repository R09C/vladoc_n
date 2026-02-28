/**
 * Domain — модель данных по PRD
 */

import type { BaseEntity } from "@/shared/lib/types/base";

/** Домен */
export interface Domain extends BaseEntity {
  /** Уникальное наименование */
  name: string;
  /** Внутренний домен */
  is_internal: boolean;
  /** Внешний домен */
  is_external: boolean;
  /** Системный домен */
  is_system: boolean;
  /** M2M → ObjectGroup (BLC) — связанные группы балансировки */
  balancer_group_ids: string[];
}

/** Запрос на создание домена */
export interface CreateDomainRequest {
  name: string;
  is_internal?: boolean;
  is_external?: boolean;
  is_system?: boolean;
  balancer_group_ids?: string[];
}

/** Запрос на обновление домена */
export interface UpdateDomainRequest {
  name?: string;
  is_internal?: boolean;
  is_external?: boolean;
  is_system?: boolean;
  balancer_group_ids?: string[];
}

/** Фильтры для списка доменов */
export interface DomainFilters {
  is_internal?: boolean;
  is_external?: boolean;
  is_system?: boolean;
}
