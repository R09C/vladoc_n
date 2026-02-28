/**
 * useColumnFilters — переиспользуемый хук управления колоночными фильтрами.
 *
 * Описывает фильтры через «дескрипторы» — маппинг между UI-значениями
 * (string[]) в выпадающем меню колонки и реальным объектом фильтров,
 * который уходит на сервер.
 *
 * ## Пример
 * ```tsx
 * const { getFilterProps, filters, setFilters, hasActiveFilters, resetFilters } =
 *   useColumnFilters<VMFilters>({
 *     is_active: arrayToBoolean({
 *       options: STATUS_OPTIONS,
 *       exclusive: true,
 *       toFilter: (vals) => { ... },
 *       fromFilter: (f) => { ... },
 *     }),
 *     os_id: arrayFilter({
 *       options: osOptions,
 *       searchable: true,
 *     }),
 *   });
 *
 * // В колонке:
 * header: () => <ColumnHeaderMenu label="ОС" {...getFilterProps("os_id")} />
 * ```
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FilterOption } from "@/shared/ui/column-header-menu";

/* ── Descriptor types ─────────────────────────────────────────────────────── */

/**
 * Дескриптор одного фильтра колонки.
 *
 * - `options` — список значений для выпадающего меню
 * - `toFilter` — превращает выбранные string[] в патч объекта фильтров
 * - `fromFilter` — читает текущие фильтры и возвращает string[] выбранных
 */
export interface FilterDescriptor<TFilters extends object> {
  options: FilterOption[];
  exclusive?: boolean;
  searchable?: boolean;
  /** Преобразует выбранные значения UI в патч фильтров */
  toFilter: (values: string[], current: TFilters) => Partial<TFilters>;
  /** Читает текущие фильтры и возвращает выбранные UI-значения */
  fromFilter: (filters: TFilters) => string[];
}

/** Карта дескрипторов: ключ — идентификатор колонки */
export type FilterDescriptors<TFilters extends object> = Record<
  string,
  FilterDescriptor<TFilters>
>;

/* ── Props, возвращаемые getFilterProps ───────────────────────────────────── */

export interface ColumnFilterProps {
  filterOptions: FilterOption[];
  selectedFilterValues: string[];
  onFilterChange: (values: string[]) => void;
  exclusive?: boolean;
  searchable?: boolean;
}

/* ── Return type ──────────────────────────────────────────────────────────── */

export interface UseColumnFiltersReturn<TFilters extends object> {
  filters: TFilters;
  setFilters: (f: TFilters) => void;
  /** Есть ли хотя бы один активный фильтр */
  hasActiveFilters: boolean;
  /** Сбросить все фильтры */
  resetFilters: () => void;
  /** Пропсы для ColumnHeaderMenu по идентификатору колонки */
  getFilterProps: (columnId: string) => ColumnFilterProps;
}

/* ── Hook ─────────────────────────────────────────────────────────────────── */

export function useColumnFilters<TFilters extends object>(
  descriptors: FilterDescriptors<TFilters>,
  externalFilters?: [TFilters, (f: TFilters) => void],
  initialFilters?: TFilters,
): UseColumnFiltersReturn<TFilters> {
  const [internalFilters, setInternalFilters] = useState<TFilters>(
    (initialFilters ?? {}) as TFilters,
  );

  const filters = externalFilters ? externalFilters[0] : internalFilters;
  const setFilters = externalFilters ? externalFilters[1] : setInternalFilters;

  // Refs keep latest values accessible from stable callbacks
  const filtersRef = useRef(filters);
  const descriptorsRef = useRef(descriptors);
  const setFiltersRef = useRef(setFilters);
  useEffect(() => {
    filtersRef.current = filters;
    descriptorsRef.current = descriptors;
    setFiltersRef.current = setFilters;
  });

  const hasActiveFilters = useMemo(() => {
    return Object.values(descriptors).some((desc) => {
      const d = desc as FilterDescriptor<TFilters>;
      return d.fromFilter(filters).length > 0;
    });
  }, [filters, descriptors]);

  const resetFilters = useCallback(() => {
    setFiltersRef.current({} as TFilters);
  }, []);

  const getFilterProps = useCallback(
    (columnId: string): ColumnFilterProps => {
      const desc = descriptorsRef.current[columnId];
      if (!desc) {
        return {
          filterOptions: [],
          selectedFilterValues: [],
          onFilterChange: () => {},
        };
      }

      return {
        filterOptions: desc.options,
        selectedFilterValues: desc.fromFilter(filtersRef.current),
        onFilterChange: (values: string[]) => {
          const patch = desc.toFilter(values, filtersRef.current);
          const merged = { ...filtersRef.current, ...patch };
          // Remove keys explicitly set to undefined so they don't linger
          for (const key of Object.keys(merged)) {
            if ((merged as Record<string, unknown>)[key] === undefined) {
              delete (merged as Record<string, unknown>)[key];
            }
          }
          setFiltersRef.current(merged);
        },
        exclusive: desc.exclusive,
        searchable: desc.searchable,
      };
    },
    [], // stable — reads from refs
  );

  return {
    filters,
    setFilters,
    hasActiveFilters,
    resetFilters,
    getFilterProps,
  };
}

/* ── Preset factories ─────────────────────────────────────────────────────── */

/**
 * Фабрика для фильтра колонки с массивом значений (os_id, dns_group_id и т.д.).
 * Значения UI напрямую маппятся на string[].
 */
export function arrayFilter<TFilters extends object>(
  key: keyof TFilters & string,
  opts: {
    options: FilterOption[];
    searchable?: boolean;
  },
): FilterDescriptor<TFilters> {
  return {
    options: opts.options,
    searchable: opts.searchable,
    toFilter: (values) =>
      ({ [key]: values.length > 0 ? values : undefined }) as Partial<TFilters>,
    fromFilter: (f) => (f[key] as string[] | undefined) ?? [],
  };
}

/**
 * Фабрика для кастомного фильтра, где нужна ручная конвертация
 * (boolean-поля, составные фильтры и т.д.).
 */
export function customFilter<TFilters extends object>(opts: {
  options: FilterOption[];
  exclusive?: boolean;
  searchable?: boolean;
  toFilter: (values: string[], current: TFilters) => Partial<TFilters>;
  fromFilter: (filters: TFilters) => string[];
}): FilterDescriptor<TFilters> {
  return {
    options: opts.options,
    exclusive: opts.exclusive,
    searchable: opts.searchable,
    toFilter: opts.toFilter,
    fromFilter: opts.fromFilter,
  };
}
