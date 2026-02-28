/**
 * DomainsPage — CRUD-страница доменов.
 * Infinite-scroll таблица, колоночные фильтры, Drawer-форма, диалог удаления.
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { VirtualInfiniteTable } from "@/shared/ui/virtual-infinite-table";
import { ColumnHeaderMenu } from "@/shared/ui/column-header-menu";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle,
  DrawerDescription, DrawerFooter,
} from "@/shared/ui/drawer";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
} from "@/shared/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Link, Search, Loader2, X, List, Pencil, Trash2 } from "lucide-react";
import {
  useDomain, useCreateDomain, useUpdateDomain, useDeleteDomain,
} from "@/entities/domain";
import type {
  Domain, CreateDomainRequest, UpdateDomainRequest, DomainFilters,
} from "@/entities/domain";
import {
  useDebounce, useColumnSorting, useColumnFilters, customFilter,
} from "@/shared";
import type { FilterDescriptors } from "@/shared/lib/hooks/useColumnFilters";
import type { InfiniteScrollParams, InfiniteScrollResponse } from "@/shared/api/types";
import { getDomainsListMock } from "@/shared/api/mocks/domain.mock";

/* ── Types & schema ─────────────────────────────────────────────────────── */

type DrawerMode = "create" | "edit";

const domainSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  is_internal: z.boolean().optional().default(false),
  is_external: z.boolean().optional().default(false),
  is_system: z.boolean().optional().default(false),
  balancer_group_ids: z.array(z.string()).optional().default([]),
});

type FormValues = z.infer<typeof domainSchema>;
const EMPTY: FormValues = { name: "", is_internal: false, is_external: false, is_system: false, balancer_group_ids: [] };

/* ── Field helper ───────────────────────────────────────────────────────── */

