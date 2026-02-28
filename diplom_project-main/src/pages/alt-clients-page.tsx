/**
 * AltClientsPage — CRUD-страница альтернативных клиентов.
 * Infinite-scroll таблица, Drawer-форма, диалог удаления.
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { VirtualInfiniteTable } from "@/shared/ui/virtual-infinite-table";
import { ColumnHeaderMenu } from "@/shared/ui/column-header-menu";
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Users2, Search, Loader2, List, Pencil, Trash2 } from "lucide-react";
import {
  useAltClient, useCreateAltClient, useUpdateAltClient, useDeleteAltClient,
} from "@/entities/alternative-client";
import type {
  AlternativeClient, CreateAlternativeClientRequest, UpdateAlternativeClientRequest,
} from "@/entities/alternative-client";
import { useDebounce, useColumnSorting } from "@/shared";
import type { InfiniteScrollParams, InfiniteScrollResponse } from "@/shared/api/types";
import { getAltClientsListMock } from "@/shared/api/mocks/alt-client.mock";

/* ── Types ──────────────────────────────────────────────────────────────── */
type DrawerMode = "create" | "edit";
const altClientSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  vm_id: z.string().min(1, "Укажите ВМ"),
  description: z.string().optional().default(""),
});
type FormValues = z.infer<typeof altClientSchema>;
const EMPTY: FormValues = { name: "", vm_id: "", description: "" };

/* ── Page ───────────────────────────────────────────────────────────────── */
export const AltClientsPage: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const clearRef = useRef<(() => void) | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const sortCtl = useColumnSorting();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle = useCallback((id: string, on: boolean) => {
    setSelected((p) => { const n = new Set(p); if (on) n.add(id); else n.delete(id); return n; });
  }, []);
  const selectedIds = useMemo(() => [...selected], [selected]);
  const clearSelection = useCallback(() => setSelected(new Set()), []);
  const deleteMut = useDeleteAltClient();

  const handleFetch = useCallback(
    async (p: InfiniteScrollParams): Promise<InfiniteScrollResponse<AlternativeClient>> =>
      getAltClientsListMock(p.offset, p.limit, p.sortBy, p.sortOrder, debouncedSearch),
    [debouncedSearch],
  );

  const handleCreate = () => { setSelectedId(null); setDrawerMode("create"); setDrawerOpen(true); };
  const handleRowClick = useCallback((r: AlternativeClient) => {
    setSelectedId(r.id); setDrawerMode("edit"); setDrawerOpen(true);
  }, []);
  const handleEdit = () => { if (selectedIds.length === 1) { setSelectedId(selectedIds[0]); setDrawerMode("edit"); setDrawerOpen(true); } };
  const handleDelete = () => { if (selectedIds.length) { setPendingIds(selectedIds); clearRef.current = clearSelection; setDeleteOpen(true); } };
  const handleConfirmDelete = useCallback(async () => {
    await Promise.all(pendingIds.map((id) => deleteMut.mutateAsync(id)));
    clearRef.current?.(); clearRef.current = null; setPendingIds([]); setDeleteOpen(false);
  }, [deleteMut, pendingIds]);

  const { getSortProps } = sortCtl;
  const columns = useMemo((): ColumnDef<AlternativeClient>[] => [
    { id: "select", header: () => null, cell: ({ row }) => <Checkbox checked={selected.has(row.original.id)} onCheckedChange={(c) => toggle(row.original.id, c as boolean)} onClick={(e) => e.stopPropagation()} aria-label="Выбрать" />, size: 40 },
    { accessorKey: "name", header: () => <ColumnHeaderMenu label="Имя" {...getSortProps("name")} />, cell: ({ row }) => <button onClick={() => handleRowClick(row.original)} className="text-left font-medium text-primary hover:underline truncate max-w-[200px]">{row.getValue("name")}</button>, size: 180 },
    { accessorKey: "vm_id", header: () => <ColumnHeaderMenu label="VM" {...getSortProps("vm_id")} />, cell: ({ row }) => <span className="font-mono text-xs truncate max-w-[120px] block">{(row.getValue("vm_id") as string).slice(0, 8)}</span>, size: 120 },
    { accessorKey: "description", header: "Описание", cell: ({ row }) => <span className="text-sm text-muted-foreground truncate max-w-[250px] block">{row.getValue("description") || "—"}</span>, size: 250 },
    { accessorKey: "created_at", header: () => <ColumnHeaderMenu label="Создан" {...getSortProps("created_at")} />, cell: ({ row }) => <span className="text-xs text-muted-foreground">{new Date(row.getValue("created_at") as string).toLocaleDateString("ru-RU")}</span>, size: 100 },
  ], [selected, toggle, handleRowClick, getSortProps]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Users2 className="h-6 w-6 text-primary" /><h1 className="text-2xl font-bold">Альтернативные клиенты</h1></div>
          <Button size="sm" onClick={handleCreate} className="gap-2"><Plus size={16} />Новый клиент</Button>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Поиск по имени…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-[260px] text-sm" /></div>
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="sm" variant="outline" disabled={selected.size === 0} className="gap-1.5"><List size={14} />Действия</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled={selected.size !== 1} onClick={handleEdit} className="gap-2 text-sm"><Pencil size={14} />Редактировать</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="gap-2 text-sm text-destructive focus:text-destructive"><Trash2 size={14} />Удалить{selected.size > 0 ? ` (${selected.size})` : ""}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex-1 overflow-hidden">
          <VirtualInfiniteTable columns={columns as ColumnDef<unknown>[]} queryKey={["altClients", debouncedSearch]} fetchFn={handleFetch} pageSize={20} search={debouncedSearch} sorting={sortCtl.sorting} />
        </div>
      </div>
      <AltClientDrawer open={drawerOpen} mode={drawerMode} itemId={selectedId} onClose={() => { setDrawerOpen(false); setSelectedId(null); }} onSaved={() => { setDrawerOpen(false); setSelectedId(null); }} />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Подтверждение удаления</AlertDialogTitle><AlertDialogDescription>{pendingIds.length === 1 ? "Удалить выбранного альтернативного клиента?" : `Удалить ${pendingIds.length} записей?`}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setPendingIds([]); setDeleteOpen(false); }}>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleteMut.isPending ? "Удаление…" : "Удалить"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/* ── Drawer ──────────────────────────────────────────────────────────────── */
