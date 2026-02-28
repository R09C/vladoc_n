/**
 * Mock API — Домены (50)
 */

import type {
  Domain,
  CreateDomainRequest,
  UpdateDomainRequest,
  DomainFilters,
} from "@/entities/domain";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { store, delay, queryList } from "./_store";

export async function getDomainsListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
  filters?: DomainFilters,
): Promise<InfiniteScrollResponse<Domain>> {
  await delay(200);
  return queryList(store.domains, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["name"],
    filters: filters as Record<string, unknown>,
  });
}

export async function getDomainMock(id: string): Promise<Domain | null> {
  await delay(100);
  return store.domains.find((d) => d.id === id) ?? null;
}

export async function createDomainMock(
  data: CreateDomainRequest,
): Promise<Domain> {
  await delay(300);
  const now = new Date().toISOString();
  const num = store.domains.length + 1;
  const d: Domain = {
    id: `domain-${String(num).padStart(2, "0")}`,
    name: data.name,
    is_internal: data.is_internal ?? false,
    is_external: data.is_external ?? false,
    is_system: data.is_system ?? false,
    balancer_group_ids: data.balancer_group_ids ?? [],
    created_at: now,
    updated_at: now,
  };
  store.domains.push(d);
  return d;
}

export async function updateDomainMock(
  id: string,
  data: UpdateDomainRequest,
): Promise<Domain | null> {
  await delay(300);
  const idx = store.domains.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  store.domains[idx] = {
    ...store.domains[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.domains[idx];
}

export async function deleteDomainMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.domains.findIndex((d) => d.id === id);
  if (idx === -1) return false;
  store.domains.splice(idx, 1);
  return true;
}
