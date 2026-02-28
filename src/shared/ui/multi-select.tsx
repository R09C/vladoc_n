import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./dropdown-menu";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  /** Текст когда ничего не выбрано */
  placeholder: string;
  /** Текст-префикс при наличии выбора, напр. "Выбор ОС" → "Выбор ОС (3)" */
  selectedLabel?: string;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder,
  selectedLabel,
  className,
}) => {
  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  };

  const label =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? (options.find((o) => o.value === selected[0])?.label ?? placeholder)
        : `${selectedLabel ?? placeholder} (${selected.length})`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 justify-between text-xs font-normal ${className ?? ""}`}
        >
          <span className="truncate">{label}</span>
          <ChevronDown size={14} className="ml-1 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-60 overflow-auto">
        {selected.length > 0 && (
          <>
            <DropdownMenuItem
              onSelect={() => onChange([])}
              className="text-xs text-muted-foreground justify-center"
            >
              Сбросить выбор
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {options.map((o) => (
          <DropdownMenuCheckboxItem
            key={o.value}
            checked={selected.includes(o.value)}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={() => toggle(o.value)}
            className="text-xs"
          >
            {o.label}
          </DropdownMenuCheckboxItem>
        ))}
        {options.length === 0 && (
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Нет вариантов
          </DropdownMenuLabel>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
