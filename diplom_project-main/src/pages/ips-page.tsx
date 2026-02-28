/**
 * IpsPage — CRUD-страница IP-пулов и IP-адресов.
 * Две вкладки: IP-пулы | IP-адреса.
 * Infinite-scroll таблицы, Drawer-формы, диалоги удаления.
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Tabs } from "@/shared/ui/tabs";
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
import { Plus, Network, Search, Loader2, List, Pencil, Trash2 } from "lucide-react";
import {
  useIPPool, useCreateIPPool, useUpdateIPPool, useDeleteIPPool,
  useIP, useCreateIP, useUpdateIP, useDeleteIP,
} from "@/entities/ip";
import type {
  IPPool, IP,
  CreateIPPoolRequest, UpdateIPPoolRequest,
  CreateIPRequest, UpdateIPRequest,
} from "@/entities/ip";
import { useDebounce, useColumnSorting } from "@/shared";
import type { InfiniteScrollParams, InfiniteScrollResponse } from "@/shared/api/types";
import { getIPPoolsListMock, getIPsListMock } from "@/shared/api/mocks/ip.mock";

/* ── Shared Field helper ────────────────────────────────────────────────── */
const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({ label, error, children }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-muted-foreground">{label}</label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

/* ── Types & Schemas ────────────────────────────────────────────────────── */
type DrawerMode = "create" | "edit";

const poolSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  description: z.string().optional().default(""),
  zones: z.string().optional().default(""),
});
type PoolFormValues = z.infer<typeof poolSchema>;
const POOL_EMPTY: PoolFormValues = { name: "", description: "", zones: "" };

const ipSchema = z.object({
  ip_address: z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Введите корректный IPv4-адрес"),
  pool_id: z.string().min(1, "Выберите пул"),
  vm_id: z.string().nullable().optional(),
  description: z.string().optional().default(""),
});
type IPFormValues = z.infer<typeof ipSchema>;
const IP_EMPTY: IPFormValues = { ip_address: "", pool_id: "", vm_id: "", description: "" };

const tabList = [
  { id: "pools", label: "IP-пулы" },
  { id: "ips", label: "IP-адреса" },
];

/* ══════════════════════════════════════════════════════════════════════════
   IP Pools Tab
   ══════════════════════════════════════════════════════════════════════════ */
