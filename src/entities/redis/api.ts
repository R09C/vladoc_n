/**
 * Redis (Resources & DBs) — API-хуки (React Query)
 */

import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getRedisResourcesListMock,
  getRedisResourceMock,
  createRedisResourceMock,
  updateRedisResourceMock,
  deleteRedisResourceMock,
  getRedisDBsListMock,
  getRedisDBMock,
  createRedisDBMock,
  updateRedisDBMock,
  deleteRedisDBMock,
} from "@/shared/api/mocks/redis.mock";
import type {
  RedisResource,
  RedisDB,
  CreateRedisResourceRequest,
  UpdateRedisResourceRequest,
  CreateRedisDBRequest,
  UpdateRedisDBRequest,
  RedisResourceFilters,
  RedisDBFilters,
} from "@/entities/redis";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { toast } from "sonner";

const PAGE_SIZE = 50;

// ─── Redis Resource ────────────────────────────────────────────────────────

export const redisResourceKeys = {
  all: ["redisResources"] as const,
  lists: () => [...redisResourceKeys.all, "list"] as const,
  list: (f?: RedisResourceFilters, s?: string) =>
    [...redisResourceKeys.lists(), { f, s }] as const,
  details: () => [...redisResourceKeys.all, "detail"] as const,
  detail: (id: string) => [...redisResourceKeys.details(), id] as const,
};

export const useRedisResourcesInfiniteList = (
  search?: string,
  filters?: RedisResourceFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<RedisResource>>({
    queryKey: redisResourceKeys.list(filters, search),
    queryFn: ({ pageParam = 0 }) =>
      getRedisResourcesListMock(
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

export const useRedisResource = (id: string | undefined) =>
  useQuery({
    queryKey: redisResourceKeys.detail(id!),
    queryFn: () => getRedisResourceMock(id!),
    enabled: !!id,
  });

export const useCreateRedisResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRedisResourceRequest) =>
      createRedisResourceMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: redisResourceKeys.lists() });
      qc.setQueryData(redisResourceKeys.detail(item.id), item);
      toast.success("Ресурс Redis создан");
    },
    onError: () => toast.error("Ошибка при создании ресурса Redis"),
  });
};

export const useUpdateRedisResource = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateRedisResourceRequest) =>
      updateRedisResourceMock(id, data),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: redisResourceKeys.lists() });
      if (u) qc.setQueryData(redisResourceKeys.detail(id), u);
      toast.success("Ресурс Redis обновлён");
    },
    onError: () => toast.error("Ошибка при обновлении ресурса Redis"),
  });
};

export const useDeleteRedisResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRedisResourceMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: redisResourceKeys.lists() });
      qc.removeQueries({ queryKey: redisResourceKeys.detail(id) });
      toast.success("Ресурс Redis удалён");
    },
    onError: () => toast.error("Ошибка при удалении ресурса Redis"),
  });
};

// ─── Redis DB ──────────────────────────────────────────────────────────────

export const redisDBKeys = {
  all: ["redisDBs"] as const,
  lists: () => [...redisDBKeys.all, "list"] as const,
  list: (f?: RedisDBFilters, s?: string) =>
    [...redisDBKeys.lists(), { f, s }] as const,
  details: () => [...redisDBKeys.all, "detail"] as const,
  detail: (id: string) => [...redisDBKeys.details(), id] as const,
};

export const useRedisDBsInfiniteList = (
  search?: string,
  filters?: RedisDBFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<RedisDB>>({
    queryKey: redisDBKeys.list(filters, search),
    queryFn: ({ pageParam = 0 }) =>
      getRedisDBsListMock(
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

export const useRedisDB = (id: string | undefined) =>
  useQuery({
    queryKey: redisDBKeys.detail(id!),
    queryFn: () => getRedisDBMock(id!),
    enabled: !!id,
  });

export const useCreateRedisDB = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRedisDBRequest) => createRedisDBMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: redisDBKeys.lists() });
      qc.setQueryData(redisDBKeys.detail(item.id), item);
      toast.success("БД Redis создана");
    },
    onError: () => toast.error("Ошибка при создании БД Redis"),
  });
};

export const useUpdateRedisDB = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateRedisDBRequest) => updateRedisDBMock(id, data),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: redisDBKeys.lists() });
      if (u) qc.setQueryData(redisDBKeys.detail(id), u);
      toast.success("БД Redis обновлена");
    },
    onError: () => toast.error("Ошибка при обновлении БД Redis"),
  });
};

export const useDeleteRedisDB = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRedisDBMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: redisDBKeys.lists() });
      qc.removeQueries({ queryKey: redisDBKeys.detail(id) });
      toast.success("БД Redis удалена");
    },
    onError: () => toast.error("Ошибка при удалении БД Redis"),
  });
};