const Field: React.FC<{ label: string; error?: string; children: React.ReactNode; required?: boolean }> = ({ label, error, children, required }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-foreground">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

/* ── Filter descriptors ─────────────────────────────────────────────────── */

const filterDescriptors: FilterDescriptors<DomainFilters> = {
  is_internal: customFilter<DomainFilters>({
    options: [
      { value: "true", label: "Да" },
      { value: "false", label: "Нет" },
    ],
    exclusive: true,
    toFilter: (vals) => ({
      is_internal: vals.includes("true") ? true : vals.includes("false") ? false : undefined,
    }),
    fromFilter: (f) => {
      if (f.is_internal === true) return ["true"];
      if (f.is_internal === false) return ["false"];
      return [];
    },
  }),
  is_external: customFilter<DomainFilters>({
    options: [
      { value: "true", label: "Да" },
      { value: "false", label: "Нет" },
    ],
    exclusive: true,
    toFilter: (vals) => ({
      is_external: vals.includes("true") ? true : vals.includes("false") ? false : undefined,
    }),
    fromFilter: (f) => {
      if (f.is_external === true) return ["true"];
      if (f.is_external === false) return ["false"];
      return [];
    },
  }),
  is_system: customFilter<DomainFilters>({
    options: [
      { value: "true", label: "Да" },
      { value: "false", label: "Нет" },
    ],
    exclusive: true,
    toFilter: (vals) => ({
      is_system: vals.includes("true") ? true : vals.includes("false") ? false : undefined,
    }),
    fromFilter: (f) => {
      if (f.is_system === true) return ["true"];
      if (f.is_system === false) return ["false"];
      return [];
    },
  }),
};

/* ── Page ───────────────────────────────────────────────────────────────── */

export const DomainsPage: React.FC = () => {
  /* ── Search ───────────────────────────── */
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  /* ── Sorting & Filtering ──────────────── */
  const sortCtl = useColumnSorting();
  const filterCtl = useColumnFilters<DomainFilters>(filterDescriptors);

  /* ── Selection ────────────────────────── */
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle = useCallback((id: string, on: boolean) => {
    setSelected((p) => { const n = new Set(p); if (on) n.add(id); else n.delete(id); return n; });
  }, []);
  const selectedIds = useMemo(() => [...selected], [selected]);
  const clearSelection = useCallback(() => setSelected(new Set()), []);

  /* ── Drawer state ─────────────────────── */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /* ── Delete dialog ────────────────────── */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const clearRef = useRef<(() => void) | null>(null);
  const deleteMut = useDeleteDomain();

  /* ── Effective filters ────────────────── */
  const effectiveFilters: DomainFilters = useMemo(
    () => ({ ...filterCtl.filters }),
    [filterCtl.filters],
  );

  /* ── Fetch ────────────────────────────── */
  const handleFetch = useCallback(
    async (p: InfiniteScrollParams): Promise<InfiniteScrollResponse<Domain>> =>
      getDomainsListMock(p.offset, p.limit, p.sortBy, p.sortOrder, debouncedSearch, effectiveFilters),
    [debouncedSearch, effectiveFilters],
  );

  /* ── Handlers ─────────────────────────── */
  const handleCreate = () => { setSelectedId(null); setDrawerMode("create"); setDrawerOpen(true); };
  const handleRowClick = useCallback((r: Domain) => {
    setSelectedId(r.id); setDrawerMode("edit"); setDrawerOpen(true);
  }, []);
  const handleEdit = () => {
    if (selectedIds.length === 1) { setSelectedId(selectedIds[0]); setDrawerMode("edit"); setDrawerOpen(true); }
  };
  const handleDelete = () => {
    if (selectedIds.length) { setPendingIds(selectedIds); clearRef.current = clearSelection; setDeleteOpen(true); }
  };
  const handleConfirmDelete = useCallback(async () => {
    await Promise.all(pendingIds.map((id) => deleteMut.mutateAsync(id)));
    clearRef.current?.(); clearRef.current = null; setPendingIds([]); setDeleteOpen(false);
  }, [deleteMut, pendingIds]);

  /* ── Columns ──────────────────────────── */
  const { getSortProps } = sortCtl;
  const { getFilterProps } = filterCtl;

  const columns = useMemo((): ColumnDef<Domain>[] => [
    {
      id: "select",
      header: () => null,
      cell: ({ row }) => (
        <Checkbox
          checked={selected.has(row.original.id)}
          onCheckedChange={(c) => toggle(row.original.id, c as boolean)}
          onClick={(e) => e.stopPropagation()}
          aria-label="Выбрать"
        />
      ),
      size: 40,
    },
    {
      accessorKey: "name",
      header: () => <ColumnHeaderMenu label="Имя" {...getSortProps("name")} />,
      cell: ({ row }) => (
        <button
          onClick={() => handleRowClick(row.original)}
          className="text-left font-medium text-primary hover:underline truncate max-w-[200px]"
        >
          {row.getValue("name")}
        </button>
      ),
      size: 200,
    },
    {
      accessorKey: "is_internal",
      header: () => (
        <ColumnHeaderMenu label="Внутр." {...getFilterProps("is_internal")} />
      ),
      cell: ({ row }) => (
        <Badge variant={row.getValue("is_internal") ? "default" : "secondary"}>
          {row.getValue("is_internal") ? "Да" : "Нет"}
        </Badge>
      ),
      size: 100,
    },
    {
      accessorKey: "is_external",
      header: () => (
        <ColumnHeaderMenu label="Внешн." {...getFilterProps("is_external")} />
      ),
      cell: ({ row }) => (
        <Badge variant={row.getValue("is_external") ? "default" : "secondary"}>
          {row.getValue("is_external") ? "Да" : "Нет"}
        </Badge>
      ),
      size: 100,
    },
    {
      accessorKey: "is_system",
      header: () => (
        <ColumnHeaderMenu label="Системный" {...getFilterProps("is_system")} />
      ),
      cell: ({ row }) => (
        <Badge variant={row.getValue("is_system") ? "destructive" : "secondary"}>
          {row.getValue("is_system") ? "Да" : "Нет"}
        </Badge>
      ),
      size: 110,
    },
    {
      accessorKey: "balancer_group_ids",
      header: "Балансировщики",
      cell: ({ row }) => {
        const ids = row.getValue("balancer_group_ids") as string[];
        return (
          <span className="text-sm text-muted-foreground">
            {ids.length > 0 ? ids.length : "—"}
          </span>
        );
      },
      size: 130,
    },
    {
      accessorKey: "created_at",
      header: () => <ColumnHeaderMenu label="Создан" {...getSortProps("created_at")} />,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.getValue("created_at") as string).toLocaleDateString("ru-RU")}
        </span>
      ),
      size: 100,
    },
  ], [selected, toggle, handleRowClick, getSortProps, getFilterProps]);

  /* ── Render ───────────────────────────── */
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Домены</h1>
          </div>
          <Button size="sm" onClick={handleCreate} className="gap-2">
            <Plus size={16} />Новый домен
          </Button>
        </div>
      </div>

      {/* Toolbar + Table */}
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по имени…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-[260px] text-sm"
            />
          </div>

          {filterCtl.hasActiveFilters && (
            <Button size="sm" variant="ghost" onClick={filterCtl.resetFilters} className="gap-1.5 text-muted-foreground">
              <X size={14} />Сбросить фильтры
            </Button>
          )}

          <div className="flex-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" disabled={selected.size === 0} className="gap-1.5">
                <List size={14} />Действия
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled={selected.size !== 1} onClick={handleEdit} className="gap-2 text-sm">
                <Pencil size={14} />Редактировать
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="gap-2 text-sm text-destructive focus:text-destructive">
                <Trash2 size={14} />Удалить{selected.size > 0 ? ` (${selected.size})` : ""}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 overflow-hidden">
          <VirtualInfiniteTable
            columns={columns as ColumnDef<unknown>[]}
            queryKey={["domains", debouncedSearch, effectiveFilters]}
            fetchFn={handleFetch}
            pageSize={20}
            search={debouncedSearch}
            sorting={sortCtl.sorting}
          />
        </div>
      </div>

      {/* Drawer */}
      <DomainDrawer
        open={drawerOpen}
        mode={drawerMode}
        itemId={selectedId}
        onClose={() => { setDrawerOpen(false); setSelectedId(null); }}
        onSaved={() => { setDrawerOpen(false); setSelectedId(null); }}
      />

      {/* Delete dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingIds.length === 1
                ? "Удалить выбранный домен?"
                : `Удалить ${pendingIds.length} записей?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setPendingIds([]); setDeleteOpen(false); }}>Отмена</AlertDialogCancel>
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

/* ── Drawer ──────────────────────────────────────────────────────────────── */

interface DomainDrawerProps {
  open: boolean;
  mode: DrawerMode;
  itemId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

const DomainDrawer: React.FC<DomainDrawerProps> = ({ open, mode, itemId, onClose, onSaved }) => {
  const isCreate = mode === "create";
  const { data: item, isLoading } = useDomain(mode === "edit" && itemId ? itemId : undefined);
  const createMut = useCreateDomain();
  const updateMut = useUpdateDomain(itemId ?? "");

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(domainSchema) as never,
    defaultValues: EMPTY,
  });

  useEffect(() => { if (open && isCreate) reset(EMPTY); }, [open, isCreate, reset]);
  useEffect(() => {
    if (open && !isCreate && item) {
      reset({
        name: item.name,
        is_internal: item.is_internal,
        is_external: item.is_external,
        is_system: item.is_system,
        balancer_group_ids: item.balancer_group_ids ?? [],
      });
    }
  }, [open, isCreate, item, reset]);

  const onSubmit = async (v: FormValues) => {
    if (isCreate) await createMut.mutateAsync(v as CreateDomainRequest);
    else if (itemId) await updateMut.mutateAsync(v as UpdateDomainRequest);
    onSaved();
  };

  const saving = createMut.isPending || updateMut.isPending;
  const loading = !isCreate && isLoading;

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="h-screen flex flex-col">
        <DrawerHeader className="flex-shrink-0 pb-3 border-b">
          <DrawerTitle>{isCreate ? "Новый домен" : "Редактирование домена"}</DrawerTitle>
          <DrawerDescription>{isCreate ? "Заполните форму" : "Измените поля и сохраните"}</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          {loading ? (
            <div className="flex items-center justify-center h-40 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /><span>Загрузка…</span>
            </div>
          ) : (
            <form id="domain-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Field label="Имя" error={errors.name?.message} required>
                <Input {...register("name")} placeholder="Имя домена" />
              </Field>

              <Controller
                name="is_internal"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="is_internal"
                      checked={!!field.value}
                      onCheckedChange={(c) => field.onChange(!!c)}
                    />
                    <label htmlFor="is_internal" className="text-sm">Внутренний домен</label>
                  </div>
                )}
              />

              <Controller
                name="is_external"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="is_external"
                      checked={!!field.value}
                      onCheckedChange={(c) => field.onChange(!!c)}
                    />
                    <label htmlFor="is_external" className="text-sm">Внешний домен</label>
                  </div>
                )}
              />

              <Controller
                name="is_system"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="is_system"
                      checked={!!field.value}
                      onCheckedChange={(c) => field.onChange(!!c)}
                    />
                    <label htmlFor="is_system" className="text-sm">Системный домен</label>
                  </div>
                )}
              />

              <Field label="ID групп балансировки" error={errors.balancer_group_ids?.message}>
                <Controller
                  name="balancer_group_ids"
                  control={control}
                  render={({ field }) => (
                    <Input
                      placeholder="id1, id2, id3 (через запятую)"
                      value={(field.value ?? []).join(", ")}
                      onChange={(e) => {
                        const raw = e.target.value;
                        field.onChange(
                          raw.trim() === "" ? [] : raw.split(",").map((s) => s.trim()).filter(Boolean),
                        );
                      }}
                    />
                  )}
                />
              </Field>
            </form>
          )}
        </div>

        <DrawerFooter className="flex-row justify-end border-t pt-3">
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
          <Button type="submit" form="domain-form" disabled={saving || loading}>
            {saving ? "Сохранение…" : "Сохранить"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
