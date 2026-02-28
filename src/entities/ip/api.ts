/**
 * IP Pool & IP — API-хуки (React Query)
 */

import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getIPPoolsListMock,
  getIPPoolMock,
  createIPPoolMock,
  updateIPPoolMock,
  deleteIPPoolMock,
  getIPsListMock,
  getIPMock,
  createIPMock,
  updateIPMock,
  deleteIPMock,
} from "@/shared/api/mocks/ip.mock";
import type {
  IPPool,
  IP,
  CreateIPPoolRequest,
  UpdateIPPoolRequest,
  CreateIPRequest,
  UpdateIPRequest,
  IPFilters,
} from "@/entities/ip";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { toast } from "sonner";

const PAGE_SIZE = 50;

// ─── IP Pool Keys & Hooks ──────────────────────────────────────────────────

export const ipPoolKeys = {
  all: ["ipPools"] as const,
  lists: () => [...ipPoolKeys.all, "list"] as const,
  list: (search?: string) => [...ipPoolKeys.lists(), { search }] as const,
  details: () => [...ipPoolKeys.all, "detail"] as const,
  detail: (id: string) => [...ipPoolKeys.details(), id] as const,
};

export const useIPPoolsInfiniteList = (
  search?: string,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<IPPool>>({
    queryKey: ipPoolKeys.list(search),
    queryFn: ({ pageParam = 0 }) =>
      getIPPoolsListMock(
        pageParam as number,
        PAGE_SIZE,
        sortBy,
        sortOrder,
        search,
      ),
    initialPageParam: 0,
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((s, p) => s + p.data.length, 0);
      return loaded < last.totalCount ? loaded : undefined;
    },
  });

export const useIPPool = (id: string | undefined) =>
  useQuery({
    queryKey: ipPoolKeys.detail(id!),
    queryFn: () => getIPPoolMock(id!),
    enabled: !!id,
  });

export const useCreateIPPool = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIPPoolRequest) => createIPPoolMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: ipPoolKeys.lists() });
      qc.setQueryData(ipPoolKeys.detail(item.id), item);
      toast.success("IP-пул создан");
    },
    onError: () => toast.error("Ошибка при создании IP-пула"),
  });
};

export const useUpdateIPPool = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateIPPoolRequest) => updateIPPoolMock(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ipPoolKeys.lists() });
      if (updated) qc.setQueryData(ipPoolKeys.detail(id), updated);
      toast.success("IP-пул обновлён");
    },
    onError: () => toast.error("Ошибка при обновлении IP-пула"),
  });
};

export const useDeleteIPPool = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIPPoolMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ipPoolKeys.lists() });
      qc.removeQueries({ queryKey: ipPoolKeys.detail(id) });
      toast.success("IP-пул удалён");
    },
    onError: () => toast.error("Ошибка при удалении IP-пула"),
  });
};

// ─── IP Keys & Hooks ───────────────────────────────────────────────────────

export const ipKeys = {
  all: ["ips"] as const,
  lists: () => [...ipKeys.all, "list"] as const,
  list: (filters?: IPFilters, search?: string) =>
    [...ipKeys.lists(), { filters, search }] as const,
  details: () => [...ipKeys.all, "detail"] as const,
  detail: (id: string) => [...ipKeys.details(), id] as const,
};

export const useIPsInfiniteList = (
  search?: string,
  filters?: IPFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<IP>>({
    queryKey: ipKeys.list(filters, search),
    queryFn: ({ pageParam = 0 }) =>
      getIPsListMock(
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

export const useIP = (id: string | undefined) =>
  useQuery({
    queryKey: ipKeys.detail(id!),
    queryFn: () => getIPMock(id!),
    enabled: !!id,
  });

export const useCreateIP = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIPRequest) => createIPMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: ipKeys.lists() });
      qc.setQueryData(ipKeys.detail(item.id), item);
      toast.success("IP-адрес создан");
    },
    onError: () => toast.error("Ошибка при создании IP-адреса"),
  });
};

export const useUpdateIP = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateIPRequest) => updateIPMock(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ipKeys.lists() });
      if (updated) qc.setQueryData(ipKeys.detail(id), updated);
      toast.success("IP-адрес обновлён");
    },
    onError: () => toast.error("Ошибка при обновлении IP-адреса"),
  });
};

export const useDeleteIP = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIPMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ipKeys.lists() });
      qc.removeQueries({ queryKey: ipKeys.detail(id) });
      toast.success("IP-адрес удалён");
    },
    onError: () => toast.error("Ошибка при удалении IP-адреса"),
  });
};
