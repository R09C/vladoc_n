/**
 * Mock API — Группы объектов (40 записей, по 6-8 на тип)
 */

import type {
  ObjectGroup,
  CreateObjectGroupRequest,
  UpdateObjectGroupRequest,
  ObjectGroupFilters,
} from "@/entities/object-group";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { GROUP_NAME_PREFIX } from "@/shared/config/enums";
import type { GroupType } from "@/shared/config/enums";
import { store, delay, queryList } from "./_store";

export async function getObjectGroupsListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
  filters?: ObjectGroupFilters,
): Promise<InfiniteScrollResponse<ObjectGroup>> {
  await delay(200);
  return queryList(store.objectGroups, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["name", "description"],
    filters: filters as Record<string, unknown>,
  });
}

/** Возвращает все группы объектов без пагинации (справочник) */
export async function getAllObjectGroupsMock(
  filters?: ObjectGroupFilters,
): Promise<ObjectGroup[]> {
  await delay(100);
  let items = [...store.objectGroups];
  if (filters?.type) {
    items = items.filter((g) => g.type === filters.type);
  }
  return items;
}

export async function getObjectGroupMock(
  id: string,
): Promise<ObjectGroup | null> {
  await delay(100);
  return store.objectGroups.find((g) => g.id === id) ?? null;
}

export async function createObjectGroupMock(
  data: CreateObjectGroupRequest,
): Promise<ObjectGroup> {
  await delay(300);
  const prefix = GROUP_NAME_PREFIX[data.type as GroupType];
  const existing = store.objectGroups.filter((g) => g.type === data.type);
  const nextNum = existing.length + 1;
  const now = new Date().toISOString();
  const group: ObjectGroup = {
    id: `grp-${data.type.toLowerCase()}-${String(nextNum).padStart(2, "0")}`,
    type: data.type,
    name: data.name ?? `${prefix}${String(nextNum).padStart(2, "0")}`,
    description: data.description ?? "",
    repo_url: data.repo_url ?? null,
    created_at: now,
    updated_at: now,
  };
  store.objectGroups.push(group);
  return group;
}

export async function updateObjectGroupMock(
  id: string,
  data: UpdateObjectGroupRequest,
): Promise<ObjectGroup | null> {
  await delay(300);
  const idx = store.objectGroups.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  store.objectGroups[idx] = {
    ...store.objectGroups[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.objectGroups[idx];
}

export async function deleteObjectGroupMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.objectGroups.findIndex((g) => g.id === id);
  if (idx === -1) return false;
  store.objectGroups.splice(idx, 1);
  return true;
}
