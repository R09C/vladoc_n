/**
 * Mock API — Виртуальные машины (600 записей)
 * Поддержка offset/limit пагинации, сортировки, поиска, фильтрации
 */

import type {
  VirtualMachine,
  CreateVMRequest,
  UpdateVMRequest,
  VMFilters,
} from "@/entities/virtual-machine";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { store, delay, queryList } from "./_store";

const SEARCH_FIELDS = ["name", "description"];

/** Список ВМ с пагинацией, сортировкой, поиском, фильтрацией */
export async function getVMsListInfiniteMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
  filters?: VMFilters,
): Promise<InfiniteScrollResponse<VirtualMachine>> {
  await delay(250);
  return queryList(store.virtualMachines, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: SEARCH_FIELDS,
    filters: filters as Record<string, unknown>,
  });
}

/** Получить ВМ по ID */
export async function getVMMock(id: string): Promise<VirtualMachine | null> {
  await delay(150);
  return store.virtualMachines.find((v) => v.id === id) ?? null;
}

/** Создать ВМ */
export async function createVMMock(
  data: CreateVMRequest,
): Promise<VirtualMachine> {
  await delay(400);
  const now = new Date().toISOString();
  const vm: VirtualMachine = {
    id: `vm-${String(store.virtualMachines.length + 1).padStart(3, "0")}`,
    name: data.name,
    description: data.description ?? "",
    is_closed_circuit: data.is_closed_circuit ?? false,
    is_active: false,
    activation_date: null,
    is_deleted: false,
    deletion_date: null,
    dns_group_id: data.dns_group_id ?? null,
    gateway_id: data.gateway_id ?? null,
    swap_size: data.swap_size,
    rem_size: data.rem_size,
    ram_size: data.ram_size,
    cpu_count: data.cpu_count,
    os_id: data.os_id ?? null,
    created_at: now,
    updated_at: now,
  };
  store.virtualMachines.push(vm);
  return vm;
}

/** Обновить ВМ */
export async function updateVMMock(
  id: string,
  data: UpdateVMRequest,
): Promise<VirtualMachine | null> {
  await delay(300);
  const idx = store.virtualMachines.findIndex((v) => v.id === id);
  if (idx === -1) return null;
  const updated = {
    ...store.virtualMachines[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  store.virtualMachines[idx] = updated;
  return updated;
}

/** Удалить ВМ (soft delete) */
export async function deleteVMMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.virtualMachines.findIndex((v) => v.id === id);
  if (idx === -1) return false;
  store.virtualMachines[idx] = {
    ...store.virtualMachines[idx],
    is_deleted: true,
    is_active: false,
    deletion_date: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return true;
}
