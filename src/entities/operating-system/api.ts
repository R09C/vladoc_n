/**
 * OperatingSystem — API-хуки (React Query)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllOSMock,
  getOSMock,
  createOSMock,
  updateOSMock,
  deleteOSMock,
} from "@/shared/api/mocks/os.mock";
import type {
  OperatingSystem,
  CreateOperatingSystemRequest,
  UpdateOperatingSystemRequest,
} from "@/entities/operating-system";
import { toast } from "sonner";

export const osKeys = {
  all: ["operatingSystems"] as const,
  lists: () => [...osKeys.all, "list"] as const,
  list: () => [...osKeys.lists()] as const,
  details: () => [...osKeys.all, "detail"] as const,
  detail: (id: string) => [...osKeys.details(), id] as const,
};

/**
 * Справочник ОС (без пагинации).
 * Кэшируется 10 мин (staleTime), хранится 30 мин (gcTime).
 */
export const useOSList = (enabled = true) =>
  useQuery<OperatingSystem[]>({
    queryKey: osKeys.list(),
    queryFn: () => getAllOSMock(),
    enabled,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

export const useOS = (id: string | undefined) =>
  useQuery({
    queryKey: osKeys.detail(id!),
    queryFn: () => getOSMock(id!),
    enabled: !!id,
  });

export const useCreateOS = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOperatingSystemRequest) => createOSMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: osKeys.lists() });
      qc.setQueryData(osKeys.detail(item.id), item);
      toast.success("ОС создана");
    },
    onError: () => toast.error("Ошибка при создании ОС"),
  });
};

export const useUpdateOS = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateOperatingSystemRequest) => updateOSMock(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: osKeys.lists() });
      if (updated) qc.setQueryData(osKeys.detail(id), updated);
      toast.success("ОС обновлена");
    },
    onError: () => toast.error("Ошибка при обновлении ОС"),
  });
};

export const useDeleteOS = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOSMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: osKeys.lists() });
      qc.removeQueries({ queryKey: osKeys.detail(id) });
      toast.success("ОС удалена");
    },
    onError: () => toast.error("Ошибка при удалении ОС"),
  });
};