const IPPoolsTab: React.FC = () => {
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
  const deleteMut = useDeleteIPPool();

  const handleFetch = useCallback(
    async (p: InfiniteScrollParams): Promise<InfiniteScrollResponse<IPPool>> =>
      getIPPoolsListMock(p.offset, p.limit, p.sortBy, p.sortOrder, debouncedSearch),
    [debouncedSearch],
  );

  const handleCreate = () => { setSelectedId(null); setDrawerMode("create"); setDrawerOpen(true); };
  const handleRowClick = useCallback((r: IPPool) => {
    setSelectedId(r.id); setDrawerMode("edit"); setDrawerOpen(true);
  }, []);
  const handleEdit = () => { if (selectedIds.length === 1) { setSelectedId(selectedIds[0]); setDrawerMode("edit"); setDrawerOpen(true); } };
  const handleDelete = () => { if (selectedIds.length) { setPendingIds(selectedIds); clearRef.current = clearSelection; setDeleteOpen(true); } };
  const handleConfirmDelete = useCallback(async () => {
    await Promise.all(pendingIds.map((id) => deleteMut.mutateAsync(id)));
    clearRef.current?.(); clearRef.current = null; setPendingIds([]); setDeleteOpen(false);
  }, [deleteMut, pendingIds]);

  const { getSortProps } = sortCtl;
  const columns = useMemo((): ColumnDef<IPPool>[] => [
    { id: "select", header: () => null, cell: ({ row }) => <Checkbox checked={selected.has(row.original.id)} onCheckedChange={(c) => toggle(row.original.id, c as boolean)} onClick={(e) => e.stopPropagation()} aria-label="Выбрать" />, size: 40 },
    { accessorKey: "name", header: () => <ColumnHeaderMenu label="Имя" {...getSortProps("name")} />, cell: ({ row }) => <button onClick={() => handleRowClick(row.original)} className="text-left font-medium text-primary hover:underline truncate max-w-[200px]">{row.getValue("name")}</button>, size: 180 },
    { accessorKey: "description", header: "Описание", cell: ({ row }) => <span className="text-sm text-muted-foreground truncate max-w-[250px] block">{row.getValue("description") || "—"}</span>, size: 250 },
    { accessorKey: "zones", header: "Зоны", cell: ({ row }) => { const z = row.original.zones; return <span className="text-sm truncate max-w-[200px] block">{z?.length ? z.join(", ") : "—"}</span>; }, size: 200 },
    { accessorKey: "created_at", header: () => <ColumnHeaderMenu label="Создан" {...getSortProps("created_at")} />, cell: ({ row }) => <span className="text-xs text-muted-foreground">{new Date(row.getValue("created_at") as string).toLocaleDateString("ru-RU")}</span>, size: 100 },
  ], [selected, toggle, handleRowClick, getSortProps]);

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Поиск по имени…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-[260px] text-sm" /></div>
        <div className="flex-1" />
        <Button size="sm" onClick={handleCreate} className="gap-2"><Plus size={16} />Новый пул</Button>
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
        <VirtualInfiniteTable columns={columns as ColumnDef<unknown>[]} queryKey={["ipPools", debouncedSearch]} fetchFn={handleFetch} pageSize={20} search={debouncedSearch} sorting={sortCtl.sorting} />
      </div>
      <IPPoolDrawer open={drawerOpen} mode={drawerMode} itemId={selectedId} onClose={() => { setDrawerOpen(false); setSelectedId(null); }} onSaved={() => { setDrawerOpen(false); setSelectedId(null); }} />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Подтверждение удаления</AlertDialogTitle><AlertDialogDescription>{pendingIds.length === 1 ? "Удалить выбранный IP-пул?" : `Удалить ${pendingIds.length} IP-пулов?`}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setPendingIds([]); setDeleteOpen(false); }}>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleteMut.isPending ? "Удаление…" : "Удалить"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

/* ── IP Pool Drawer ─────────────────────────────────────────────────────── */
const IPPoolDrawer: React.FC<{ open: boolean; mode: DrawerMode; itemId: string | null; onClose: () => void; onSaved: () => void }> = ({ open, mode, itemId, onClose, onSaved }) => {
  const isCreate = mode === "create";
  const { data: item, isLoading } = useIPPool(mode === "edit" && itemId ? itemId : undefined);
  const createMut = useCreateIPPool();
  const updateMut = useUpdateIPPool(itemId ?? "");
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PoolFormValues>({ resolver: zodResolver(poolSchema) as never, defaultValues: POOL_EMPTY });

  useEffect(() => { if (open && isCreate) reset(POOL_EMPTY); }, [open, isCreate, reset]);
  useEffect(() => {
    if (open && !isCreate && item) reset({ name: item.name, description: item.description ?? "", zones: item.zones?.join(", ") ?? "" });
  }, [open, isCreate, item, reset]);

  const onSubmit = async (v: PoolFormValues) => {
    const payload = { name: v.name, description: v.description, zones: v.zones ? v.zones.split(",").map((s) => s.trim()).filter(Boolean) : [] };
    if (isCreate) await createMut.mutateAsync(payload as CreateIPPoolRequest);
    else if (itemId) await updateMut.mutateAsync(payload as UpdateIPPoolRequest);
    onSaved();
  };
  const saving = createMut.isPending || updateMut.isPending;
  const loading = !isCreate && isLoading;

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="h-screen flex flex-col">
        <DrawerHeader className="flex-shrink-0 pb-3 border-b"><DrawerTitle>{isCreate ? "Новый IP-пул" : "Редактирование IP-пула"}</DrawerTitle><DrawerDescription>{isCreate ? "Заполните форму" : "Измените поля и сохраните"}</DrawerDescription></DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {loading ? <div className="flex items-center justify-center h-40 gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /><span>Загрузка…</span></div> : (
            <form id="pool-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Field label="Имя *" error={errors.name?.message}><Input {...register("name")} placeholder="Имя пула" /></Field>
              <Field label="Описание"><Input {...register("description")} placeholder="Описание" /></Field>
              <Field label="Зоны (через запятую)" error={errors.zones?.message}><Input {...register("zones")} placeholder="zone-a, zone-b" /></Field>
            </form>
          )}
        </div>
        <DrawerFooter className="flex-row justify-end border-t pt-3"><Button variant="ghost" onClick={onClose}>Отмена</Button><Button type="submit" form="pool-form" disabled={saving || loading}>{saving ? "Сохранение…" : "Сохранить"}</Button></DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   IP Addresses Tab
   ══════════════════════════════════════════════════════════════════════════ */
