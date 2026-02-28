/**
 * Mock API — Gateway (20 записей)
 */

import type {
  Gateway,
  CreateGatewayRequest,
  UpdateGatewayRequest,
} from "@/entities/gateway";
import type { InfiniteScrollResponse } from "@/shared/api/types";
import { store, delay, queryList } from "./_store";

export async function getGatewaysListMock(
  offset = 0,
  limit = 50,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  search?: string,
): Promise<InfiniteScrollResponse<Gateway>> {
  await delay(200);
  return queryList(store.gateways, {
    offset,
    limit,
    sortBy,
    sortOrder,
    search,
    searchFields: ["ip_address"],
  });
}

/** Возвращает все шлюзы без пагинации (справочник) */
export async function getAllGatewaysMock(): Promise<Gateway[]> {
  await delay(100);
  return [...store.gateways];
}

export async function getGatewayMock(id: string): Promise<Gateway | null> {
  await delay(100);
  return store.gateways.find((g) => g.id === id) ?? null;
}

export async function createGatewayMock(
  data: CreateGatewayRequest,
): Promise<Gateway> {
  await delay(300);
  const now = new Date().toISOString();
  const gw: Gateway = {
    id: `gw-${String(store.gateways.length + 1).padStart(2, "0")}`,
    ip_address: data.ip_address,
    created_at: now,
    updated_at: now,
  };
  store.gateways.push(gw);
  return gw;
}

export async function updateGatewayMock(
  id: string,
  data: UpdateGatewayRequest,
): Promise<Gateway | null> {
  await delay(300);
  const idx = store.gateways.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  store.gateways[idx] = {
    ...store.gateways[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store.gateways[idx];
}

export async function deleteGatewayMock(id: string): Promise<boolean> {
  await delay(300);
  const idx = store.gateways.findIndex((g) => g.id === id);
  if (idx === -1) return false;
  store.gateways.splice(idx, 1);
  return true;
}