const AltClientDrawer: React.FC<{ open: boolean; mode: DrawerMode; itemId: string | null; onClose: () => void; onSaved: () => void; }> = ({ open, mode, itemId, onClose, onSaved }) => {
  const isCreate = mode === "create";
  const { data: item, isLoading } = useAltClient(mode === "edit" && itemId ? itemId : undefined);
  const createMut = useCreateAltClient();
  const updateMut = useUpdateAltClient(itemId ?? "");
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(altClientSchema) as never, defaultValues: EMPTY });
  useEffect(() => { if (open && isCreate) reset(EMPTY); }, [open, isCreate, reset]);
  useEffect(() => { if (open && !isCreate && item) reset({ name: item.name, vm_id: item.vm_id, description: item.description ?? "" }); }, [open, isCreate, item, reset]);
  const onSubmit = async (v: FormValues) => {
    if (isCreate) await createMut.mutateAsync(v as CreateAlternativeClientRequest);
    else if (itemId) await updateMut.mutateAsync(v as UpdateAlternativeClientRequest);
    onSaved();
  };
  const saving = createMut.isPending || updateMut.isPending;
  const loading = !isCreate && isLoading;
  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="h-screen flex flex-col">
        <DrawerHeader className="flex-shrink-0 pb-3 border-b"><DrawerTitle>{isCreate ? "Новый альтернативный клиент" : "Редактирование"}</DrawerTitle><DrawerDescription>{isCreate ? "Заполните форму" : "Измените поля и сохраните"}</DrawerDescription></DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {loading ? <div className="flex items-center justify-center h-40 gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /><span>Загрузка…</span></div> : (
            <form id="alt-client-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Field label="Имя *" error={errors.name?.message}><Input {...register("name")} placeholder="Имя клиента" /></Field>
              <Field label="VM ID *" error={errors.vm_id?.message}><Input {...register("vm_id")} placeholder="ID виртуальной машины" /></Field>
              <Field label="Описание"><Input {...register("description")} placeholder="Описание" /></Field>
            </form>
          )}
        </div>
        <DrawerFooter className="flex-row justify-end border-t pt-3"><Button variant="ghost" onClick={onClose}>Отмена</Button><Button type="submit" form="alt-client-form" disabled={saving || loading}>{saving ? "Сохранение…" : "Сохранить"}</Button></DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({ label, error, children }) => (
  <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">{label}</label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>
);
