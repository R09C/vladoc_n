/**
 * ObjectGroup — API-хуки (React Query)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllObjectGroupsMock,
  getObjectGroupMock,
  createObjectGroupMock,
  updateObjectGroupMock,
  deleteObjectGroupMock,
} from "@/shared/api/mocks/object-group.mock";
import type {
  ObjectGroup,
  CreateObjectGroupRequest,
  UpdateObjectGroupRequest,
  ObjectGroupFilters,
} from "@/entities/object-group";
import { toast } from "sonner";

export const objectGroupKeys = {
  all: ["objectGroups"] as const,
  lists: () => [...objectGroupKeys.all, "list"] as const,
  list: (filters?: ObjectGroupFilters) =>
    [...objectGroupKeys.lists(), { filters }] as const,
  details: () => [...objectGroupKeys.all, "detail"] as const,
  detail: (id: string) => [...objectGroupKeys.details(), id] as const,
};

/**
 * Справочник групп объектов (без пагинации).
 * Кэшируется 10 мин (staleTime), хранится 30 мин (gcTime).
 */
export const useObjectGroupList = (
  filters?: ObjectGroupFilters,
  enabled = true,
) =>
  useQuery<ObjectGroup[]>({
    queryKey: objectGroupKeys.list(filters),
    queryFn: () => getAllObjectGroupsMock(filters),
    enabled,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

export const useObjectGroup = (id: string | undefined) =>
  useQuery({
    queryKey: objectGroupKeys.detail(id!),
    queryFn: () => getObjectGroupMock(id!),
    enabled: !!id,
  });

export const useCreateObjectGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateObjectGroupRequest) => createObjectGroupMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: objectGroupKeys.lists() });
      qc.setQueryData(objectGroupKeys.detail(item.id), item);
      toast.success("Группа объектов создана");
    },
    onError: () => toast.error("Ошибка при создании группы"),
  });
};

export const useUpdateObjectGroup = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateObjectGroupRequest) =>
      updateObjectGroupMock(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: objectGroupKeys.lists() });
      if (updated) qc.setQueryData(objectGroupKeys.detail(id), updated);
      toast.success("Группа обновлена");
    },
    onError: () => toast.error("Ошибка при обновлении группы"),
  });
};

export const useDeleteObjectGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteObjectGroupMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: objectGroupKeys.lists() });
      qc.removeQueries({ queryKey: objectGroupKeys.detail(id) });
      toast.success("Группа удалена");
    },
    onError: () => toast.error("Ошибка при удалении группы"),
  });
};
