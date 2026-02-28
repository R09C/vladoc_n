/**
 * ObjectGroup — Группа объектов
 * Логическая группа, объединяющая ресурсы по типу (NSC, RDC, DBC, BLC, CEPH)
 */

import type { BaseEntity } from "@/shared/lib/types/base";
import type { GroupType } from "@/shared/config/enums";

/** Группа объектов */
export interface ObjectGroup extends BaseEntity {
  /** Тип группы: NSC | RDC | DBC | BLC | CEPH */
  type: GroupType;
  /** Уникальное наименование (автогенерация по типу: mnsc01, mrdc01, ...) */
  name: string;
  /** Описание */
  description: string;
  /** URL репозитория (валидация формата) */
  repo_url: string | null;
}

/** Запрос на создание группы */
export interface CreateObjectGroupRequest {
  type: GroupType;
  name?: string;
  description?: string;
  repo_url?: string | null;
}

/** Запрос на обновление группы */
export interface UpdateObjectGroupRequest {
  name?: string;
  description?: string;
  repo_url?: string | null;
}

/** Фильтры для списка групп */
export interface ObjectGroupFilters {
  type?: GroupType;
}
