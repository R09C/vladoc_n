/**
 * VM table columns — PRD-модель
 * name, описание, is_active, is_closed_circuit, dns_group, gateway, ram, cpu, os, created_at
 *
 * Каждая колонка использует ColumnHeaderMenu + сортировку/фильтры через
 * переиспользуемые хуки useColumnSorting / useColumnFilters из shared.
 */

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { VirtualMachine } from "@/entities/virtual-machine";
import type { OperatingSystem } from "@/entities/operating-system";
import type { ObjectGroup } from "@/entities/object-group";
import type { Gateway } from "@/entities/gateway";
import { Badge } from "@/shared/ui/badge";
import { Checkbox } from "@/shared/ui/checkbox";
import { ColumnHeaderMenu } from "@/shared/ui/column-header-menu";
import type { UseColumnSortingReturn } from "@/shared/lib/hooks/useColumnSorting";
import type { UseColumnFiltersReturn } from "@/shared/lib/hooks/useColumnFilters";
import type { VMFilters } from "@/entities/virtual-machine";

/* ── Props ────────────────────────────────────────────────────────────────── */

export interface UseColumnsProps {
  selectedVMs: Set<string>;
  onSelectVM?: (vmId: string, selected: boolean) => void;
  onRowClick?: (vm: VirtualMachine) => void;
  /** Хуки сортировки и фильтров из shared */
  sortingCtl: UseColumnSortingReturn;
  filterCtl: UseColumnFiltersReturn<VMFilters>;
  /** Справочники для отображения FK */
  osMap?: Map<string, OperatingSystem>;
  gatewayMap?: Map<string, Gateway>;
  dnsGroupMap?: Map<string, ObjectGroup>;
}

/* ── Hook ─────────────────────────────────────────────────────────────────── */

export const useColumns = ({
  selectedVMs,
  onSelectVM,
  onRowClick,
  sortingCtl,
  filterCtl,
  osMap,
  gatewayMap,
  dnsGroupMap,
}: UseColumnsProps): ColumnDef<VirtualMachine>[] => {
  const { getSortProps } = sortingCtl;
  const { getFilterProps } = filterCtl;

  return useMemo(
    () =>
      [
        /* Checkbox */
        {
          id: "select",
          header: () => null,
          cell: ({ row }) => (
            <Checkbox
              checked={selectedVMs.has(row.original.id)}
              onCheckedChange={(checked) =>
                onSelectVM?.(row.original.id, checked as boolean)
              }
              aria-label="Выбрать"
              onClick={(e) => e.stopPropagation()}
            />
          ),
          size: 40,
        },

        /* Имя */
        {
          accessorKey: "name",
          header: () => (
            <ColumnHeaderMenu label="Имя" {...getSortProps("name")} />
          ),
          cell: ({ row }) => (
            <button
              onClick={() => onRowClick?.(row.original)}
              className="text-left font-medium text-primary hover:underline truncate max-w-[200px]"
            >
              {row.getValue("name")}
            </button>
          ),
          size: 180,
        },

        /* Описание */
        {
          accessorKey: "description",
          header: "Описание",
          cell: ({ row }) => (
            <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
              {row.getValue("description") || "—"}
            </span>
          ),
          size: 200,
        },

        /* Статус (is_active / is_deleted) */
        {
          accessorKey: "is_active",
          header: () => (
            <ColumnHeaderMenu label="Статус" {...getFilterProps("is_active")} />
          ),
          cell: ({ row }) => {
            const vm = row.original;
            if (vm.is_deleted) {
              return (
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200"
                >
                  Удалена
                </Badge>
              );
            }
            return vm.is_active ? (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                Активна
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-gray-50 text-gray-600 border-gray-200"
              >
                Неактивна
              </Badge>
            );
          },
          size: 110,
        },

        /* Закрытый контур */
        {
          accessorKey: "is_closed_circuit",
          header: () => (
            <ColumnHeaderMenu
              label="Контур"
              {...getFilterProps("is_closed_circuit")}
            />
          ),
          cell: ({ row }) =>
            row.getValue("is_closed_circuit") ? (
              <Badge variant="secondary" className="text-xs">
                ЗК
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            ),
          size: 80,
        },

        /* CPU */
        {
          accessorKey: "cpu_count",
          header: () => (
            <ColumnHeaderMenu label="CPU" {...getSortProps("cpu_count")} />
          ),
          cell: ({ row }) => (
            <span className="font-mono text-sm">
              {row.getValue("cpu_count")}
            </span>
          ),
          size: 70,
        },

        /* RAM */
        {
          accessorKey: "ram_size",
          header: () => (
            <ColumnHeaderMenu label="RAM" {...getSortProps("ram_size")} />
          ),
          cell: ({ row }) => (
            <span className="font-mono text-sm">
              {row.getValue("ram_size")} ГБ
            </span>
          ),
          size: 90,
        },

        /* ОС */
        {
          accessorKey: "os_id",
          header: () => (
            <ColumnHeaderMenu label="ОС" {...getFilterProps("os_id")} />
          ),
          cell: ({ row }) => {
            const osId = row.getValue("os_id") as string | null;
            if (!osId)
              return <span className="text-xs text-muted-foreground">—</span>;
            const os = osMap?.get(osId);
            return (
              <span className="text-xs bg-muted px-2 py-0.5 rounded truncate max-w-[120px] block">
                {os ? `${os.name} ${os.version}` : osId.slice(0, 8)}
              </span>
            );
          },
          size: 130,
        },

        /* DNS-группа */
        {
          accessorKey: "dns_group_id",
          header: () => (
            <ColumnHeaderMenu
              label="DNS-группа"
              {...getFilterProps("dns_group_id")}
            />
          ),
          cell: ({ row }) => {
            const gid = row.getValue("dns_group_id") as string | null;
            if (!gid)
              return <span className="text-xs text-muted-foreground">—</span>;
            const g = dnsGroupMap?.get(gid);
            return (
              <span className="text-xs truncate max-w-[100px] block">
                {g ? g.name : gid.slice(0, 8)}
              </span>
            );
          },
          size: 110,
        },

        /* Gateway */
        {
          accessorKey: "gateway_id",
          header: "Шлюз",
          cell: ({ row }) => {
            const gid = row.getValue("gateway_id") as string | null;
            if (!gid)
              return <span className="text-xs text-muted-foreground">—</span>;
            const gw = gatewayMap?.get(gid);
            return (
              <span className="text-xs font-mono truncate max-w-[120px] block">
                {gw ? gw.ip_address : gid.slice(0, 8)}
              </span>
            );
          },
          size: 120,
        },

        /* Создана */
        {
          accessorKey: "created_at",
          header: () => (
            <ColumnHeaderMenu label="Создана" {...getSortProps("created_at")} />
          ),
          cell: ({ row }) => (
            <span className="text-xs text-muted-foreground">
              {new Date(
                row.getValue("created_at") as string,
              ).toLocaleDateString("ru-RU")}
            </span>
          ),
          size: 100,
        },
      ] as ColumnDef<VirtualMachine>[],
    [
      selectedVMs,
      onSelectVM,
      onRowClick,
      getSortProps,
      getFilterProps,
      osMap,
      gatewayMap,
      dnsGroupMap,
    ],
  );
};
