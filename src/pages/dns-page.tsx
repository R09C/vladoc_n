/**
 * DnsPage — CRUD-страница DNS-ресурсов с infinite scroll таблицей.
 * Фильтрация по типу (MASTER/SLAVE/RESERVE) и группе (NSC),
 * поиск, сортировка, drawer-форма, удаление.
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { VirtualInfiniteTable } from "@/shared/ui/virtual-infinite-table";
import { ColumnHeaderMenu } from "@/shared/ui/column-header-menu";
import { Badge } from "@/shared/ui/badge";
import { Checkbox } from "@/shared/ui/checkbox";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/shared/ui/drawer";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/shared/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Globe,
  Search,
  Loader2,
  X,
  List,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  useDNS,
  useCreateDNS,
  useUpdateDNS,
  useDeleteDNS,
} from "@/entities/dns";
import type {
  DNSResource,
  CreateDNSResourceRequest,
  UpdateDNSResourceRequest,
  DNSResourceFilters,
} from "@/entities/dns";
import { useObjectGroupList } from "@/entities/object-group";
import {
  GroupType,
  DNSType,
  DNS_TYPE_LABELS,
  RESOURCE_NAME_PREFIX,
} from "@/shared/config/enums";
import {
  useDebounce,
  useColumnSorting,
  useColumnFilters,
  customFilter,
  arrayFilter,
} from "@/shared";
import type { FilterDescriptors } from "@/shared/lib/hooks/useColumnFilters";
import type {
  InfiniteScrollParams,
  InfiniteScrollResponse,
} from "@/shared/api/types";
import { getDNSListMock } from "@/shared/api/mocks/dns.mock";
import { generateName } from "@/shared/lib/utils/name-generator";

// ─── Zod schema ────────────────────────────────────────────────────────────

const dnsSchema = z.object({
  group_id: z.string().min(1, "Выберите группу"),
  name: z.string().optional().default(""),
  parent_group_id: z.string().nullable().optional(),
  type: z.enum(["MASTER", "SLAVE", "RESERVE"]),
  vm_id: z.string().min(1, "Укажите ВМ"),
});

type DnsFormValues = z.infer<typeof dnsSchema>;

// ─── Field helper ──────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}

const Field: React.FC<FieldProps> = ({ label, error, children, required }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-foreground">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

// ─── Component ─────────────────────────────────────────────────────────────

export const DnsPage: React.FC = () => {
  /* ── Search ───────────────────────────── */
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  /* ── Selection ────────────────────────── */
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  /* ── Sorting (shared hook) ───────────── */
  const sortingCtl = useColumnSorting();

  /* ── Reference data ───────────────────── */
  const { data: nscGroups = [] } = useObjectGroupList({ type: GroupType.NSC });

  /* ── Filter descriptors (shared hook) ── */
  const filterDescriptors: FilterDescriptors<DNSResourceFilters> = useMemo(
    () => ({
      type: customFilter<DNSResourceFilters>({
        options: [
          { value: DNSType.MASTER, label: DNS_TYPE_LABELS.MASTER },
          { value: DNSType.SLAVE, label: DNS_TYPE_LABELS.SLAVE },
          { value: DNSType.RESERVE, label: DNS_TYPE_LABELS.RESERVE },
        ],
        exclusive: true,
        toFilter: (vals) => ({
          type: vals.length === 1 ? (vals[0] as DNSType) : undefined,
        }),
        fromFilter: (f) => (f.type ? [f.type] : []),
      }),
      group_id: arrayFilter<DNSResourceFilters>("group_id", {
        options: nscGroups.map((g) => ({ value: g.id, label: g.name })),
        searchable: true,
      }),
    }),
    [nscGroups],
  );

  const filterCtl = useColumnFilters<DNSResourceFilters>(filterDescriptors);

  // Map for column FK lookups
  const groupMap = useMemo(
    () => new Map(nscGroups.map((g) => [g.id, g])),
    [nscGroups],
  );

  /* ── Effective filters ────────────────── */
  const effectiveFilters: DNSResourceFilters = useMemo(
    () => ({ ...filterCtl.filters }),
    [filterCtl.filters],
  );

  /* ── Fetch function ───────────────────── */
  const handleFetch = useCallback(
    async (
      params: InfiniteScrollParams,
    ): Promise<InfiniteScrollResponse<DNSResource>> => {
      return getDNSListMock(
        params.offset,
        params.limit,
        params.sortBy,
        params.sortOrder,
        debouncedSearch,
        effectiveFilters,
      );
    },
    [debouncedSearch, effectiveFilters],
  );

  /* ── Selection helpers ────────────────── */
  const toggleSelect = useCallback((id: string, selected: boolean) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const selectedIds = useMemo(() => [...selectedItems], [selectedItems]);
  const clearSelection = useCallback(() => setSelectedItems(new Set()), []);

  /* ── Drawer state ─────────────────────── */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const isEditMode = editId !== null;

  const { data: editItem } = useDNS(editId ?? undefined);

  /* ── Mutations ────────────────────────── */
  const createMut = useCreateDNS();
  const updateMut = useUpdateDNS(editId ?? "");
  const deleteMut = useDeleteDNS();

  /* ── Delete dialog ────────────────────── */
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const clearSelectionRef = useRef<(() => void) | null>(null);

  /* ── Form ─────────────────────────────── */
  const form = useForm<DnsFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(dnsSchema) as any,
    defaultValues: {
      group_id: "",
      name: "",
      parent_group_id: null,
      type: "MASTER",
      vm_id: "",
    },
  });

  // Reset form when drawer opens/closes or editing item loads
  useEffect(() => {
    if (!drawerOpen) return;
    if (isEditMode && editItem) {
      form.reset({
        group_id: editItem.group_id,
        name: editItem.name,
        parent_group_id: editItem.parent_group_id,
        type: editItem.type,
        vm_id: editItem.vm_id,
      });
    } else if (!isEditMode) {
      form.reset({
        group_id: "",
        name: "",
        parent_group_id: null,
        type: "MASTER",
        vm_id: "",
      });
    }
  }, [drawerOpen, isEditMode, editItem, form]);

  /* ── Handlers ─────────────────────────── */
  const handleCreate = useCallback(() => {
    setEditId(null);
    setDrawerOpen(true);
  }, []);

  const handleRowClick = useCallback((dns: DNSResource) => {
    setEditId(dns.id);
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setEditId(null);
  }, []);

  const handleSubmit = useCallback(
    async (values: DnsFormValues) => {
      if (isEditMode) {
        const payload: UpdateDNSResourceRequest = {
          group_id: values.group_id || undefined,
          name: values.name || undefined,
          parent_group_id: values.parent_group_id ?? null,
          type: values.type as DNSType,
          vm_id: values.vm_id || undefined,
        };
        await updateMut.mutateAsync(payload);
      } else {
        const name =
          values.name ||
          generateName(
            RESOURCE_NAME_PREFIX.DNS_RESOURCE,
            nscGroups.flatMap(() => []),
          );
        const payload: CreateDNSResourceRequest = {
          group_id: values.group_id,
          name,
          parent_group_id: values.parent_group_id ?? null,
          type: values.type as DNSType,
          vm_id: values.vm_id,
        };
        await createMut.mutateAsync(payload);
      }
      handleDrawerClose();
    },
    [isEditMode, updateMut, createMut, nscGroups, handleDrawerClose],
  );

  const handleEdit = useCallback(() => {
    if (selectedIds.length === 1) {
      setEditId(selectedIds[0]);
      setDrawerOpen(true);
    }
  }, [selectedIds]);

  const handleDeleteRequest = useCallback(() => {
    if (selectedIds.length === 0) return;
    setPendingDeleteIds(selectedIds);
    clearSelectionRef.current = clearSelection;
    setDeleteDialogOpen(true);
  }, [selectedIds, clearSelection]);

  const handleDeleteFromDrawer = useCallback(() => {
    if (!editId) return;
    setPendingDeleteIds([editId]);
    setDeleteDialogOpen(true);
  }, [editId]);

  const handleConfirmDelete = useCallback(async () => {
    if (pendingDeleteIds.length === 0) return;
    for (const id of pendingDeleteIds) {
      await deleteMut.mutateAsync(id);
    }
    clearSelectionRef.current?.();
    clearSelectionRef.current = null;
    setPendingDeleteIds([]);
    setDeleteDialogOpen(false);
    handleDrawerClose();
  }, [deleteMut, pendingDeleteIds, handleDrawerClose]);

  const handleCancelDelete = useCallback(() => {
    setPendingDeleteIds([]);
    setDeleteDialogOpen(false);
  }, []);

  const isMutating = createMut.isPending || updateMut.isPending;

  /* ── Columns ──────────────────────────── */
  const { getSortProps } = sortingCtl;
  const { getFilterProps } = filterCtl;

  const columns = useMemo<ColumnDef<DNSResource>[]>(
    () => [
      /* Checkbox */
      {
        id: "select",
        header: () => null,
        cell: ({ row }) => (
          <Checkbox
            checked={selectedItems.has(row.original.id)}
            onCheckedChange={(checked) =>
              toggleSelect(row.original.id, checked as boolean)
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
            onClick={() => handleRowClick(row.original)}
            className="text-left font-medium text-primary hover:underline truncate max-w-[200px]"
          >
            {row.getValue("name")}
          </button>
        ),
        size: 180,
      },

      /* Тип */
      {
        accessorKey: "type",
        header: () => (
          <ColumnHeaderMenu label="Тип" {...getFilterProps("type")} />
        ),
        cell: ({ row }) => {
          const t = row.getValue("type") as DNSType;
          const variant =
            t === DNSType.MASTER
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : t === DNSType.SLAVE
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-gray-50 text-gray-600 border-gray-200";
          return (
            <Badge variant="outline" className={variant}>
              {DNS_TYPE_LABELS[t] ?? t}
            </Badge>
          );
        },
        size: 110,
      },

      /* Группа */
      {
        accessorKey: "group_id",
        header: () => (
          <ColumnHeaderMenu label="Группа" {...getFilterProps("group_id")} />
        ),
        cell: ({ row }) => {
          const gid = row.getValue("group_id") as string;
          const g = groupMap.get(gid);
          return (
            <span className="text-xs truncate max-w-[120px] block">
              {g ? g.name : gid.slice(0, 8)}
            </span>
          );
        },
        size: 120,
      },

      /* VM */
      {
        accessorKey: "vm_id",
        header: () => (
          <ColumnHeaderMenu label="VM" {...getSortProps("vm_id")} />
        ),
        cell: ({ row }) => {
          const vmId = row.getValue("vm_id") as string;
          return (
            <span className="text-xs font-mono truncate max-w-[100px] block">
              {vmId.slice(0, 12)}
            </span>
          );
        },
        size: 110,
      },

      /* Дата создания */
      {
        accessorKey: "created_at",
        header: () => (
          <ColumnHeaderMenu
            label="Создан"
            {...getSortProps("created_at")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(row.getValue("created_at") as string).toLocaleDateString(
              "ru-RU",
            )}
          </span>
        ),
        size: 110,
      },
    ],
    [selectedItems, toggleSelect, handleRowClick, getSortProps, getFilterProps, groupMap],
  );

  /* ── Render ───────────────────────────── */
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">DNS-ресурсы</h1>
          </div>
          <Button size="sm" onClick={handleCreate} className="gap-2">
            <Plus size={16} />
            Новый DNS-ресурс
          </Button>
        </div>
      </div>

      {/* Table area */}
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Поиск по имени..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[260px] text-sm"
            />
          </div>

          {/* Clear all filters */}
          {filterCtl.hasActiveFilters && (
            <Button
              size="sm"
              variant="ghost"
              onClick={filterCtl.resetFilters}
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
                disabled={selectedItems.size === 0}
                className="gap-1.5"
              >
                <List size={14} />
                Действия
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={selectedItems.size !== 1}
                onClick={handleEdit}
                className="gap-2 text-sm"
              >
                <Pencil size={14} />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDeleteRequest}
                className="gap-2 text-sm text-destructive focus:text-destructive"
              >
                <Trash2 size={14} />
                Удалить
                {selectedItems.size > 0 ? ` (${selectedItems.size})` : ""}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <VirtualInfiniteTable
            columns={columns as ColumnDef<unknown>[]}
            queryKey={[
              "dns",
              JSON.stringify(effectiveFilters),
              debouncedSearch,
            ]}
            fetchFn={handleFetch}
            pageSize={50}
            search={debouncedSearch}
            sorting={sortingCtl.sorting}
          />
        </div>
      </div>

      {/* ── Drawer ──────────────────────────── */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {isEditMode
                ? "Редактирование DNS-ресурса"
                : "Новый DNS-ресурс"}
            </DrawerTitle>
            <DrawerDescription>
              {isEditMode
                ? "Измените параметры DNS-ресурса"
                : "Заполните данные для нового DNS-ресурса"}
            </DrawerDescription>
          </DrawerHeader>

          <form
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onSubmit={form.handleSubmit(handleSubmit as any)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-auto px-4 py-4 sm:px-6 space-y-4">
              {/* Группа */}
              <Controller
                control={form.control}
                name="group_id"
                render={({ field, fieldState }) => (
                  <Field
                    label="Группа (NSC)"
                    error={fieldState.error?.message}
                    required
                  >
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите группу" />
                      </SelectTrigger>
                      <SelectContent>
                        {nscGroups.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              {/* Тип */}
              <Controller
                control={form.control}
                name="type"
                render={({ field, fieldState }) => (
                  <Field
                    label="Тип DNS"
                    error={fieldState.error?.message}
                    required
                  >
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={DNSType.MASTER}>
                          {DNS_TYPE_LABELS.MASTER}
                        </SelectItem>
                        <SelectItem value={DNSType.SLAVE}>
                          {DNS_TYPE_LABELS.SLAVE}
                        </SelectItem>
                        <SelectItem value={DNSType.RESERVE}>
                          {DNS_TYPE_LABELS.RESERVE}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              {/* VM ID */}
              <Field
                label="Виртуальная машина (ID)"
                error={form.formState.errors.vm_id?.message}
                required
              >
                <Input
                  placeholder="Введите ID виртуальной машины"
                  {...form.register("vm_id")}
                />
              </Field>

              {/* Parent Group */}
              <Controller
                control={form.control}
                name="parent_group_id"
                render={({ field, fieldState }) => (
                  <Field
                    label="Вышестоящая группа (опц.)"
                    error={fieldState.error?.message}
                  >
                    <Select
                      value={field.value ?? "__none__"}
                      onValueChange={(val) =>
                        field.onChange(val === "__none__" ? null : val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Не выбрана" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Не выбрана</SelectItem>
                        {nscGroups.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              {/* Name */}
              <Field
                label="Имя"
                error={form.formState.errors.name?.message}
              >
                <Input
                  placeholder="Авто (mnscNN), либо укажите вручную"
                  {...form.register("name")}
                />
              </Field>
            </div>

            <DrawerFooter>
              {isEditMode && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteFromDrawer}
                  disabled={isMutating}
                >
                  Удалить
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleDrawerClose}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? "Сохранить" : "Создать"}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* ── Delete Dialog ───────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeleteIds.length === 1
                ? "Вы уверены, что хотите удалить выбранный DNS-ресурс? Это действие нельзя отменить."
                : `Вы уверены, что хотите удалить ${pendingDeleteIds.length} DNS-ресурсов? Это действие нельзя отменить.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMut.isPending ? "Удаление…" : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
