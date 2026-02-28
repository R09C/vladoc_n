/**
 * Virtual Machine — API-хуки (React Query)
 * offset/limit пагинация, infinite scroll, CRUD
 */

import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getVMsListInfiniteMock,
  getVMMock,
  createVMMock,
  updateVMMock,
  deleteVMMock,
} from "@/shared/api/mocks/vm.mock";
import type {
  VirtualMachine,
  CreateVMRequest,
  UpdateVMRequest,
  VMFilters,
} from "@/entities/virtual-machine";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { toast } from "sonner";

// ─── Query Keys ────────────────────────────────────────────────────────────

export const vmKeys = {
  all: ["vms"] as const,
  lists: () => [...vmKeys.all, "list"] as const,
  list: (filters?: VMFilters, search?: string) =>
    [...vmKeys.lists(), { filters, search }] as const,
  details: () => [...vmKeys.all, "detail"] as const,
  detail: (id: string) => [...vmKeys.details(), id] as const,
};

const PAGE_SIZE = 50;

// ─── List (infinite scroll) ────────────────────────────────────────────────

export const useVMsInfiniteList = (
  search?: string,
  filters?: VMFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) => {
  return useInfiniteQuery<InfiniteScrollResponse<VirtualMachine>>({
    queryKey: vmKeys.list(filters, search),
    queryFn: ({ pageParam = 0 }) =>
      getVMsListInfiniteMock(
        pageParam as number,
        PAGE_SIZE,
        sortBy,
        sortOrder,
        search,
        filters,
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.data.length, 0);
      return loaded < lastPage.totalCount ? loaded : undefined;
    },
  });
};

// ─── Detail ────────────────────────────────────────────────────────────────

export const useVM = (id: string | undefined) => {
  return useQuery({
    queryKey: vmKeys.detail(id!),
    queryFn: () => getVMMock(id!),
    enabled: !!id,
  });
};

// ─── Create ────────────────────────────────────────────────────────────────

export const useCreateVM = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVMRequest) => createVMMock(data),
    onSuccess: (newVM) => {
      qc.invalidateQueries({ queryKey: vmKeys.all });
      qc.setQueryData(vmKeys.detail(newVM.id), newVM);
      toast.success("Виртуальная машина создана");
    },
    onError: () => toast.error("Ошибка при создании ВМ"),
  });
};

// ─── Update ────────────────────────────────────────────────────────────────

export const useUpdateVM = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateVMRequest) => updateVMMock(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: vmKeys.all });
      if (updated) qc.setQueryData(vmKeys.detail(id), updated);
      toast.success("Изменения сохранены");
    },
    onError: () => toast.error("Ошибка при сохранении"),
  });
};

// ─── Delete ────────────────────────────────────────────────────────────────

export const useDeleteVM = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVMMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: vmKeys.all });
      qc.removeQueries({ queryKey: vmKeys.detail(id) });
      toast.success("Виртуальная машина удалена");
    },
    onError: () => toast.error("Ошибка при удалении ВМ"),
  });
};

// ─── Bulk Delete ───────────────────────────────────────────────────────────

export const useBulkDeleteVMs = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => deleteVMMock(id)));
    },
    onSuccess: (_, ids) => {
      qc.invalidateQueries({ queryKey: vmKeys.all });
      ids.forEach((id) => qc.removeQueries({ queryKey: vmKeys.detail(id) }));
      toast.success(`Удалено ВМ: ${ids.length}`);
    },
    onError: () => toast.error("Ошибка при удалении ВМ"),
  });
};
