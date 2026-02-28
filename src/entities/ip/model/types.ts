/**
 * IP и IP Pool — модели данных по PRD
 */

import type { BaseEntity } from "@/shared/lib/types/base";

/** Пул IP-адресов */
export interface IPPool extends BaseEntity {
  /** Уникальное наименование (формат: mpol + NN) */
  name: string;
  /** Описание */
  description: string;
  /** Список зон (jsonb) */
  zones: string[];
}

/** IP-адрес */
export interface IP extends BaseEntity {
  /** FK → VirtualMachine (nullable — IP может существовать без привязки к ВМ) */
  vm_id: string | null;
  /** FK → IPPool */
  pool_id: string;
  /** Описание */
  description: string;
  /** IP-адрес (валидация формата IPv4, уникальный) */
  ip_address: string;
}

/** Запрос на создание IP Pool */
export interface CreateIPPoolRequest {
  name?: string;
  description?: string;
  zones?: string[];
}

/** Запрос на обновление IP Pool */
export interface UpdateIPPoolRequest {
  name?: string;
  description?: string;
  zones?: string[];
}

/** Запрос на создание IP */
export interface CreateIPRequest {
  vm_id?: string | null;
  pool_id: string;
  description?: string;
  ip_address: string;
}

/** Запрос на обновление IP */
export interface UpdateIPRequest {
  vm_id?: string | null;
  pool_id?: string;
  description?: string;
  ip_address?: string;
}

/** Фильтры для списка IP */
export interface IPFilters {
  pool_id?: string;
  vm_id?: string;
  /** Свободные IP (vm_id = null) */
  unassigned?: boolean;
}
