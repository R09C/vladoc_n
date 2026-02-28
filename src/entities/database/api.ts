/**
 * Database (DBMS Groups, Resources, Databases, Users) — API-хуки (React Query)
 */

import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getDBMSGroupsListMock,
  getDBMSGroupMock,
  createDBMSGroupMock,
  updateDBMSGroupMock,
  deleteDBMSGroupMock,
  getDBMSResourcesListMock,
  getDBMSResourceMock,
  createDBMSResourceMock,
  updateDBMSResourceMock,
  deleteDBMSResourceMock,
  getDatabasesListMock,
  getDatabaseMock,
  createDatabaseMock,
  updateDatabaseMock,
  deleteDatabaseMock,
  getDatabaseUsersListMock,
  getDatabaseUserMock,
  createDatabaseUserMock,
  updateDatabaseUserMock,
  deleteDatabaseUserMock,
} from "@/shared/api/mocks/database.mock";
import type {
  DBMSGroup,
  DBMSResource,
  Database,
  DatabaseUser,
  CreateDBMSGroupRequest,
  UpdateDBMSGroupRequest,
  CreateDBMSResourceRequest,
  UpdateDBMSResourceRequest,
  CreateDatabaseRequest,
  UpdateDatabaseRequest,
  CreateDatabaseUserRequest,
  UpdateDatabaseUserRequest,
  DBMSGroupFilters,
  DBMSResourceFilters,
  DatabaseFilters,
  DatabaseUserFilters,
} from "@/entities/database";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { toast } from "sonner";

const PAGE_SIZE = 50;

// ─── DBMS Group ────────────────────────────────────────────────────────────

export const dbmsGroupKeys = {
  all: ["dbmsGroups"] as const,
  lists: () => [...dbmsGroupKeys.all, "list"] as const,
  list: (f?: DBMSGroupFilters, s?: string) =>
    [...dbmsGroupKeys.lists(), { f, s }] as const,
  details: () => [...dbmsGroupKeys.all, "detail"] as const,
  detail: (id: string) => [...dbmsGroupKeys.details(), id] as const,
};

export const useDBMSGroupsInfiniteList = (
  search?: string,
  filters?: DBMSGroupFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<DBMSGroup>>({
    queryKey: dbmsGroupKeys.list(filters, search),
    queryFn: ({ pageParam = 0 }) =>
      getDBMSGroupsListMock(
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

export const useDBMSGroup = (id: string | undefined) =>
  useQuery({
    queryKey: dbmsGroupKeys.detail(id!),
    queryFn: () => getDBMSGroupMock(id!),
    enabled: !!id,
  });

export const useCreateDBMSGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDBMSGroupRequest) => createDBMSGroupMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: dbmsGroupKeys.lists() });
      qc.setQueryData(dbmsGroupKeys.detail(item.id), item);
      toast.success("Группа СУБД создана");
    },
    onError: () => toast.error("Ошибка при создании группы СУБД"),
  });
};

export const useUpdateDBMSGroup = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDBMSGroupRequest) => updateDBMSGroupMock(id, data),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: dbmsGroupKeys.lists() });
      if (u) qc.setQueryData(dbmsGroupKeys.detail(id), u);
      toast.success("Группа СУБД обновлена");
    },
    onError: () => toast.error("Ошибка при обновлении группы СУБД"),
  });
};

export const useDeleteDBMSGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDBMSGroupMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: dbmsGroupKeys.lists() });
      qc.removeQueries({ queryKey: dbmsGroupKeys.detail(id) });
      toast.success("Группа СУБД удалена");
    },
    onError: () => toast.error("Ошибка при удалении группы СУБД"),
  });
};

// ─── DBMS Resource ─────────────────────────────────────────────────────────

export const dbmsResourceKeys = {
  all: ["dbmsResources"] as const,
  lists: () => [...dbmsResourceKeys.all, "list"] as const,
  list: (f?: DBMSResourceFilters, s?: string) =>
    [...dbmsResourceKeys.lists(), { f, s }] as const,
  details: () => [...dbmsResourceKeys.all, "detail"] as const,
  detail: (id: string) => [...dbmsResourceKeys.details(), id] as const,
};

export const useDBMSResourcesInfiniteList = (
  search?: string,
  filters?: DBMSResourceFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<DBMSResource>>({
    queryKey: dbmsResourceKeys.list(filters, search),
    queryFn: ({ pageParam = 0 }) =>
      getDBMSResourcesListMock(
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

export const useDBMSResource = (id: string | undefined) =>
  useQuery({
    queryKey: dbmsResourceKeys.detail(id!),
    queryFn: () => getDBMSResourceMock(id!),
    enabled: !!id,
  });

export const useCreateDBMSResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDBMSResourceRequest) =>
      createDBMSResourceMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: dbmsResourceKeys.lists() });
      qc.setQueryData(dbmsResourceKeys.detail(item.id), item);
      toast.success("Ресурс СУБД создан");
    },
    onError: () => toast.error("Ошибка при создании ресурса СУБД"),
  });
};

