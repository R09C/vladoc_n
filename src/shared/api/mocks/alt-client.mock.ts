/**
 * Mock API — Альтернативные клиенты (30)
 */

import type {
  AlternativeClient,
  CreateAlternativeClientRequest,
  UpdateAlternativeClientRequest,
  AlternativeClientFilters,
} from "@/entities/alternative-client";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { store, delay, queryList } from "./_store";

export async function getAltClientsListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
  filters?: AlternativeClientFilters,
): Promise<InfiniteScrollResponse<AlternativeClient>> {
  await delay(200);
  return queryList(store.alternativeClients, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["name", "description"],
    filters: filters as Record<string, unknown>,
  });
}

export async function getAltClientMock(
  id: string,
): Promise<AlternativeClient | null> {
  await delay(100);
  return store.alternativeClients.find((c) => c.id === id) ?? null;
}

export async function createAltClientMock(
  data: CreateAlternativeClientRequest,
): Promise<AlternativeClient> {
  await delay(300);
  const now = new Date().toISOString();
  const num = store.alternativeClients.length + 1;
  const c: AlternativeClient = {
    id: `altcl-${String(num).padStart(2, "0")}`,
    name: data.name,
    vm_id: data.vm_id,
    description: data.description ?? "",
    created_at: now,
    updated_at: now,
  };
  store.alternativeClients.push(c);
  return c;
}

export async function updateAltClientMock(
  id: string,
  data: UpdateAlternativeClientRequest,
): Promise<AlternativeClient | null> {
  await delay(300);
  const idx = store.alternativeClients.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  store.alternativeClients[idx] = {
    ...store.alternativeClients[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.alternativeClients[idx];
}

export async function deleteAltClientMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.alternativeClients.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  store.alternativeClients.splice(idx, 1);
  return true;
}
