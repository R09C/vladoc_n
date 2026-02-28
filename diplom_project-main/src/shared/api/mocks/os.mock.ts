/**
 * Mock API — Операционные системы (12 записей)
 */

import type {
  OperatingSystem,
  CreateOperatingSystemRequest,
  UpdateOperatingSystemRequest,
} from "@/entities/operating-system";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { store, delay, queryList } from "./_store";

export async function getOSListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
): Promise<InfiniteScrollResponse<OperatingSystem>> {
  await delay(150);
  return queryList(store.operatingSystems, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["name", "version"],
  });
}

/** Возвращает все ОС без пагинации (справочник) */
export async function getAllOSMock(): Promise<OperatingSystem[]> {
  await delay(100);
  return [...store.operatingSystems];
}

export async function getOSMock(id: string): Promise<OperatingSystem | null> {
  await delay(100);
  return store.operatingSystems.find((o) => o.id === id) ?? null;
}

export async function createOSMock(
  data: CreateOperatingSystemRequest,
): Promise<OperatingSystem> {
  await delay(300);
  const now = new Date().toISOString();
  const os: OperatingSystem = {
    id: `os-${String(store.operatingSystems.length + 1).padStart(2, "0")}`,
    name: data.name,
    version: data.version,
    created_at: now,
    updated_at: now,
  };
  store.operatingSystems.push(os);
  return os;
}

export async function updateOSMock(
  id: string,
  data: UpdateOperatingSystemRequest,
): Promise<OperatingSystem | null> {
  await delay(300);
  const idx = store.operatingSystems.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  store.operatingSystems[idx] = {
    ...store.operatingSystems[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.operatingSystems[idx];
}

export async function deleteOSMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.operatingSystems.findIndex((o) => o.id === id);
  if (idx === -1) return false;
  store.operatingSystems.splice(idx, 1);
  return true;
}
