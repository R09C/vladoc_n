/**
 * AlternativeClient — API-хуки (React Query)
 */

import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getAltClientsListMock,
  getAltClientMock,
  createAltClientMock,
  updateAltClientMock,
  deleteAltClientMock,
} from "@/shared/api/mocks/alt-client.mock";
import type {
  AlternativeClient,
  CreateAlternativeClientRequest,
  UpdateAlternativeClientRequest,
  AlternativeClientFilters,
} from "@/entities/alternative-client";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { toast } from "sonner";

export const altClientKeys = {
  all: ["alternativeClients"] as const,
  lists: () => [...altClientKeys.all, "list"] as const,
  list: (f?: AlternativeClientFilters, s?: string) =>
    [...altClientKeys.lists(), { f, s }] as const,
  details: () => [...altClientKeys.all, "detail"] as const,
  detail: (id: string) => [...altClientKeys.details(), id] as const,
};

const PAGE_SIZE = 50;

export const useAltClientsInfiniteList = (
  search?: string,
  filters?: AlternativeClientFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<AlternativeClient>>({
    queryKey: altClientKeys.list(filters, search),
    queryFn: ({ pageParam = 0 }) =>
      getAltClientsListMock(
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

export const useAltClient = (id: string | undefined) =>
  useQuery({
    queryKey: altClientKeys.detail(id!),
    queryFn: () => getAltClientMock(id!),
    enabled: !!id,
  });

export const useCreateAltClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAlternativeClientRequest) =>
      createAltClientMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: altClientKeys.lists() });
      qc.setQueryData(altClientKeys.detail(item.id), item);
      toast.success("Альтернативный клиент создан");
    },
    onError: () => toast.error("Ошибка при создании альтернативного клиента"),
  });
};

export const useUpdateAltClient = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAlternativeClientRequest) =>
      updateAltClientMock(id, data),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: altClientKeys.lists() });
      if (u) qc.setQueryData(altClientKeys.detail(id), u);
      toast.success("Альтернативный клиент обновлён");
    },
    onError: () => toast.error("Ошибка при обновлении альтернативного клиента"),
  });
};

export const useDeleteAltClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAltClientMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: altClientKeys.lists() });
      qc.removeQueries({ queryKey: altClientKeys.detail(id) });
      toast.success("Альтернативный клиент удалён");
    },
    onError: () => toast.error("Ошибка при удалении альтернативного клиента"),
  });
};
