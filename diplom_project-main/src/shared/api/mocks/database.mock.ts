/**
 * Mock API — Базы данных
 * Группы СУБД (8), Ресурсы СУБД (30), БД (120), Пользователи БД (200)
 */

import type {
  DBMSGroup,
  DBMSResource,
  Database,
  DatabaseUser,
  CreateDBMSGroupRequest,
  UpdateDBMSGroupRequest,
  CreateDBMSResourceRequest,
  UpdateDBMSResourceRequest,
  CreateDatabaseRequest,
  UpdateDatabaseRequest,
  CreateDatabaseUserRequest,
  UpdateDatabaseUserRequest,
  DBMSGroupFilters,
  DBMSResourceFilters,
  DatabaseFilters,
  DatabaseUserFilters,
} from "@/entities/database";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { store, delay, queryList } from "./_store";

// ─── DBMS Groups ───────────────────────────────────────────────────────────

export async function getDBMSGroupsListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
  filters?: DBMSGroupFilters,
): Promise<InfiniteScrollResponse<DBMSGroup>> {
  await delay(200);
  return queryList(store.dbmsGroups, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["port", "version"],
    filters: filters as Record<string, unknown>,
  });
}

export async function getDBMSGroupMock(id: string): Promise<DBMSGroup | null> {
  await delay(100);
  return store.dbmsGroups.find((g) => g.id === id) ?? null;
}

export async function createDBMSGroupMock(
  data: CreateDBMSGroupRequest,
): Promise<DBMSGroup> {
  await delay(300);
  const now = new Date().toISOString();
  const g: DBMSGroup = {
    id: `dbmsgrp-${String(store.dbmsGroups.length + 1).padStart(2, "0")}`,
    group_id: data.group_id,
    port: data.port,
    dbms_type: data.dbms_type,
    version: data.version ?? "",
    created_at: now,
    updated_at: now,
  };
  store.dbmsGroups.push(g);
  return g;
}

export async function updateDBMSGroupMock(
  id: string,
  data: UpdateDBMSGroupRequest,
): Promise<DBMSGroup | null> {
  await delay(300);
  const idx = store.dbmsGroups.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  store.dbmsGroups[idx] = {
    ...store.dbmsGroups[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.dbmsGroups[idx];
}

export async function deleteDBMSGroupMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.dbmsGroups.findIndex((g) => g.id === id);
  if (idx === -1) return false;
  store.dbmsGroups.splice(idx, 1);
  return true;
}

// ─── DBMS Resources ────────────────────────────────────────────────────────

export async function getDBMSResourcesListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
  filters?: DBMSResourceFilters,
): Promise<InfiniteScrollResponse<DBMSResource>> {
  await delay(200);
  return queryList(store.dbmsResources, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["name"],
    filters: filters as Record<string, unknown>,
  });
}

export async function getDBMSResourceMock(
  id: string,
): Promise<DBMSResource | null> {
  await delay(100);
  return store.dbmsResources.find((r) => r.id === id) ?? null;
}

export async function createDBMSResourceMock(
  data: CreateDBMSResourceRequest,
): Promise<DBMSResource> {
  await delay(300);
  const now = new Date().toISOString();
  const num = store.dbmsResources.length + 1;
  const r: DBMSResource = {
    id: `dbmsres-${String(num).padStart(2, "0")}`,
    dbms_group_id: data.dbms_group_id,
    name: data.name ?? `mbds${String(num).padStart(2, "0")}`,
    vm_id: data.vm_id,
    created_at: now,
    updated_at: now,
  };
  store.dbmsResources.push(r);
  return r;
}

export async function updateDBMSResourceMock(
  id: string,
  data: UpdateDBMSResourceRequest,
): Promise<DBMSResource | null> {
  await delay(300);
  const idx = store.dbmsResources.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  store.dbmsResources[idx] = {
    ...store.dbmsResources[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.dbmsResources[idx];
}

export async function deleteDBMSResourceMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.dbmsResources.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  store.dbmsResources.splice(idx, 1);
  return true;
}

// ─── Databases ─────────────────────────────────────────────────────────────

export async function getDatabasesListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
  filters?: DatabaseFilters,
): Promise<InfiniteScrollResponse<Database>> {
  await delay(200);
  return queryList(store.databases, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["name"],
    filters: filters as Record<string, unknown>,
  });
}

export async function getDatabaseMock(id: string): Promise<Database | null> {
  await delay(100);
  return store.databases.find((d) => d.id === id) ?? null;
}

export async function createDatabaseMock(
  data: CreateDatabaseRequest,
): Promise<Database> {
  await delay(300);
  const now = new Date().toISOString();
  const db: Database = {
    id: `db-${String(store.databases.length + 1).padStart(3, "0")}`,
    name: data.name,
    group_id: data.group_id,
    project_id: data.project_id ?? null,
    created_at: now,
    updated_at: now,
  };
  store.databases.push(db);
  return db;
}

export async function updateDatabaseMock(
  id: string,
  data: UpdateDatabaseRequest,
): Promise<Database | null> {
  await delay(300);
  const idx = store.databases.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  store.databases[idx] = {
    ...store.databases[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.databases[idx];
}

export async function deleteDatabaseMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.databases.findIndex((d) => d.id === id);
  if (idx === -1) return false;
  store.databases.splice(idx, 1);
  return true;
}

// ─── Database Users ────────────────────────────────────────────────────────

export async function getDatabaseUsersListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
  filters?: DatabaseUserFilters,
): Promise<InfiniteScrollResponse<DatabaseUser>> {
  await delay(200);
  return queryList(store.databaseUsers, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["username"],
    filters: filters as Record<string, unknown>,
  });
}

export async function getDatabaseUserMock(
  id: string,
): Promise<DatabaseUser | null> {
  await delay(100);
  return store.databaseUsers.find((u) => u.id === id) ?? null;
}

export async function createDatabaseUserMock(
  data: CreateDatabaseUserRequest,
): Promise<DatabaseUser> {
  await delay(300);
  const now = new Date().toISOString();
  const u: DatabaseUser = {
    id: `dbuser-${String(store.databaseUsers.length + 1).padStart(3, "0")}`,
    database_id: data.database_id,
    username: data.username,
    password: "••••••••",
    access_type: data.access_type,
    project_id: data.project_id ?? null,
    created_at: now,
    updated_at: now,
  };
  store.databaseUsers.push(u);
  return u;
}

export async function updateDatabaseUserMock(
  id: string,
  data: UpdateDatabaseUserRequest,
): Promise<DatabaseUser | null> {
  await delay(300);
  const idx = store.databaseUsers.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  store.databaseUsers[idx] = {
    ...store.databaseUsers[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.databaseUsers[idx];
}

export async function deleteDatabaseUserMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.databaseUsers.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  store.databaseUsers.splice(idx, 1);
  return true;
}
