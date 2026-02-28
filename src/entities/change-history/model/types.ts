/**
 * ChangeHistory — модель истории изменений по PRD
 * Автоматическая фиксация всех изменений объектов реестра
 */

import type { BaseEntity } from "@/shared/lib/types/base";
import type { ActionType } from "@/shared/config/enums";

/** Запись истории изменений */
export interface ChangeHistory extends BaseEntity {
  /** Тип объекта (название модели: VirtualMachine, Database, ...) */
  content_type: string;
  /** ID изменённого объекта */
  object_id: string;
  /** Снэпшот данных (до/после) */
  value: Record<string, unknown>;
  /** FK → User */
  user_id: string;
  /** Метка времени (уникальная в рамках объекта) */
  timestamp: string;
  /** Тип действия: CREATE | UPDATE | DELETE */
  action: ActionType;
}

// ─── Request / Filter types ────────────────────────────────────────────────

/** Фильтры для списка истории изменений */
export interface ChangeHistoryFilters {
  /** Тип объекта */
  content_type?: string;
  /** ID объекта */
  object_id?: string;
  /** ID пользователя */
  user_id?: string;
  /** Тип действия */
  action?: ActionType;
  /** Дата от */
  date_from?: string;
  /** Дата до */
  date_to?: string;
}
