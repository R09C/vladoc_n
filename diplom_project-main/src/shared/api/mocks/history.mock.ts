/**
 * Mock API — История изменений (600 записей, только чтение)
 */

import type {
  ChangeHistory,
  ChangeHistoryFilters,
} from "@/entities/change-history";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { store, delay, queryList } from "./_store";

export async function getChangeHistoryListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
  filters?: ChangeHistoryFilters,
): Promise<InfiniteScrollResponse<ChangeHistory>> {
  await delay(250);

  let items = [...store.changeHistory];

  // Дополнительные фильтры по дате
  if (filters?.date_from) {
    const from = new Date(filters.date_from).getTime();
    items = items.filter((h) => new Date(h.timestamp).getTime() >= from);
  }
  if (filters?.date_to) {
    const to = new Date(filters.date_to).getTime();
    items = items.filter((h) => new Date(h.timestamp).getTime() <= to);
  }

  // Остальные фильтры через queryList
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { date_from: _df, date_to: _dt, ...restFilters } = filters ?? {};

  return queryList(items, {
    offset,
    limit,
    sortBy: sortBy ?? "timestamp",
    sortOrder: sortOrder ?? "desc",
    search,
    searchFields: ["content_type", "object_id"],
    filters: restFilters as Record<string, unknown>,
  });
}

export async function getChangeHistoryMock(
  id: string,
): Promise<ChangeHistory | null> {
  await delay(100);
  return store.changeHistory.find((h) => h.id === id) ?? null;
}
