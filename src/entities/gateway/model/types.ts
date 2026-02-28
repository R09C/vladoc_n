/**
 * Gateway — модель данных по PRD
 */

import type { BaseEntity } from "@/shared/lib/types/base";

/** Шлюз (Gateway) */
export interface Gateway extends BaseEntity {
  /** IP-адрес шлюза (валидация формата IPv4, уникальный) */
  ip_address: string;
}

/** Запрос на создание Gateway */
export interface CreateGatewayRequest {
  ip_address: string;
}

/** Запрос на обновление Gateway */
export interface UpdateGatewayRequest {
  ip_address?: string;
}
