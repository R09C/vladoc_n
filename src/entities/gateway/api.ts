/**
 * Gateway — API-хуки (React Query)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllGatewaysMock,
  getGatewayMock,
  createGatewayMock,
  updateGatewayMock,
  deleteGatewayMock,
} from "@/shared/api/mocks/gateway.mock";
import type {
  Gateway,
  CreateGatewayRequest,
  UpdateGatewayRequest,
} from "@/entities/gateway";
import { toast } from "sonner";

export const gatewayKeys = {
  all: ["gateways"] as const,
  lists: () => [...gatewayKeys.all, "list"] as const,
  list: () => [...gatewayKeys.lists()] as const,
  details: () => [...gatewayKeys.all, "detail"] as const,
  detail: (id: string) => [...gatewayKeys.details(), id] as const,
};

/**
 * Справочник шлюзов (без пагинации).
 * Кэшируется 10 мин (staleTime), хранится 30 мин (gcTime).
 */
export const useGatewayList = (enabled = true) =>
  useQuery<Gateway[]>({
    queryKey: gatewayKeys.list(),
    queryFn: () => getAllGatewaysMock(),
    enabled,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

export const useGateway = (id: string | undefined) =>
  useQuery({
    queryKey: gatewayKeys.detail(id!),
    queryFn: () => getGatewayMock(id!),
    enabled: !!id,
  });

export const useCreateGateway = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGatewayRequest) => createGatewayMock(data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: gatewayKeys.lists() });
      qc.setQueryData(gatewayKeys.detail(item.id), item);
      toast.success("Шлюз создан");
    },
    onError: () => toast.error("Ошибка при создании шлюза"),
  });
};

export const useUpdateGateway = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateGatewayRequest) => updateGatewayMock(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: gatewayKeys.lists() });
      if (updated) qc.setQueryData(gatewayKeys.detail(id), updated);
      toast.success("Шлюз обновлён");
    },
    onError: () => toast.error("Ошибка при обновлении шлюза"),
  });
};

export const useDeleteGateway = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGatewayMock(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: gatewayKeys.lists() });
      qc.removeQueries({ queryKey: gatewayKeys.detail(id) });
      toast.success("Шлюз удалён");
    },
    onError: () => toast.error("Ошибка при удалении шлюза"),
  });
};
