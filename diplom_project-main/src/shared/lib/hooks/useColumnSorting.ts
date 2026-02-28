/**
 * useColumnSorting — переиспользуемый хук управления сортировкой для таблиц.
 *
 * Возвращает `getSortProps(columnId)` — объект, который можно spread-ить
 * прямо в `<ColumnHeaderMenu />`:
 *
 * ```tsx
 * const { getSortProps } = useColumnSorting();
 * // …
 * header: () => <ColumnHeaderMenu label="Имя" {...getSortProps("name")} />
 * ```
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { SortingState } from "@tanstack/react-table";

export interface ColumnSortProps {
  sortable: true;
  currentSort: false | "asc" | "desc";
  onSort: (direction: "asc" | "desc" | null) => void;
}

export interface UseColumnSortingReturn {
  /** Текущее состояние сортировки (совместимо с TanStack Table) */
  sorting: SortingState;
  /** Установить сортировку напрямую */
  setSorting: (s: SortingState) => void;
  /** Получить пропсы для ColumnHeaderMenu */
  getSortProps: (columnId: string) => ColumnSortProps;
}

/**
 * @param initialSorting — начальное состояние (по умолчанию [])
 * @param externalSorting — если управление состоянием внешнее, передайте
 *   `[sorting, setSorting]` — хук не будет создавать внутренний стейт.
 */
export function useColumnSorting(
  externalSorting?: [SortingState, (s: SortingState) => void],
  initialSorting: SortingState = [],
): UseColumnSortingReturn {
  const [internalSorting, setInternalSorting] =
    useState<SortingState>(initialSorting);

  const sorting = externalSorting ? externalSorting[0] : internalSorting;
  const setSorting = externalSorting ? externalSorting[1] : setInternalSorting;

  // Refs keep latest values accessible from stable callbacks
  const sortingRef = useRef(sorting);
  const setSortingRef = useRef(setSorting);
  useEffect(() => {
    sortingRef.current = sorting;
    setSortingRef.current = setSorting;
  });

  const getSortProps = useCallback(
    (columnId: string): ColumnSortProps => {
      const current = sortingRef.current.find((s) => s.id === columnId);
      const currentSort: false | "asc" | "desc" = current
        ? current.desc
          ? "desc"
          : "asc"
        : false;

      return {
        sortable: true,
        currentSort,
        onSort: (dir) => {
          setSortingRef.current(
            dir ? [{ id: columnId, desc: dir === "desc" }] : [],
          );
        },
      };
    },
    [], // stable — reads from refs
  );

  return { sorting, setSorting, getSortProps };
}
