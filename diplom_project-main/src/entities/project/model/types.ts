/**
 * Project — модели данных по PRD
 * Проект и Ресурс проекта
 */

import type { BaseEntity } from "@/shared/lib/types/base";

/** Проект */
export interface Project extends BaseEntity {
  /** Уникальное наименование */
  name: string;
  /** Описание */
  description: string;
  /** Ответственный отдел */
  responsible_department: string;
  /** Коробочный продукт */
  is_boxed: boolean;
  /** FK → Domain (nullable) */
  domain_id: string | null;
}

/** Ресурс проекта */
export interface ProjectResource extends BaseEntity {
  /** Наименование (формат: msrv + NN) */
  name: string;
  /** FK → VirtualMachine */
  vm_id: string;
  /** FK → Project */
  project_id: string;
}

// ─── Request / Filter types ────────────────────────────────────────────────

export interface CreateProjectRequest {
  name: string;
  description?: string;
  responsible_department?: string;
  is_boxed?: boolean;
  domain_id?: string | null;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  responsible_department?: string;
  is_boxed?: boolean;
  domain_id?: string | null;
}

export interface CreateProjectResourceRequest {
  name?: string;
  vm_id: string;
  project_id: string;
}

export interface UpdateProjectResourceRequest {
  name?: string;
  vm_id?: string;
  project_id?: string;
}

export interface ProjectFilters {
  is_boxed?: boolean;
  domain_id?: string;
}

export interface ProjectResourceFilters {
  project_id?: string;
  vm_id?: string;
}
