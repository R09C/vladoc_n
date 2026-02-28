/**
 * ChangeHistory — API-хуки (React Query, только чтение)
 */

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getChangeHistoryListMock,
  getChangeHistoryMock,
} from "@/shared/api/mocks/history.mock";
import type {
  ChangeHistory,
  ChangeHistoryFilters,
} from "@/entities/change-history";
import type { InfiniteScrollResponse } from "@/shared/api/types";

export const changeHistoryKeys = {
  all: ["changeHistory"] as const,
  lists: () => [...changeHistoryKeys.all, "list"] as const,
  list: (f?: ChangeHistoryFilters, s?: string) =>
    [...changeHistoryKeys.lists(), { f, s }] as const,
  details: () => [...changeHistoryKeys.all, "detail"] as const,
  detail: (id: string) => [...changeHistoryKeys.details(), id] as const,
};

const PAGE_SIZE = 50;

export const useChangeHistoryInfiniteList = (
  search?: string,
  filters?: ChangeHistoryFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<ChangeHistory>>({
    queryKey: changeHistoryKeys.list(filters, search),
    queryFn: ({ pageParam = 0 }) =>
      getChangeHistoryListMock(
        pageParam as number,
        PAGE_SIZE,
        sortBy,
        sortOrder,
        search,
        filters,
      ),
    initialPageParam: 0,
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((s, p) => s + p.data.length, 0);
      return loaded < last.totalCount ? loaded : undefined;
    },
  });

export const useChangeHistory = (id: string | undefined) =>
  useQuery({
    queryKey: changeHistoryKeys.detail(id!),
    queryFn: () => getChangeHistoryMock(id!),
    enabled: !!id,
  });
