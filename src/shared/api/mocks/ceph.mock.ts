/**
 * Mock API — CEPH: ресурсы (24), папки (40), пользователи (30), доступы (~80)
 */

import type {
  CephResource,
  CephFolder,
  CephUser,
  CephFolderAccess,
  CreateCephResourceRequest,
  UpdateCephResourceRequest,
  CreateCephFolderRequest,
  UpdateCephFolderRequest,
  CreateCephUserRequest,
  UpdateCephUserRequest,
  CreateCephFolderAccessRequest,
  UpdateCephFolderAccessRequest,
  CephResourceFilters,
  CephFolderFilters,
  CephUserFilters,
  CephFolderAccessFilters,
} from "@/entities/ceph";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { store, delay, queryList } from "./_store";

// ─── CEPH Resources ────────────────────────────────────────────────────────

export async function getCephResourcesListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
  filters?: CephResourceFilters,
): Promise<InfiniteScrollResponse<CephResource>> {
  await delay(200);
  return queryList(store.cephResources, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["name"],
    filters: filters as Record<string, unknown>,
  });
}

export async function getCephResourceMock(
  id: string,
): Promise<CephResource | null> {
  await delay(100);
  return store.cephResources.find((r) => r.id === id) ?? null;
}

export async function createCephResourceMock(
  data: CreateCephResourceRequest,
): Promise<CephResource> {
  await delay(300);
  const now = new Date().toISOString();
  const num = store.cephResources.length + 1;
  const r: CephResource = {
    id: `cephres-${String(num).padStart(2, "0")}`,
    name: data.name ?? `ceph${String(num).padStart(2, "0")}`,
    group_id: data.group_id,
    vm_id: data.vm_id,
    created_at: now,
    updated_at: now,
  };
  store.cephResources.push(r);
  return r;
}

export async function updateCephResourceMock(
  id: string,
  data: UpdateCephResourceRequest,
): Promise<CephResource | null> {
  await delay(300);
  const idx = store.cephResources.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  store.cephResources[idx] = {
    ...store.cephResources[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.cephResources[idx];
}

export async function deleteCephResourceMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.cephResources.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  store.cephResources.splice(idx, 1);
  return true;
}

// ─── CEPH Folders ──────────────────────────────────────────────────────────

export async function getCephFoldersListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
  filters?: CephFolderFilters,
): Promise<InfiniteScrollResponse<CephFolder>> {
  await delay(200);
  return queryList(store.cephFolders, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["name"],
    filters: filters as Record<string, unknown>,
  });
}

export async function getCephFolderMock(
  id: string,
): Promise<CephFolder | null> {
  await delay(100);
  return store.cephFolders.find((f) => f.id === id) ?? null;
}

export async function createCephFolderMock(
  data: CreateCephFolderRequest,
): Promise<CephFolder> {
  await delay(300);
  const now = new Date().toISOString();
  const num = store.cephFolders.length + 1;
  const f: CephFolder = {
    id: `cephfld-${String(num).padStart(2, "0")}`,
    name: data.name,
    is_active: data.is_active ?? true,
    group_id: data.group_id,
    created_at: now,
    updated_at: now,
  };
  store.cephFolders.push(f);
  return f;
}

export async function updateCephFolderMock(
  id: string,
  data: UpdateCephFolderRequest,
): Promise<CephFolder | null> {
  await delay(300);
  const idx = store.cephFolders.findIndex((f) => f.id === id);
  if (idx === -1) return null;
  store.cephFolders[idx] = {
    ...store.cephFolders[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.cephFolders[idx];
}

export async function deleteCephFolderMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.cephFolders.findIndex((f) => f.id === id);
  if (idx === -1) return false;
  store.cephFolders.splice(idx, 1);
  return true;
}

// ─── CEPH Users ────────────────────────────────────────────────────────────

export async function getCephUsersListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
  filters?: CephUserFilters,
): Promise<InfiniteScrollResponse<CephUser>> {
  await delay(200);
  return queryList(store.cephUsers, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["name"],
    filters: filters as Record<string, unknown>,
  });
}

export async function getCephUserMock(id: string): Promise<CephUser | null> {
  await delay(100);
  return store.cephUsers.find((u) => u.id === id) ?? null;
}

export async function createCephUserMock(
  data: CreateCephUserRequest,
): Promise<CephUser> {
  await delay(300);
  const now = new Date().toISOString();
  const num = store.cephUsers.length + 1;
  const u: CephUser = {
    id: `cephusr-${String(num).padStart(2, "0")}`,
    group_id: data.group_id,
    name: data.name,
    is_active: data.is_active ?? true,
    project_id: data.project_id ?? null,
    key:
      data.key ??
      `AQC${String.fromCharCode(65 + (num % 26))}${String(num).padStart(4, "0")}==`,
    created_at: now,
    updated_at: now,
  };
  store.cephUsers.push(u);
  return u;
}

export async function updateCephUserMock(
  id: string,
  data: UpdateCephUserRequest,
): Promise<CephUser | null> {
  await delay(300);
  const idx = store.cephUsers.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  store.cephUsers[idx] = {
    ...store.cephUsers[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.cephUsers[idx];
}

export async function deleteCephUserMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.cephUsers.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  store.cephUsers.splice(idx, 1);
  return true;
}

// ─── CEPH Folder Access ────────────────────────────────────────────────────

export async function getCephFolderAccessListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  _search?: string,
  filters?: CephFolderAccessFilters,
): Promise<InfiniteScrollResponse<CephFolderAccess>> {
  await delay(200);
  return queryList(store.cephFolderAccess, {
    offset,
    limit,
    sortBy,
    sortOrder,
    filters: filters as Record<string, unknown>,
  });
}

export async function getCephFolderAccessMock(
  id: string,
): Promise<CephFolderAccess | null> {
  await delay(100);
  return store.cephFolderAccess.find((a) => a.id === id) ?? null;
}

export async function createCephFolderAccessMock(
  data: CreateCephFolderAccessRequest,
): Promise<CephFolderAccess> {
  await delay(300);
  const now = new Date().toISOString();
  const num = store.cephFolderAccess.length + 1;
  const a: CephFolderAccess = {
    id: `cephacc-${String(num).padStart(2, "0")}`,
    user_id: data.user_id,
    folder_id: data.folder_id,
    access_type: data.access_type,
    created_at: now,
    updated_at: now,
  };
  store.cephFolderAccess.push(a);
  return a;
}

export async function updateCephFolderAccessMock(
  id: string,
  data: UpdateCephFolderAccessRequest,
): Promise<CephFolderAccess | null> {
  await delay(300);
  const idx = store.cephFolderAccess.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  store.cephFolderAccess[idx] = {
    ...store.cephFolderAccess[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.cephFolderAccess[idx];
}

export async function deleteCephFolderAccessMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.cephFolderAccess.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  store.cephFolderAccess.splice(idx, 1);
  return true;
}
