/**
 * OperatingSystem — модель данных по PRD
 */

import type { BaseEntity } from "@/shared/lib/types/base";

/** Операционная система */
export interface OperatingSystem extends BaseEntity {
  /** Наименование ОС */
  name: string;
  /** Версия ОС */
  version: string;
}

/** Запрос на создание ОС */
export interface CreateOperatingSystemRequest {
  name: string;
  version: string;
}

/** Запрос на обновление ОС */
export interface UpdateOperatingSystemRequest {
  name?: string;
  version?: string;
}
