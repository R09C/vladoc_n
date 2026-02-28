/**
 * CEPH (Resources, Folders, Users, FolderAccess) — API-хуки (React Query)
 */

import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getCephResourcesListMock,
  getCephResourceMock,
  createCephResourceMock,
  updateCephResourceMock,
  deleteCephResourceMock,
  getCephFoldersListMock,
  getCephFolderMock,
  createCephFolderMock,
  updateCephFolderMock,
  deleteCephFolderMock,
  getCephUsersListMock,
  getCephUserMock,
  createCephUserMock,
  updateCephUserMock,
  deleteCephUserMock,
  getCephFolderAccessListMock,
  getCephFolderAccessMock,
  createCephFolderAccessMock,
  updateCephFolderAccessMock,
  deleteCephFolderAccessMock,
} from "@/shared/api/mocks/ceph.mock";
import type {
  CephResource,
  CephFolder,
  CephUser,
  CephFolderAccess,
  CreateCephResourceRequest,
  UpdateCephResourceRequest,
  CreateCephFolderRequest,
  UpdateCephFolderRequest,
  CreateCephUserRequest,
  UpdateCephUserRequest,
  CreateCephFolderAccessRequest,
  UpdateCephFolderAccessRequest,
  CephResourceFilters,
  CephFolderFilters,
  CephUserFilters,
  CephFolderAccessFilters,
} from "@/entities/ceph";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { toast } from "sonner";

const PAGE_SIZE = 50;

// ─── CEPH Resource ─────────────────────────────────────────────────────────

export const cephResourceKeys = {
  all: ["cephResources"] as const,
  lists: () => [...cephResourceKeys.all, "list"] as const,
  list: (f?: CephResourceFilters, s?: string) =>
    [...cephResourceKeys.lists(), { f, s }] as const,
  details: () => [...cephResourceKeys.all, "detail"] as const,
  detail: (id: string) => [...cephResourceKeys.details(), id] as const,
};

export const useCephResourcesInfiniteList = (
  search?: string,
  filters?: CephResourceFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<CephResource>>({
    queryKey: cephResourceKeys.list(filters, search),
    queryFn: ({ pageParam = 0 }) =>
      getCephResourcesListMock(
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

export const useCephResource = (id: string | undefined) =>
  useQuery({
    queryKey: cephResourceKeys.detail(id!),
    queryFn: () => getCephResourceMock(id!),
    enabled: !!id,
  });

export const useCreateCephResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCephResourceRequest) =>
      createCephResourceMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: cephResourceKeys.lists() });
      qc.setQueryData(cephResourceKeys.detail(item.id), item);
      toast.success("Ресурс CEPH создан");
    },
    onError: () => toast.error("Ошибка при создании ресурса CEPH"),
  });
};

export const useUpdateCephResource = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCephResourceRequest) =>
      updateCephResourceMock(id, data),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: cephResourceKeys.lists() });
      if (u) qc.setQueryData(cephResourceKeys.detail(id), u);
      toast.success("Ресурс CEPH обновлён");
    },
    onError: () => toast.error("Ошибка при обновлении ресурса CEPH"),
  });
};

export const useDeleteCephResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCephResourceMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: cephResourceKeys.lists() });
      qc.removeQueries({ queryKey: cephResourceKeys.detail(id) });
      toast.success("Ресурс CEPH удалён");
    },
    onError: () => toast.error("Ошибка при удалении ресурса CEPH"),
  });
};

// ─── CEPH Folder ───────────────────────────────────────────────────────────

export const cephFolderKeys = {
  all: ["cephFolders"] as const,
  lists: () => [...cephFolderKeys.all, "list"] as const,
  list: (f?: CephFolderFilters, s?: string) =>
    [...cephFolderKeys.lists(), { f, s }] as const,
  details: () => [...cephFolderKeys.all, "detail"] as const,
  detail: (id: string) => [...cephFolderKeys.details(), id] as const,
};

export const useCephFoldersInfiniteList = (
  search?: string,
  filters?: CephFolderFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<CephFolder>>({
    queryKey: cephFolderKeys.list(filters, search),
    queryFn: ({ pageParam = 0 }) =>
      getCephFoldersListMock(
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

export const useCephFolder = (id: string | undefined) =>
  useQuery({
    queryKey: cephFolderKeys.detail(id!),
    queryFn: () => getCephFolderMock(id!),
    enabled: !!id,
  });

export const useCreateCephFolder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCephFolderRequest) => createCephFolderMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: cephFolderKeys.lists() });
      qc.setQueryData(cephFolderKeys.detail(item.id), item);
      toast.success("Папка CEPH создана");
    },
    onError: () => toast.error("Ошибка при создании папки CEPH"),
  });
};

