/**
 * DNS Resource — API-хуки (React Query)
 */

import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getDNSListMock,
  getDNSMock,
  createDNSMock,
  updateDNSMock,
  deleteDNSMock,
} from "@/shared/api/mocks/dns.mock";
import type {
  DNSResource,
  CreateDNSResourceRequest,
  UpdateDNSResourceRequest,
  DNSResourceFilters,
} from "@/entities/dns";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { toast } from "sonner";

export const dnsKeys = {
  all: ["dns"] as const,
  lists: () => [...dnsKeys.all, "list"] as const,
  list: (filters?: DNSResourceFilters, search?: string) =>
    [...dnsKeys.lists(), { filters, search }] as const,
  details: () => [...dnsKeys.all, "detail"] as const,
  detail: (id: string) => [...dnsKeys.details(), id] as const,
};

const PAGE_SIZE = 50;

export const useDNSInfiniteList = (
  search?: string,
  filters?: DNSResourceFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<DNSResource>>({
    queryKey: dnsKeys.list(filters, search),
    queryFn: ({ pageParam = 0 }) =>
      getDNSListMock(
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

export const useDNS = (id: string | undefined) =>
  useQuery({
    queryKey: dnsKeys.detail(id!),
    queryFn: () => getDNSMock(id!),
    enabled: !!id,
  });

export const useCreateDNS = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDNSResourceRequest) => createDNSMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: dnsKeys.lists() });
      qc.setQueryData(dnsKeys.detail(item.id), item);
      toast.success("DNS-ресурс создан");
    },
    onError: () => toast.error("Ошибка при создании DNS-ресурса"),
  });
};

export const useUpdateDNS = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDNSResourceRequest) => updateDNSMock(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: dnsKeys.lists() });
      if (updated) qc.setQueryData(dnsKeys.detail(id), updated);
      toast.success("DNS-ресурс обновлён");
    },
    onError: () => toast.error("Ошибка при обновлении DNS-ресурса"),
  });
};

export const useDeleteDNS = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDNSMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: dnsKeys.lists() });
      qc.removeQueries({ queryKey: dnsKeys.detail(id) });
      toast.success("DNS-ресурс удалён");
    },
    onError: () => toast.error("Ошибка при удалении DNS-ресурса"),
  });
};