export const useUpdateDBMSResource = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDBMSResourceRequest) =>
      updateDBMSResourceMock(id, data),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: dbmsResourceKeys.lists() });
      if (u) qc.setQueryData(dbmsResourceKeys.detail(id), u);
      toast.success("Ресурс СУБД обновлён");
    },
    onError: () => toast.error("Ошибка при обновлении ресурса СУБД"),
  });
};

export const useDeleteDBMSResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDBMSResourceMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: dbmsResourceKeys.lists() });
      qc.removeQueries({ queryKey: dbmsResourceKeys.detail(id) });
      toast.success("Ресурс СУБД удалён");
    },
    onError: () => toast.error("Ошибка при удалении ресурса СУБД"),
  });
};

// ─── Database ──────────────────────────────────────────────────────────────

export const databaseKeys = {
  all: ["databases"] as const,
  lists: () => [...databaseKeys.all, "list"] as const,
  list: (f?: DatabaseFilters, s?: string) =>
    [...databaseKeys.lists(), { f, s }] as const,
  details: () => [...databaseKeys.all, "detail"] as const,
  detail: (id: string) => [...databaseKeys.details(), id] as const,
};

export const useDatabasesInfiniteList = (
  search?: string,
  filters?: DatabaseFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<Database>>({
    queryKey: databaseKeys.list(filters, search),
    queryFn: ({ pageParam = 0 }) =>
      getDatabasesListMock(
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

export const useDatabase = (id: string | undefined) =>
  useQuery({
    queryKey: databaseKeys.detail(id!),
    queryFn: () => getDatabaseMock(id!),
    enabled: !!id,
  });

export const useCreateDatabase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDatabaseRequest) => createDatabaseMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: databaseKeys.lists() });
      qc.setQueryData(databaseKeys.detail(item.id), item);
      toast.success("База данных создана");
    },
    onError: () => toast.error("Ошибка при создании базы данных"),
  });
};

export const useUpdateDatabase = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDatabaseRequest) => updateDatabaseMock(id, data),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: databaseKeys.lists() });
      if (u) qc.setQueryData(databaseKeys.detail(id), u);
      toast.success("База данных обновлена");
    },
    onError: () => toast.error("Ошибка при обновлении базы данных"),
  });
};

export const useDeleteDatabase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDatabaseMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: databaseKeys.lists() });
      qc.removeQueries({ queryKey: databaseKeys.detail(id) });
      toast.success("База данных удалена");
    },
    onError: () => toast.error("Ошибка при удалении базы данных"),
  });
};

// ─── Database User ─────────────────────────────────────────────────────────

export const dbUserKeys = {
  all: ["databaseUsers"] as const,
  lists: () => [...dbUserKeys.all, "list"] as const,
  list: (f?: DatabaseUserFilters, s?: string) =>
    [...dbUserKeys.lists(), { f, s }] as const,
  details: () => [...dbUserKeys.all, "detail"] as const,
  detail: (id: string) => [...dbUserKeys.details(), id] as const,
};

export const useDatabaseUsersInfiniteList = (
  search?: string,
  filters?: DatabaseUserFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<DatabaseUser>>({
    queryKey: dbUserKeys.list(filters, search),
    queryFn: ({ pageParam = 0 }) =>
      getDatabaseUsersListMock(
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

export const useDatabaseUser = (id: string | undefined) =>
  useQuery({
    queryKey: dbUserKeys.detail(id!),
    queryFn: () => getDatabaseUserMock(id!),
    enabled: !!id,
  });

export const useCreateDatabaseUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDatabaseUserRequest) =>
      createDatabaseUserMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: dbUserKeys.lists() });
      qc.setQueryData(dbUserKeys.detail(item.id), item);
      toast.success("Пользователь БД создан");
    },
    onError: () => toast.error("Ошибка при создании пользователя БД"),
  });
};

export const useUpdateDatabaseUser = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDatabaseUserRequest) =>
      updateDatabaseUserMock(id, data),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: dbUserKeys.lists() });
      if (u) qc.setQueryData(dbUserKeys.detail(id), u);
      toast.success("Пользователь БД обновлён");
    },
    onError: () => toast.error("Ошибка при обновлении пользователя БД"),
  });
};

export const useDeleteDatabaseUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDatabaseUserMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: dbUserKeys.lists() });
      qc.removeQueries({ queryKey: dbUserKeys.detail(id) });
      toast.success("Пользователь БД удалён");
    },
    onError: () => toast.error("Ошибка при удалении пользователя БД"),
  });
};
