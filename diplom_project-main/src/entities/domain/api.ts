/**
 * Domain — API-хуки (React Query)
 */

import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getDomainsListMock,
  getDomainMock,
  createDomainMock,
  updateDomainMock,
  deleteDomainMock,
} from "@/shared/api/mocks/domain.mock";
import type {
  Domain,
  CreateDomainRequest,
  UpdateDomainRequest,
  DomainFilters,
} from "@/entities/domain";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { toast } from "sonner";

export const domainKeys = {
  all: ["domains"] as const,
  lists: () => [...domainKeys.all, "list"] as const,
  list: (f?: DomainFilters, s?: string) =>
    [...domainKeys.lists(), { f, s }] as const,
  details: () => [...domainKeys.all, "detail"] as const,
  detail: (id: string) => [...domainKeys.details(), id] as const,
};

const PAGE_SIZE = 50;

export const useDomainsInfiniteList = (
  search?: string,
  filters?: DomainFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<Domain>>({
    queryKey: domainKeys.list(filters, search),
    queryFn: ({ pageParam = 0 }) =>
      getDomainsListMock(
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

export const useDomain = (id: string | undefined) =>
  useQuery({
    queryKey: domainKeys.detail(id!),
    queryFn: () => getDomainMock(id!),
    enabled: !!id,
  });

export const useCreateDomain = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDomainRequest) => createDomainMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: domainKeys.lists() });
      qc.setQueryData(domainKeys.detail(item.id), item);
      toast.success("Домен создан");
    },
    onError: () => toast.error("Ошибка при создании домена"),
  });
};

export const useUpdateDomain = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDomainRequest) => updateDomainMock(id, data),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: domainKeys.lists() });
      if (u) qc.setQueryData(domainKeys.detail(id), u);
      toast.success("Домен обновлён");
    },
    onError: () => toast.error("Ошибка при обновлении домена"),
  });
};

export const useDeleteDomain = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDomainMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: domainKeys.lists() });
      qc.removeQueries({ queryKey: domainKeys.detail(id) });
      toast.success("Домен удалён");
    },
    onError: () => toast.error("Ошибка при удалении домена"),
  });
};
