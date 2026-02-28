/**
 * ColumnHeaderMenu — выпадающее меню в шапке колонки таблицы.
 * Позволяет сортировать (Ascending / Descending) и фильтровать по значениям колонки.
 */

import React, { useState } from "react";
import {
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  ListFilter,
  ChevronDown,
  X,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "./dropdown-menu";
import { cn } from "@/shared/lib/utils/cn";

/* ── Types ────────────────────────────────────────────────────────────────── */

export interface FilterOption {
  value: string;
  label: string;
}

export interface ColumnHeaderMenuProps {
  /** Текст заголовка колонки */
  label: string;

  /* ── Сортировка ── */
  /** Можно ли сортировать */
  sortable?: boolean;
  /** Текущее направление сортировки (false — не отсортировано) */
  currentSort?: false | "asc" | "desc";
  /** Колбэк при смене сортировки (null — сброс) */
  onSort?: (direction: "asc" | "desc" | null) => void;

  /* ── Фильтрация ── */
  /** Список опций фильтра. Если пуст — фильтр не показывается */
  filterOptions?: FilterOption[];
  /** Выбранные значения фильтра */
  selectedFilterValues?: string[];
  /** Колбэк при смене фильтра */
  onFilterChange?: (values: string[]) => void;
  /** Показывать поиск по опциям (полезно при больших списках) */
  searchable?: boolean;
  /** Взаимоисключающий выбор: выбор одной опции сбрасывает остальные */
  exclusive?: boolean;
}

/* ── Component ────────────────────────────────────────────────────────────── */

export const ColumnHeaderMenu: React.FC<ColumnHeaderMenuProps> = ({
  label,
  sortable = false,
  currentSort = false,
  onSort,
  filterOptions = [],
  selectedFilterValues = [],
  onFilterChange,
  searchable = false,
  exclusive = false,
}) => {
  const [open, setOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const hasFilter = filterOptions.length > 0;
  const hasActiveFilter = selectedFilterValues.length > 0;
  const isActive = currentSort !== false || hasActiveFilter;

  const filteredOptions = searchable
    ? filterOptions.filter((o) =>
        o.label.toLowerCase().includes(filterSearch.toLowerCase()),
      )
    : filterOptions;

  const toggleFilterValue = (value: string) => {
    if (!onFilterChange) return;
    if (exclusive) {
      // Взаимоисключающий: повторный клик снимает, иначе заменяет
      onFilterChange(selectedFilterValues.includes(value) ? [] : [value]);
      return;
    }
    const next = selectedFilterValues.includes(value)
      ? selectedFilterValues.filter((v) => v !== value)
      : [...selectedFilterValues, value];
    onFilterChange(next);
  };

  const resetFilter = () => {
    onFilterChange?.([]);
    setFilterSearch("");
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1 font-semibold text-sm hover:text-primary transition select-none",
            isActive && "text-primary",
          )}
        >
          {label}
          {currentSort === "asc" && (
            <ArrowUpNarrowWide size={14} className="text-primary" />
          )}
          {currentSort === "desc" && (
            <ArrowDownWideNarrow size={14} className="text-primary" />
          )}
          {hasActiveFilter && <ListFilter size={14} className="text-primary" />}
          <ChevronDown
            size={12}
            className="text-muted-foreground ml-0.5 opacity-60"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="min-w-[180px] flex flex-col max-h-[360px]"
      >
        {/* ── Scrollable area ── */}
        <div className="overflow-y-auto flex-1">
          {/* ── Sort section ── */}
          {sortable && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Сортировка
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onSort?.(currentSort === "asc" ? null : "asc")}
                onSelect={(e) => e.preventDefault()}
                className={cn(
                  "gap-2 text-sm",
                  currentSort === "asc" &&
                    "bg-blue-50 dark:bg-blue-900/30 text-primary font-medium",
                )}
              >
                <ArrowUpNarrowWide size={14} />
                По возрастанию
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSort?.(currentSort === "desc" ? null : "desc")}
                onSelect={(e) => e.preventDefault()}
                className={cn(
                  "gap-2 text-sm",
                  currentSort === "desc" &&
                    "bg-blue-50 dark:bg-blue-900/30 text-primary font-medium",
                )}
              >
                <ArrowDownWideNarrow size={14} />
                По убыванию
              </DropdownMenuItem>
            </>
          )}

          {/* ── Separator ── */}
          {sortable && hasFilter && <DropdownMenuSeparator />}

          {/* ── Filter section ── */}
          {hasFilter && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Фильтр
              </DropdownMenuLabel>

              {/* Search inside filter options */}
              {searchable && (
                <div className="px-2 pb-1">
                  <div className="relative">
                    <Search
                      size={12}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      placeholder="Поиск..."
                      className="w-full h-7 pl-6 pr-2 text-xs rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}

              {filteredOptions.map((opt) => (
                <DropdownMenuCheckboxItem
                  key={opt.value}
                  checked={selectedFilterValues.includes(opt.value)}
                  onCheckedChange={() => toggleFilterValue(opt.value)}
                  onSelect={(e) => e.preventDefault()}
                  className="text-sm"
                >
                  {opt.label}
                </DropdownMenuCheckboxItem>
              ))}

              {filteredOptions.length === 0 && searchable && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Ничего не найдено
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Fixed reset button at bottom ── */}
        {hasActiveFilter && (
          <div className="sticky bottom-0 bg-popover bg-white dark:bg-gray-900">
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={resetFilter}
              onSelect={(e) => e.preventDefault()}
              className="gap-2 text-sm text-muted-foreground"
            >
              <X size={14} />
              Сбросить фильтр
            </DropdownMenuItem>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
