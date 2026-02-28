/**
 * Mock API — Роли (5) и Права доступа
 */

import type {
  Role,
  Permission,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  RoleFilters,
  PermissionFilters,
} from "@/entities/role";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { store, delay, queryList } from "./_store";

// ─── Roles ─────────────────────────────────────────────────────────────────

export async function getRolesListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
  filters?: RoleFilters,
): Promise<InfiniteScrollResponse<Role>> {
  await delay(200);
  return queryList(store.roles, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["name"],
    filters: filters as Record<string, unknown>,
  });
}

export async function getRoleMock(id: string): Promise<Role | null> {
  await delay(100);
  return store.roles.find((r) => r.id === id) ?? null;
}

export async function createRoleMock(data: CreateRoleRequest): Promise<Role> {
  await delay(300);
  const now = new Date().toISOString();
  const num = store.roles.length + 1;
  const r: Role = {
    id: `role-${String(num).padStart(2, "0")}`,
    name: data.name,
    user_ids: data.user_ids ?? [],
    full_view: data.full_view ?? false,
    created_at: now,
    updated_at: now,
  };
  store.roles.push(r);
  return r;
}

export async function updateRoleMock(
  id: string,
  data: UpdateRoleRequest,
): Promise<Role | null> {
  await delay(300);
  const idx = store.roles.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  store.roles[idx] = {
    ...store.roles[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.roles[idx];
}

export async function deleteRoleMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.roles.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  store.roles.splice(idx, 1);
  return true;
}

// ─── Permissions ───────────────────────────────────────────────────────────

export async function getPermissionsListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  _search?: string,
  filters?: PermissionFilters,
): Promise<InfiniteScrollResponse<Permission>> {
  await delay(200);
  return queryList(store.permissions, {
    offset,
    limit,
    sortBy,
    sortOrder,
    filters: filters as Record<string, unknown>,
  });
}

export async function getPermissionMock(
  id: string,
): Promise<Permission | null> {
  await delay(100);
  return store.permissions.find((p) => p.id === id) ?? null;
}

export async function createPermissionMock(
  data: CreatePermissionRequest,
): Promise<Permission> {
  await delay(300);
  const now = new Date().toISOString();
  const num = store.permissions.length + 1;
  const p: Permission = {
    id: `perm-${String(num).padStart(4, "0")}`,
    role_id: data.role_id,
    zone: data.zone,
    access_type: data.access_type,
    group_id: data.group_id ?? null,
    created_at: now,
    updated_at: now,
  };
  store.permissions.push(p);
  return p;
}

export async function updatePermissionMock(
  id: string,
  data: UpdatePermissionRequest,
): Promise<Permission | null> {
  await delay(300);
  const idx = store.permissions.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  store.permissions[idx] = {
    ...store.permissions[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.permissions[idx];
}

export async function deletePermissionMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.permissions.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  store.permissions.splice(idx, 1);
  return true;
}
