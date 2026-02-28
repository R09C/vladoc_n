/**
 * Balancer — модели данных по PRD
 * Группа балансировки и Ресурс балансировщика
 */

import type { BaseEntity } from "@/shared/lib/types/base";

/** Группа балансировки */
export interface BalancerGroup extends BaseEntity {
  /** FK → CephUser (nullable) */
  ceph_user_id: string | null;
  /** FK → ObjectGroup (BLC) */
  group_id: string;
}

/** Ресурс балансировщика */
export interface BalancerResource extends BaseEntity {
  /** Наименование (формат: mbls + NN) */
  name: string;
  /** FK → VirtualMachine */
  vm_id: string;
  /** FK → BalancerGroup */
  balancer_group_id: string;
}

// ─── Request / Filter types ────────────────────────────────────────────────

export interface CreateBalancerGroupRequest {
  ceph_user_id?: string | null;
  group_id: string;
}

export interface UpdateBalancerGroupRequest {
  ceph_user_id?: string | null;
}

export interface CreateBalancerResourceRequest {
  name?: string;
  vm_id: string;
  balancer_group_id: string;
}

export interface UpdateBalancerResourceRequest {
  name?: string;
  vm_id?: string;
  balancer_group_id?: string;
}

export interface BalancerGroupFilters {
  group_id?: string;
  ceph_user_id?: string;
}

export interface BalancerResourceFilters {
  balancer_group_id?: string;
  vm_id?: string;
}
