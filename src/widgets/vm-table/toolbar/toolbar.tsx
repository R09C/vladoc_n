/**
 * VM Table Toolbar — поиск, кнопка сброса фильтров, действия.
 * Фильтрация и сортировка теперь находятся в выпадающих меню заголовков колонок.
 */

import React from "react";
import { Search, Pencil, Trash2, X, List } from "lucide-react";
import { Button, Input } from "@/shared/ui";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";

export interface ToolbarProps {
  search?: string;
  onSearchChange?: (search: string) => void;
  /** Есть ли активные фильтры (из useColumnFilters) */
  hasActiveFilters?: boolean;
  /** Сбросить все фильтры (из useColumnFilters) */
  onResetFilters?: () => void;
  selectedCount?: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

/* ── Toolbar ──────────────────────────────────────────────────────────────── */

export const Toolbar: React.FC<ToolbarProps> = ({
  search = "",
  onSearchChange,
  hasActiveFilters = false,
  onResetFilters,
  selectedCount = 0,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Поиск по имени, описанию..."
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-9 w-[260px] text-sm"
        />
      </div>

      {/* Clear all filters */}
      {hasActiveFilters && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onResetFilters}
          className="h-8 gap-1 text-xs"
        >
          <X size={14} />
          Сбросить фильтры
        </Button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            disabled={selectedCount === 0}
            className="gap-1.5"
          >
            <List size={14} />
            Действия
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={selectedCount !== 1}
            onClick={onEdit}
            className="gap-2 text-sm"
          >
            <Pencil size={14} />
            Редактировать
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onDelete}
            className="gap-2 text-sm text-destructive focus:text-destructive"
          >
            <Trash2 size={14} />
            Удалить{selectedCount > 0 ? ` (${selectedCount})` : ""}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
