/**
 * AlternativeClient — модель данных по PRD
 */

import type { BaseEntity } from "@/shared/lib/types/base";

/** Альтернативный клиент */
export interface AlternativeClient extends BaseEntity {
  /** Уникальное наименование */
  name: string;
  /** FK → VirtualMachine */
  vm_id: string;
  /** Описание */
  description: string;
}

/** Запрос на создание альтернативного клиента */
export interface CreateAlternativeClientRequest {
  name: string;
  vm_id: string;
  description?: string;
}

/** Запрос на обновление альтернативного клиента */
export interface UpdateAlternativeClientRequest {
  name?: string;
  vm_id?: string;
  description?: string;
}

/** Фильтры для списка альтернативных клиентов */
export interface AlternativeClientFilters {
  vm_id?: string;
}