const IPsTab: React.FC = () => {
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
  const deleteMut = useDeleteIP();

  const handleFetch = useCallback(
    async (p: InfiniteScrollParams): Promise<InfiniteScrollResponse<IP>> =>
      getIPsListMock(p.offset, p.limit, p.sortBy, p.sortOrder, debouncedSearch),
    [debouncedSearch],
  );

  const handleCreate = () => { setSelectedId(null); setDrawerMode("create"); setDrawerOpen(true); };
  const handleRowClick = useCallback((r: IP) => {
    setSelectedId(r.id); setDrawerMode("edit"); setDrawerOpen(true);
  }, []);
  const handleEdit = () => { if (selectedIds.length === 1) { setSelectedId(selectedIds[0]); setDrawerMode("edit"); setDrawerOpen(true); } };
  const handleDelete = () => { if (selectedIds.length) { setPendingIds(selectedIds); clearRef.current = clearSelection; setDeleteOpen(true); } };
  const handleConfirmDelete = useCallback(async () => {
    await Promise.all(pendingIds.map((id) => deleteMut.mutateAsync(id)));
    clearRef.current?.(); clearRef.current = null; setPendingIds([]); setDeleteOpen(false);
  }, [deleteMut, pendingIds]);

  const { getSortProps } = sortCtl;
  const columns = useMemo((): ColumnDef<IP>[] => [
    { id: "select", header: () => null, cell: ({ row }) => <Checkbox checked={selected.has(row.original.id)} onCheckedChange={(c) => toggle(row.original.id, c as boolean)} onClick={(e) => e.stopPropagation()} aria-label="Выбрать" />, size: 40 },
    { accessorKey: "ip_address", header: () => <ColumnHeaderMenu label="IP-адрес" {...getSortProps("ip_address")} />, cell: ({ row }) => <button onClick={() => handleRowClick(row.original)} className="text-left font-medium text-primary hover:underline truncate max-w-[160px] font-mono text-sm">{row.getValue("ip_address")}</button>, size: 160 },
    { accessorKey: "pool_id", header: "Пул", cell: ({ row }) => <span className="font-mono text-xs truncate max-w-[120px] block">{(row.getValue("pool_id") as string).slice(0, 8)}</span>, size: 120 },
    { accessorKey: "vm_id", header: "VM", cell: ({ row }) => { const v = row.original.vm_id; return <span className="font-mono text-xs truncate max-w-[120px] block">{v ? v.slice(0, 8) : "—"}</span>; }, size: 120 },
    { accessorKey: "description", header: "Описание", cell: ({ row }) => <span className="text-sm text-muted-foreground truncate max-w-[200px] block">{row.getValue("description") || "—"}</span>, size: 200 },
    { accessorKey: "created_at", header: () => <ColumnHeaderMenu label="Создан" {...getSortProps("created_at")} />, cell: ({ row }) => <span className="text-xs text-muted-foreground">{new Date(row.getValue("created_at") as string).toLocaleDateString("ru-RU")}</span>, size: 100 },
  ], [selected, toggle, handleRowClick, getSortProps]);

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Поиск по IP…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-[260px] text-sm" /></div>
        <div className="flex-1" />
        <Button size="sm" onClick={handleCreate} className="gap-2"><Plus size={16} />Новый IP</Button>
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
        <VirtualInfiniteTable columns={columns as ColumnDef<unknown>[]} queryKey={["ips", debouncedSearch]} fetchFn={handleFetch} pageSize={20} search={debouncedSearch} sorting={sortCtl.sorting} />
      </div>
      <IPDrawer open={drawerOpen} mode={drawerMode} itemId={selectedId} onClose={() => { setDrawerOpen(false); setSelectedId(null); }} onSaved={() => { setDrawerOpen(false); setSelectedId(null); }} />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Подтверждение удаления</AlertDialogTitle><AlertDialogDescription>{pendingIds.length === 1 ? "Удалить выбранный IP-адрес?" : `Удалить ${pendingIds.length} IP-адресов?`}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setPendingIds([]); setDeleteOpen(false); }}>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleteMut.isPending ? "Удаление…" : "Удалить"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

