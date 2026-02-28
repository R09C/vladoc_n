/**
 * Role & Permission — API-хуки (React Query)
 */

import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getRolesListMock,
  getRoleMock,
  createRoleMock,
  updateRoleMock,
  deleteRoleMock,
  getPermissionsListMock,
  getPermissionMock,
  createPermissionMock,
  updatePermissionMock,
  deletePermissionMock,
} from "@/shared/api/mocks/role.mock";
import type {
  Role,
  Permission,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  RoleFilters,
  PermissionFilters,
} from "@/entities/role";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { toast } from "sonner";

const PAGE_SIZE = 50;

// ─── Role ──────────────────────────────────────────────────────────────────

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (f?: RoleFilters, s?: string) =>
    [...roleKeys.lists(), { f, s }] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
};

export const useRolesInfiniteList = (
  search?: string,
  filters?: RoleFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<Role>>({
    queryKey: roleKeys.list(filters, search),
    queryFn: ({ pageParam = 0 }) =>
      getRolesListMock(
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

export const useRole = (id: string | undefined) =>
  useQuery({
    queryKey: roleKeys.detail(id!),
    queryFn: () => getRoleMock(id!),
    enabled: !!id,
  });

export const useCreateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleRequest) => createRoleMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: roleKeys.lists() });
      qc.setQueryData(roleKeys.detail(item.id), item);
      toast.success("Роль создана");
    },
    onError: () => toast.error("Ошибка при создании роли"),
  });
};

export const useUpdateRole = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateRoleRequest) => updateRoleMock(id, data),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: roleKeys.lists() });
      if (u) qc.setQueryData(roleKeys.detail(id), u);
      toast.success("Роль обновлена");
    },
    onError: () => toast.error("Ошибка при обновлении роли"),
  });
};

export const useDeleteRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRoleMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: roleKeys.lists() });
      qc.removeQueries({ queryKey: roleKeys.detail(id) });
      toast.success("Роль удалена");
    },
    onError: () => toast.error("Ошибка при удалении роли"),
  });
};

// ─── Permission ────────────────────────────────────────────────────────────

export const permissionKeys = {
  all: ["permissions"] as const,
  lists: () => [...permissionKeys.all, "list"] as const,
  list: (f?: PermissionFilters) => [...permissionKeys.lists(), { f }] as const,
  details: () => [...permissionKeys.all, "detail"] as const,
  detail: (id: string) => [...permissionKeys.details(), id] as const,
};

export const usePermissionsInfiniteList = (
  filters?: PermissionFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<Permission>>({
    queryKey: permissionKeys.list(filters),
    queryFn: ({ pageParam = 0 }) =>
      getPermissionsListMock(
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

export const usePermission = (id: string | undefined) =>
  useQuery({
    queryKey: permissionKeys.detail(id!),
    queryFn: () => getPermissionMock(id!),
    enabled: !!id,
  });

export const useCreatePermission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePermissionRequest) => createPermissionMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: permissionKeys.lists() });
      qc.setQueryData(permissionKeys.detail(item.id), item);
      toast.success("Право доступа создано");
    },
    onError: () => toast.error("Ошибка при создании права доступа"),
  });
};

export const useUpdatePermission = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePermissionRequest) =>
      updatePermissionMock(id, data),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: permissionKeys.lists() });
      if (u) qc.setQueryData(permissionKeys.detail(id), u);
      toast.success("Право доступа обновлено");
    },
    onError: () => toast.error("Ошибка при обновлении права доступа"),
  });
};

export const useDeletePermission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePermissionMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: permissionKeys.lists() });
      qc.removeQueries({ queryKey: permissionKeys.detail(id) });
      toast.success("Право доступа удалено");
    },
    onError: () => toast.error("Ошибка при удалении права доступа"),
  });
};
