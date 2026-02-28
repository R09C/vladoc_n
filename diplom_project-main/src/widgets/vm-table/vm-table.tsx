/**
 * VMTable — виджет таблицы виртуальных машин
 * Загружает справочники (ОС, шлюзы, DNS-группы), управляет фильтрами,
 * передаёт данные в колонки и тулбар.
 */

import React, { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { VirtualInfiniteTable } from "@/shared/ui/virtual-infinite-table";
import type { VirtualMachine, VMFilters } from "@/entities/virtual-machine";
import { useOSList } from "@/entities/operating-system";
import { useGatewayList } from "@/entities/gateway";
import { useObjectGroupList } from "@/entities/object-group";
import { GroupType } from "@/shared/config/enums";
import { useColumns } from "./columns";
import { Toolbar } from "./toolbar";
import type {
  InfiniteScrollParams,
  InfiniteScrollResponse,
} from "@/shared/api/types";
import { getVMsListInfiniteMock } from "@/shared/api/mocks/vm.mock";
import {
  useDebounce,
  useColumnSorting,
  useColumnFilters,
  customFilter,
  arrayFilter,
} from "@/shared";
import type { FilterDescriptors } from "@/shared/lib/hooks/useColumnFilters";

/* ── Props ────────────────────────────────────────────────────────────────── */

export interface VMTableProps {
  /** Клик по строке (открыть детали) */
  onRowClick?: (vm: VirtualMachine) => void;
  /** Клик «Редактировать» на тулбаре */
  onEdit?: (vmIds: string[]) => void;
  /** Клик «Удалить» на тулбаре */
  onDelete?: (vmIds: string[], clearSelection: () => void) => void;
}

/* ── Component ────────────────────────────────────────────────────────────── */

export const VMTable: React.FC<VMTableProps> = ({
  onRowClick,
  onEdit,
  onDelete,
}) => {
  /* ── Local state ──────────────────────── */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVMs, setSelectedVMs] = useState<Set<string>>(new Set());

  const debouncedSearch = useDebounce(searchQuery, 500);

  /* ── Sorting (shared hook) ───────────── */
  const sortingCtl = useColumnSorting();

  /* ── Reference data ───────────────────── */
  const { data: osList = [] } = useOSList();
  const { data: gwList = [] } = useGatewayList();
  const { data: dnsGroupList = [] } = useObjectGroupList({
    type: GroupType.NSC,
  });

  /* ── Filter descriptors (shared hook) ── */
  const filterDescriptors: FilterDescriptors<VMFilters> = useMemo(
    () => ({
      is_active: customFilter<VMFilters>({
        options: [
          { value: "active", label: "Активные" },
          { value: "inactive", label: "Неактивные" },
          { value: "deleted", label: "Удалённые" },
        ],
        exclusive: true,
        toFilter: (vals) => {
          const next: Partial<VMFilters> = {
            is_active: undefined,
            is_deleted: undefined,
          };
          if (vals.includes("deleted")) next.is_deleted = true;
          if (vals.includes("active")) {
            next.is_active = true;
            next.is_deleted = false;
          }
          if (vals.includes("inactive")) {
            next.is_active = false;
            next.is_deleted = false;
          }
          return next;
        },
        fromFilter: (f) => {
          const vals: string[] = [];
          if (f.is_deleted === true) vals.push("deleted");
          if (f.is_active === true) vals.push("active");
          if (f.is_active === false) vals.push("inactive");
          return vals;
        },
      }),
      is_closed_circuit: customFilter<VMFilters>({
        options: [
          { value: "true", label: "Закрытый контур" },
          { value: "false", label: "Открытый контур" },
        ],
        exclusive: true,
        toFilter: (vals) => ({
          is_closed_circuit: vals.includes("true")
            ? true
            : vals.includes("false")
              ? false
              : undefined,
        }),
        fromFilter: (f) => {
          if (f.is_closed_circuit === true) return ["true"];
          if (f.is_closed_circuit === false) return ["false"];
          return [];
        },
      }),
      os_id: arrayFilter<VMFilters>("os_id", {
        options: osList.map((o) => ({
          value: o.id,
          label: `${o.name} ${o.version}`,
        })),
        searchable: true,
      }),
      dns_group_id: arrayFilter<VMFilters>("dns_group_id", {
        options: dnsGroupList.map((g) => ({ value: g.id, label: g.name })),
        searchable: true,
      }),
    }),
    [osList, dnsGroupList],
  );

  const filterCtl = useColumnFilters<VMFilters>(filterDescriptors);

  // Maps for column FK lookups
  const osMap = useMemo(() => new Map(osList.map((o) => [o.id, o])), [osList]);
  const gwMap = useMemo(() => new Map(gwList.map((g) => [g.id, g])), [gwList]);
  const dnsMap = useMemo(
    () => new Map(dnsGroupList.map((g) => [g.id, g])),
    [dnsGroupList],
  );

  /* ── Fetch function (passes filters) ──── */
  const effectiveFilters: VMFilters = useMemo(
    () => ({
      ...filterCtl.filters,
      is_deleted: filterCtl.filters.is_deleted ?? false,
    }),
    [filterCtl.filters],
  );

  const handleFetch = useCallback(
    async (
      params: InfiniteScrollParams,
    ): Promise<InfiniteScrollResponse<VirtualMachine>> => {
      const response = await getVMsListInfiniteMock(
        params.offset,
        params.limit,
        params.sortBy,
        params.sortOrder,
        debouncedSearch,
        effectiveFilters,
      );
      return response;
    },
    [debouncedSearch, effectiveFilters],
  );

  /* ── Selection helpers ────────────────── */
  const toggleSelect = useCallback((id: string, selected: boolean) => {
    setSelectedVMs((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const selectedIds = useMemo(() => [...selectedVMs], [selectedVMs]);

  /* ── Columns ──────────────────────────── */
  const columns = useColumns({
    selectedVMs,
    onSelectVM: toggleSelect,
    onRowClick,
    sortingCtl,
    filterCtl,
    osMap,
    gatewayMap: gwMap,
    dnsGroupMap: dnsMap,
  });

  /* ── Toolbar callbacks ────────────────── */
  const clearSelection = useCallback(() => setSelectedVMs(new Set()), []);

  const handleEdit = () => {
    if (selectedIds.length > 0) onEdit?.(selectedIds);
  };
  const handleDelete = () => {
    if (selectedIds.length > 0) onDelete?.(selectedIds, clearSelection);
  };

  return (
    <div className="flex flex-col h-full gap-2">
      <Toolbar
        search={searchQuery}
        onSearchChange={setSearchQuery}
        hasActiveFilters={filterCtl.hasActiveFilters}
        onResetFilters={filterCtl.resetFilters}
        selectedCount={selectedVMs.size}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <div className="flex-1 overflow-hidden">
        <VirtualInfiniteTable
          columns={columns as ColumnDef<unknown>[]}
          queryKey={["vms", JSON.stringify(effectiveFilters), debouncedSearch]}
          fetchFn={handleFetch}
          pageSize={20}
          search={debouncedSearch}
          sorting={sortingCtl.sorting}
        />
      </div>
    </div>
  );
};
