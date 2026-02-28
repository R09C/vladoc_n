/**
 * Mock API — Redis: ресурсы (30) и БД (60)
 */

import type {
  RedisResource,
  RedisDB,
  CreateRedisResourceRequest,
  UpdateRedisResourceRequest,
  CreateRedisDBRequest,
  UpdateRedisDBRequest,
  RedisResourceFilters,
  RedisDBFilters,
} from "@/entities/redis";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { store, delay, queryList } from "./_store";

// ─── Redis Resources ───────────────────────────────────────────────────────

export async function getRedisResourcesListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
  filters?: RedisResourceFilters,
): Promise<InfiniteScrollResponse<RedisResource>> {
  await delay(200);
  return queryList(store.redisResources, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["name"],
    filters: filters as Record<string, unknown>,
  });
}

export async function getRedisResourceMock(
  id: string,
): Promise<RedisResource | null> {
  await delay(100);
  return store.redisResources.find((r) => r.id === id) ?? null;
}

export async function createRedisResourceMock(
  data: CreateRedisResourceRequest,
): Promise<RedisResource> {
  await delay(300);
  const now = new Date().toISOString();
  const num = store.redisResources.length + 1;
  const r: RedisResource = {
    id: `rdres-${String(num).padStart(2, "0")}`,
    group_id: data.group_id,
    vm_id: data.vm_id,
    name: data.name ?? `mrds${String(num).padStart(2, "0")}`,
    created_at: now,
    updated_at: now,
  };
  store.redisResources.push(r);
  return r;
}

export async function updateRedisResourceMock(
  id: string,
  data: UpdateRedisResourceRequest,
): Promise<RedisResource | null> {
  await delay(300);
  const idx = store.redisResources.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  store.redisResources[idx] = {
    ...store.redisResources[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.redisResources[idx];
}

export async function deleteRedisResourceMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.redisResources.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  store.redisResources.splice(idx, 1);
  return true;
}

// ─── Redis DBs ─────────────────────────────────────────────────────────────

export async function getRedisDBsListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
  filters?: RedisDBFilters,
): Promise<InfiniteScrollResponse<RedisDB>> {
  await delay(200);
  return queryList(store.redisDBs, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["port"],
    filters: filters as Record<string, unknown>,
  });
}

export async function getRedisDBMock(id: string): Promise<RedisDB | null> {
  await delay(100);
  return store.redisDBs.find((d) => d.id === id) ?? null;
}

export async function createRedisDBMock(
  data: CreateRedisDBRequest,
): Promise<RedisDB> {
  await delay(300);
  const now = new Date().toISOString();
  const num = store.redisDBs.length + 1;
  const db: RedisDB = {
    id: `rddb-${String(num).padStart(2, "0")}`,
    group_id: data.group_id,
    port: data.port,
    password: data.password,
    project_id: data.project_id ?? null,
    created_at: now,
    updated_at: now,
  };
  store.redisDBs.push(db);
  return db;
}

export async function updateRedisDBMock(
  id: string,
  data: UpdateRedisDBRequest,
): Promise<RedisDB | null> {
  await delay(300);
  const idx = store.redisDBs.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  store.redisDBs[idx] = {
    ...store.redisDBs[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.redisDBs[idx];
}

export async function deleteRedisDBMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.redisDBs.findIndex((d) => d.id === id);
  if (idx === -1) return false;
  store.redisDBs.splice(idx, 1);
  return true;
}
