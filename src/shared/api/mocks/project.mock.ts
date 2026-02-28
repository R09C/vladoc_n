/**
 * Mock API — Проекты (50) и Ресурсы проектов (80)
 */

import type {
  Project,
  ProjectResource,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateProjectResourceRequest,
  UpdateProjectResourceRequest,
  ProjectFilters,
  ProjectResourceFilters,
} from "@/entities/project";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { store, delay, queryList } from "./_store";

// ─── Projects ──────────────────────────────────────────────────────────────

export async function getProjectsListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
  filters?: ProjectFilters,
): Promise<InfiniteScrollResponse<Project>> {
  await delay(200);
  return queryList(store.projects, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["name", "description", "responsible_department"],
    filters: filters as Record<string, unknown>,
  });
}

export async function getProjectMock(id: string): Promise<Project | null> {
  await delay(100);
  return store.projects.find((p) => p.id === id) ?? null;
}

export async function createProjectMock(
  data: CreateProjectRequest,
): Promise<Project> {
  await delay(300);
  const now = new Date().toISOString();
  const num = store.projects.length + 1;
  const p: Project = {
    id: `proj-${String(num).padStart(2, "0")}`,
    name: data.name,
    description: data.description ?? "",
    responsible_department: data.responsible_department ?? "",
    is_boxed: data.is_boxed ?? false,
    domain_id: data.domain_id ?? null,
    created_at: now,
    updated_at: now,
  };
  store.projects.push(p);
  return p;
}

export async function updateProjectMock(
  id: string,
  data: UpdateProjectRequest,
): Promise<Project | null> {
  await delay(300);
  const idx = store.projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  store.projects[idx] = {
    ...store.projects[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.projects[idx];
}

export async function deleteProjectMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.projects.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  store.projects.splice(idx, 1);
  return true;
}

// ─── Project Resources ─────────────────────────────────────────────────────

export async function getProjectResourcesListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
  filters?: ProjectResourceFilters,
): Promise<InfiniteScrollResponse<ProjectResource>> {
  await delay(200);
  return queryList(store.projectResources, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["name"],
    filters: filters as Record<string, unknown>,
  });
}

export async function getProjectResourceMock(
  id: string,
): Promise<ProjectResource | null> {
  await delay(100);
  return store.projectResources.find((r) => r.id === id) ?? null;
}

export async function createProjectResourceMock(
  data: CreateProjectResourceRequest,
): Promise<ProjectResource> {
  await delay(300);
  const now = new Date().toISOString();
  const num = store.projectResources.length + 1;
  const r: ProjectResource = {
    id: `psrv-${String(num).padStart(2, "0")}`,
    name: data.name ?? `msrv${String(num).padStart(2, "0")}`,
    vm_id: data.vm_id,
    project_id: data.project_id,
    created_at: now,
    updated_at: now,
  };
  store.projectResources.push(r);
  return r;
}

export async function updateProjectResourceMock(
  id: string,
  data: UpdateProjectResourceRequest,
): Promise<ProjectResource | null> {
  await delay(300);
  const idx = store.projectResources.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  store.projectResources[idx] = {
    ...store.projectResources[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.projectResources[idx];
}

export async function deleteProjectResourceMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.projectResources.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  store.projectResources.splice(idx, 1);
  return true;
}
