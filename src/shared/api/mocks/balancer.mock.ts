/**
 * Mock API — Балансировщики: группы (8) и ресурсы (30)
 */

import type {
  BalancerGroup,
  BalancerResource,
  CreateBalancerGroupRequest,
  UpdateBalancerGroupRequest,
  CreateBalancerResourceRequest,
  UpdateBalancerResourceRequest,
  BalancerGroupFilters,
  BalancerResourceFilters,
} from "@/entities/balancer";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { store, delay, queryList } from "./_store";

// ─── Balancer Groups ───────────────────────────────────────────────────────

export async function getBalancerGroupsListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  _search?: string,
  filters?: BalancerGroupFilters,
): Promise<InfiniteScrollResponse<BalancerGroup>> {
  await delay(200);
  return queryList(store.balancerGroups, {
    offset,
    limit,
    sortBy,
    sortOrder,
    filters: filters as Record<string, unknown>,
  });
}

export async function getBalancerGroupMock(
  id: string,
): Promise<BalancerGroup | null> {
  await delay(100);
  return store.balancerGroups.find((g) => g.id === id) ?? null;
}

export async function createBalancerGroupMock(
  data: CreateBalancerGroupRequest,
): Promise<BalancerGroup> {
  await delay(300);
  const now = new Date().toISOString();
  const num = store.balancerGroups.length + 1;
  const g: BalancerGroup = {
    id: `balgrp-${String(num).padStart(2, "0")}`,
    ceph_user_id: data.ceph_user_id ?? null,
    group_id: data.group_id,
    created_at: now,
    updated_at: now,
  };
  store.balancerGroups.push(g);
  return g;
}

export async function updateBalancerGroupMock(
  id: string,
  data: UpdateBalancerGroupRequest,
): Promise<BalancerGroup | null> {
  await delay(300);
  const idx = store.balancerGroups.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  store.balancerGroups[idx] = {
    ...store.balancerGroups[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.balancerGroups[idx];
}

export async function deleteBalancerGroupMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.balancerGroups.findIndex((g) => g.id === id);
  if (idx === -1) return false;
  store.balancerGroups.splice(idx, 1);
  return true;
}

// ─── Balancer Resources ────────────────────────────────────────────────────

export async function getBalancerResourcesListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
  filters?: BalancerResourceFilters,
): Promise<InfiniteScrollResponse<BalancerResource>> {
  await delay(200);
  return queryList(store.balancerResources, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["name"],
    filters: filters as Record<string, unknown>,
  });
}

export async function getBalancerResourceMock(
  id: string,
): Promise<BalancerResource | null> {
  await delay(100);
  return store.balancerResources.find((r) => r.id === id) ?? null;
}

export async function createBalancerResourceMock(
  data: CreateBalancerResourceRequest,
): Promise<BalancerResource> {
  await delay(300);
  const now = new Date().toISOString();
  const num = store.balancerResources.length + 1;
  const r: BalancerResource = {
    id: `balres-${String(num).padStart(2, "0")}`,
    name: data.name ?? `mbls${String(num).padStart(2, "0")}`,
    vm_id: data.vm_id,
    balancer_group_id: data.balancer_group_id,
    created_at: now,
    updated_at: now,
  };
  store.balancerResources.push(r);
  return r;
}

export async function updateBalancerResourceMock(
  id: string,
  data: UpdateBalancerResourceRequest,
): Promise<BalancerResource | null> {
  await delay(300);
  const idx = store.balancerResources.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  store.balancerResources[idx] = {
    ...store.balancerResources[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.balancerResources[idx];
}

export async function deleteBalancerResourceMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.balancerResources.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  store.balancerResources.splice(idx, 1);
  return true;
}
