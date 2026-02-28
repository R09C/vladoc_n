/**
 * Balancer (Groups & Resources) — API-хуки (React Query)
 */

import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getBalancerGroupsListMock,
  getBalancerGroupMock,
  createBalancerGroupMock,
  updateBalancerGroupMock,
  deleteBalancerGroupMock,
  getBalancerResourcesListMock,
  getBalancerResourceMock,
  createBalancerResourceMock,
  updateBalancerResourceMock,
  deleteBalancerResourceMock,
} from "@/shared/api/mocks/balancer.mock";
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
import { toast } from "sonner";

const PAGE_SIZE = 50;

// ─── Balancer Group ────────────────────────────────────────────────────────

export const balancerGroupKeys = {
  all: ["balancerGroups"] as const,
  lists: () => [...balancerGroupKeys.all, "list"] as const,
  list: (f?: BalancerGroupFilters) =>
    [...balancerGroupKeys.lists(), { f }] as const,
  details: () => [...balancerGroupKeys.all, "detail"] as const,
  detail: (id: string) => [...balancerGroupKeys.details(), id] as const,
};

export const useBalancerGroupsInfiniteList = (
  filters?: BalancerGroupFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<BalancerGroup>>({
    queryKey: balancerGroupKeys.list(filters),
    queryFn: ({ pageParam = 0 }) =>
      getBalancerGroupsListMock(
        pageParam as number,
        PAGE_SIZE,
        sortBy,
        sortOrder,
        undefined,
        filters,
      ),
    initialPageParam: 0,
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((s, p) => s + p.data.length, 0);
      return loaded < last.totalCount ? loaded : undefined;
    },
  });

export const useBalancerGroup = (id: string | undefined) =>
  useQuery({
    queryKey: balancerGroupKeys.detail(id!),
    queryFn: () => getBalancerGroupMock(id!),
    enabled: !!id,
  });

export const useCreateBalancerGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBalancerGroupRequest) =>
      createBalancerGroupMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: balancerGroupKeys.lists() });
      qc.setQueryData(balancerGroupKeys.detail(item.id), item);
      toast.success("Группа балансировки создана");
    },
    onError: () => toast.error("Ошибка при создании группы балансировки"),
  });
};

export const useUpdateBalancerGroup = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBalancerGroupRequest) =>
      updateBalancerGroupMock(id, data),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: balancerGroupKeys.lists() });
      if (u) qc.setQueryData(balancerGroupKeys.detail(id), u);
      toast.success("Группа балансировки обновлена");
    },
    onError: () => toast.error("Ошибка при обновлении группы балансировки"),
  });
};

export const useDeleteBalancerGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBalancerGroupMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: balancerGroupKeys.lists() });
      qc.removeQueries({ queryKey: balancerGroupKeys.detail(id) });
      toast.success("Группа балансировки удалена");
    },
    onError: () => toast.error("Ошибка при удалении группы балансировки"),
  });
};

// ─── Balancer Resource ─────────────────────────────────────────────────────

export const balancerResourceKeys = {
  all: ["balancerResources"] as const,
  lists: () => [...balancerResourceKeys.all, "list"] as const,
  list: (f?: BalancerResourceFilters, s?: string) =>
    [...balancerResourceKeys.lists(), { f, s }] as const,
  details: () => [...balancerResourceKeys.all, "detail"] as const,
  detail: (id: string) => [...balancerResourceKeys.details(), id] as const,
};

export const useBalancerResourcesInfiniteList = (
  search?: string,
  filters?: BalancerResourceFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<BalancerResource>>({
    queryKey: balancerResourceKeys.list(filters, search),
    queryFn: ({ pageParam = 0 }) =>
      getBalancerResourcesListMock(
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

export const useBalancerResource = (id: string | undefined) =>
  useQuery({
    queryKey: balancerResourceKeys.detail(id!),
    queryFn: () => getBalancerResourceMock(id!),
    enabled: !!id,
  });

export const useCreateBalancerResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBalancerResourceRequest) =>
      createBalancerResourceMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: balancerResourceKeys.lists() });
      qc.setQueryData(balancerResourceKeys.detail(item.id), item);
      toast.success("Ресурс балансировщика создан");
    },
    onError: () => toast.error("Ошибка при создании ресурса балансировщика"),
  });
};

export const useUpdateBalancerResource = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBalancerResourceRequest) =>
      updateBalancerResourceMock(id, data),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: balancerResourceKeys.lists() });
      if (u) qc.setQueryData(balancerResourceKeys.detail(id), u);
      toast.success("Ресурс балансировщика обновлён");
    },
    onError: () => toast.error("Ошибка при обновлении ресурса балансировщика"),
  });
};

export const useDeleteBalancerResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBalancerResourceMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: balancerResourceKeys.lists() });
      qc.removeQueries({ queryKey: balancerResourceKeys.detail(id) });
      toast.success("Ресурс балансировщика удалён");
    },
    onError: () => toast.error("Ошибка при удалении ресурса балансировщика"),
  });
};
