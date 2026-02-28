/**
 * Mock API — IP Pool (10) и IP-адреса (600)
 */

import type {
  IPPool,
  IP,
  CreateIPPoolRequest,
  UpdateIPPoolRequest,
  CreateIPRequest,
  UpdateIPRequest,
  IPFilters,
} from "@/entities/ip";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { store, delay, queryList } from "./_store";

// ─── IP Pool ───────────────────────────────────────────────────────────────

export async function getIPPoolsListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
): Promise<InfiniteScrollResponse<IPPool>> {
  await delay(200);
  return queryList(store.ipPools, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["name", "description"],
  });
}

export async function getIPPoolMock(id: string): Promise<IPPool | null> {
  await delay(100);
  return store.ipPools.find((p) => p.id === id) ?? null;
}

export async function createIPPoolMock(
  data: CreateIPPoolRequest,
): Promise<IPPool> {
  await delay(300);
  const now = new Date().toISOString();
  const num = store.ipPools.length + 1;
  const pool: IPPool = {
    id: `pool-${String(num).padStart(2, "0")}`,
    name: data.name ?? `mpol${String(num).padStart(2, "0")}`,
    description: data.description ?? "",
    zones: data.zones ?? [],
    created_at: now,
    updated_at: now,
  };
  store.ipPools.push(pool);
  return pool;
}

export async function updateIPPoolMock(
  id: string,
  data: UpdateIPPoolRequest,
): Promise<IPPool | null> {
  await delay(300);
  const idx = store.ipPools.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  store.ipPools[idx] = {
    ...store.ipPools[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.ipPools[idx];
}

export async function deleteIPPoolMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.ipPools.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  store.ipPools.splice(idx, 1);
  return true;
}

// ─── IP ────────────────────────────────────────────────────────────────────

export async function getIPsListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
  filters?: IPFilters,
): Promise<InfiniteScrollResponse<IP>> {
  await delay(250);
  let items = [...store.ips];

  if (filters?.unassigned) {
    items = items.filter((ip) => ip.vm_id === null);
  }

  return queryList(items, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["ip_address", "description"],
    filters: {
      pool_id: filters?.pool_id,
      vm_id: filters?.unassigned ? undefined : filters?.vm_id,
    },
  });
}

export async function getIPMock(id: string): Promise<IP | null> {
  await delay(100);
  return store.ips.find((ip) => ip.id === id) ?? null;
}

export async function createIPMock(data: CreateIPRequest): Promise<IP> {
  await delay(300);
  const now = new Date().toISOString();
  const ip: IP = {
    id: `ip-${String(store.ips.length + 1).padStart(4, "0")}`,
    vm_id: data.vm_id ?? null,
    pool_id: data.pool_id,
    description: data.description ?? "",
    ip_address: data.ip_address,
    created_at: now,
    updated_at: now,
  };
  store.ips.push(ip);
  return ip;
}

export async function updateIPMock(
  id: string,
  data: UpdateIPRequest,
): Promise<IP | null> {
  await delay(300);
  const idx = store.ips.findIndex((ip) => ip.id === id);
  if (idx === -1) return null;
  store.ips[idx] = {
    ...store.ips[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.ips[idx];
}

export async function deleteIPMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.ips.findIndex((ip) => ip.id === id);
  if (idx === -1) return false;
  store.ips.splice(idx, 1);
  return true;
}