/* ── IP Drawer ──────────────────────────────────────────────────────────── */
const IPDrawer: React.FC<{ open: boolean; mode: DrawerMode; itemId: string | null; onClose: () => void; onSaved: () => void }> = ({ open, mode, itemId, onClose, onSaved }) => {
  const isCreate = mode === "create";
  const { data: item, isLoading } = useIP(mode === "edit" && itemId ? itemId : undefined);
  const createMut = useCreateIP();
  const updateMut = useUpdateIP(itemId ?? "");
  const { register, handleSubmit, reset, formState: { errors } } = useForm<IPFormValues>({ resolver: zodResolver(ipSchema) as never, defaultValues: IP_EMPTY });

  useEffect(() => { if (open && isCreate) reset(IP_EMPTY); }, [open, isCreate, reset]);
  useEffect(() => {
    if (open && !isCreate && item) reset({ ip_address: item.ip_address, pool_id: item.pool_id, vm_id: item.vm_id ?? "", description: item.description ?? "" });
  }, [open, isCreate, item, reset]);

  const onSubmit = async (v: IPFormValues) => {
    const payload = { ip_address: v.ip_address, pool_id: v.pool_id, vm_id: v.vm_id || null, description: v.description };
    if (isCreate) await createMut.mutateAsync(payload as CreateIPRequest);
    else if (itemId) await updateMut.mutateAsync(payload as UpdateIPRequest);
    onSaved();
  };
  const saving = createMut.isPending || updateMut.isPending;
  const loading = !isCreate && isLoading;

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="h-screen flex flex-col">
        <DrawerHeader className="flex-shrink-0 pb-3 border-b"><DrawerTitle>{isCreate ? "Новый IP-адрес" : "Редактирование IP-адреса"}</DrawerTitle><DrawerDescription>{isCreate ? "Заполните форму" : "Измените поля и сохраните"}</DrawerDescription></DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {loading ? <div className="flex items-center justify-center h-40 gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /><span>Загрузка…</span></div> : (
            <form id="ip-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Field label="IP-адрес *" error={errors.ip_address?.message}><Input {...register("ip_address")} placeholder="192.168.0.1" /></Field>
              <Field label="ID пула *" error={errors.pool_id?.message}><Input {...register("pool_id")} placeholder="ID пула" /></Field>
              <Field label="VM ID (необязательно)"><Input {...register("vm_id")} placeholder="ID виртуальной машины" /></Field>
              <Field label="Описание"><Input {...register("description")} placeholder="Описание" /></Field>
            </form>
          )}
        </div>
        <DrawerFooter className="flex-row justify-end border-t pt-3"><Button variant="ghost" onClick={onClose}>Отмена</Button><Button type="submit" form="ip-form" disabled={saving || loading}>{saving ? "Сохранение…" : "Сохранить"}</Button></DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   Page
   ══════════════════════════════════════════════════════════════════════════ */
export const IpsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("pools");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3 mb-3">
          <Network className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">IP-адреса</h1>
        </div>
        <Tabs tabs={tabList} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        {activeTab === "pools" ? <IPPoolsTab /> : <IPsTab />}
      </div>
    </div>
  );
};
