/**
 * Mock API — DNS-ресурсы (60 записей)
 */

import type {
  DNSResource,
  CreateDNSResourceRequest,
  UpdateDNSResourceRequest,
  DNSResourceFilters,
} from "@/entities/dns";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { store, delay, queryList } from "./_store";

export async function getDNSListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
  filters?: DNSResourceFilters,
): Promise<InfiniteScrollResponse<DNSResource>> {
  await delay(200);
  return queryList(store.dnsResources, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["name"],
    filters: filters as Record<string, unknown>,
  });
}

export async function getDNSMock(id: string): Promise<DNSResource | null> {
  await delay(100);
  return store.dnsResources.find((d) => d.id === id) ?? null;
}

export async function createDNSMock(
  data: CreateDNSResourceRequest,
): Promise<DNSResource> {
  await delay(300);
  const now = new Date().toISOString();
  const num = store.dnsResources.length + 1;
  const dns: DNSResource = {
    id: `dns-${String(num).padStart(2, "0")}`,
    group_id: data.group_id,
    name: data.name ?? `mnsc${String(num).padStart(2, "0")}`,
    parent_group_id: data.parent_group_id ?? null,
    type: data.type,
    vm_id: data.vm_id,
    created_at: now,
    updated_at: now,
  };
  store.dnsResources.push(dns);
  return dns;
}

export async function updateDNSMock(
  id: string,
  data: UpdateDNSResourceRequest,
): Promise<DNSResource | null> {
  await delay(300);
  const idx = store.dnsResources.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  store.dnsResources[idx] = {
    ...store.dnsResources[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.dnsResources[idx];
}

export async function deleteDNSMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.dnsResources.findIndex((d) => d.id === id);
  if (idx === -1) return false;
  store.dnsResources.splice(idx, 1);
  return true;
}
