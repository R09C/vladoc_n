/**
 * Project & ProjectResource — API-хуки (React Query)
 */

import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getProjectsListMock,
  getProjectMock,
  createProjectMock,
  updateProjectMock,
  deleteProjectMock,
  getProjectResourcesListMock,
  getProjectResourceMock,
  createProjectResourceMock,
  updateProjectResourceMock,
  deleteProjectResourceMock,
} from "@/shared/api/mocks/project.mock";
import type {
  Project,
  ProjectResource,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateProjectResourceRequest,
  UpdateProjectResourceRequest,
  ProjectFilters,
  ProjectResourceFilters,
} from "@/entities/project";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { toast } from "sonner";

const PAGE_SIZE = 50;

// ─── Project ───────────────────────────────────────────────────────────────

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (f?: ProjectFilters, s?: string) =>
    [...projectKeys.lists(), { f, s }] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

export const useProjectsInfiniteList = (
  search?: string,
  filters?: ProjectFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<Project>>({
    queryKey: projectKeys.list(filters, search),
    queryFn: ({ pageParam = 0 }) =>
      getProjectsListMock(
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

export const useProject = (id: string | undefined) =>
  useQuery({
    queryKey: projectKeys.detail(id!),
    queryFn: () => getProjectMock(id!),
    enabled: !!id,
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectRequest) => createProjectMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: projectKeys.lists() });
      qc.setQueryData(projectKeys.detail(item.id), item);
      toast.success("Проект создан");
    },
    onError: () => toast.error("Ошибка при создании проекта"),
  });
};

export const useUpdateProject = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProjectRequest) => updateProjectMock(id, data),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: projectKeys.lists() });
      if (u) qc.setQueryData(projectKeys.detail(id), u);
      toast.success("Проект обновлён");
    },
    onError: () => toast.error("Ошибка при обновлении проекта"),
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProjectMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: projectKeys.lists() });
      qc.removeQueries({ queryKey: projectKeys.detail(id) });
      toast.success("Проект удалён");
    },
    onError: () => toast.error("Ошибка при удалении проекта"),
  });
};

// ─── Project Resource ──────────────────────────────────────────────────────

export const projectResourceKeys = {
  all: ["projectResources"] as const,
  lists: () => [...projectResourceKeys.all, "list"] as const,
  list: (f?: ProjectResourceFilters, s?: string) =>
    [...projectResourceKeys.lists(), { f, s }] as const,
  details: () => [...projectResourceKeys.all, "detail"] as const,
  detail: (id: string) => [...projectResourceKeys.details(), id] as const,
};

export const useProjectResourcesInfiniteList = (
  search?: string,
  filters?: ProjectResourceFilters,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) =>
  useInfiniteQuery<InfiniteScrollResponse<ProjectResource>>({
    queryKey: projectResourceKeys.list(filters, search),
    queryFn: ({ pageParam = 0 }) =>
      getProjectResourcesListMock(
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

export const useProjectResource = (id: string | undefined) =>
  useQuery({
    queryKey: projectResourceKeys.detail(id!),
    queryFn: () => getProjectResourceMock(id!),
    enabled: !!id,
  });

export const useCreateProjectResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectResourceRequest) =>
      createProjectResourceMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: projectResourceKeys.lists() });
      qc.setQueryData(projectResourceKeys.detail(item.id), item);
      toast.success("Ресурс проекта создан");
    },
    onError: () => toast.error("Ошибка при создании ресурса проекта"),
  });
};

export const useUpdateProjectResource = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProjectResourceRequest) =>
      updateProjectResourceMock(id, data),
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: projectResourceKeys.lists() });
      if (u) qc.setQueryData(projectResourceKeys.detail(id), u);
      toast.success("Ресурс проекта обновлён");
    },
    onError: () => toast.error("Ошибка при обновлении ресурса проекта"),
  });
};

export const useDeleteProjectResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProjectResourceMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: projectResourceKeys.lists() });
      qc.removeQueries({ queryKey: projectResourceKeys.detail(id) });
      toast.success("Ресурс проекта удалён");
    },
    onError: () => toast.error("Ошибка при удалении ресурса проекта"),
  });
};