export const useUpdateCephFolder = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCephFolderRequest) =>
      updateCephFolderMock(id, data),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: cephFolderKeys.lists() });
      if (u) qc.setQueryData(cephFolderKeys.detail(id), u);
      toast.success("Папка CEPH обновлена");
    },
    onError: () => toast.error("Ошибка при обновлении папки CEPH"),
  });
};

export const useDeleteCephFolder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCephFolderMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: cephFolderKeys.lists() });
      qc.removeQueries({ queryKey: cephFolderKeys.detail(id) });
      toast.success("Папка CEPH удалена");
    },
    onError: () => toast.error("Ошибка при удалении папки CEPH"),
  });
};

// ─── CEPH User ─────────────────────────────────────────────────────────────

export const cephUserKeys = {
  all: ["cephUsers"] as const,
  lists: () => [...cephUserKeys.all, "list"] as const,
  list: (f?: CephUserFilters, s?: string) =>
    [...cephUserKeys.lists(), { f, s }] as const,
  details: () => [...cephUserKeys.all, "detail"] as const,
  detail: (id: string) => [...cephUserKeys.details(), id] as const,
};

export const useCephUsersInfiniteList = (
  search?: string,
  filters?: CephUserFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<CephUser>>({
    queryKey: cephUserKeys.list(filters, search),
    queryFn: ({ pageParam = 0 }) =>
      getCephUsersListMock(
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

export const useCephUser = (id: string | undefined) =>
  useQuery({
    queryKey: cephUserKeys.detail(id!),
    queryFn: () => getCephUserMock(id!),
    enabled: !!id,
  });

export const useCreateCephUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCephUserRequest) => createCephUserMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: cephUserKeys.lists() });
      qc.setQueryData(cephUserKeys.detail(item.id), item);
      toast.success("Пользователь CEPH создан");
    },
    onError: () => toast.error("Ошибка при создании пользователя CEPH"),
  });
};

export const useUpdateCephUser = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCephUserRequest) => updateCephUserMock(id, data),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: cephUserKeys.lists() });
      if (u) qc.setQueryData(cephUserKeys.detail(id), u);
      toast.success("Пользователь CEPH обновлён");
    },
    onError: () => toast.error("Ошибка при обновлении пользователя CEPH"),
  });
};

export const useDeleteCephUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCephUserMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: cephUserKeys.lists() });
      qc.removeQueries({ queryKey: cephUserKeys.detail(id) });
      toast.success("Пользователь CEPH удалён");
    },
    onError: () => toast.error("Ошибка при удалении пользователя CEPH"),
  });
};

// ─── CEPH Folder Access ────────────────────────────────────────────────────

export const cephAccessKeys = {
  all: ["cephFolderAccess"] as const,
  lists: () => [...cephAccessKeys.all, "list"] as const,
  list: (f?: CephFolderAccessFilters) =>
    [...cephAccessKeys.lists(), { f }] as const,
  details: () => [...cephAccessKeys.all, "detail"] as const,
  detail: (id: string) => [...cephAccessKeys.details(), id] as const,
};

export const useCephFolderAccessInfiniteList = (
  filters?: CephFolderAccessFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<CephFolderAccess>>({
    queryKey: cephAccessKeys.list(filters),
    queryFn: ({ pageParam = 0 }) =>
      getCephFolderAccessListMock(
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

export const useCephFolderAccess = (id: string | undefined) =>
  useQuery({
    queryKey: cephAccessKeys.detail(id!),
    queryFn: () => getCephFolderAccessMock(id!),
    enabled: !!id,
  });

export const useCreateCephFolderAccess = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCephFolderAccessRequest) =>
      createCephFolderAccessMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: cephAccessKeys.lists() });
      qc.setQueryData(cephAccessKeys.detail(item.id), item);
      toast.success("Доступ к папке CEPH создан");
    },
    onError: () => toast.error("Ошибка при создании доступа к папке CEPH"),
  });
};

export const useUpdateCephFolderAccess = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCephFolderAccessRequest) =>
      updateCephFolderAccessMock(id, data),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: cephAccessKeys.lists() });
      if (u) qc.setQueryData(cephAccessKeys.detail(id), u);
      toast.success("Доступ к папке обновлён");
    },
    onError: () => toast.error("Ошибка при обновлении доступа к папке"),
  });
};

export const useDeleteCephFolderAccess = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCephFolderAccessMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: cephAccessKeys.lists() });
      qc.removeQueries({ queryKey: cephAccessKeys.detail(id) });
      toast.success("Доступ к папке удалён");
    },
    onError: () => toast.error("Ошибка при удалении доступа к папке"),
  });
};
