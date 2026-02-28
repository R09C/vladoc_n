/**
 * ProjectsPage — CRUD-страница проектов и ресурсов проектов.
 * Две вкладки: Проекты | Ресурсы проектов.
 * Infinite-scroll таблицы, Drawer-формы, диалоги удаления.
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Tabs } from "@/shared/ui/tabs";
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
import { Plus, FolderKanban, Search, Loader2, List, Pencil, Trash2 } from "lucide-react";
import {
  useProject, useCreateProject, useUpdateProject, useDeleteProject,
  useProjectResource, useCreateProjectResource, useUpdateProjectResource, useDeleteProjectResource,
} from "@/entities/project";
import type {
  Project, ProjectResource,
  CreateProjectRequest, UpdateProjectRequest,
  CreateProjectResourceRequest, UpdateProjectResourceRequest,
  ProjectFilters,
} from "@/entities/project";
import {
  useDebounce, useColumnSorting, useColumnFilters, customFilter,
} from "@/shared";
import type { FilterDescriptors } from "@/shared/lib/hooks/useColumnFilters";
import type { InfiniteScrollParams, InfiniteScrollResponse } from "@/shared/api/types";
import { getProjectsListMock, getProjectResourcesListMock } from "@/shared/api/mocks/project.mock";
import { RESOURCE_NAME_PREFIX } from "@/shared/config/enums";

/* ── Shared Field helper ────────────────────────────────────────────────── */
const Field: React.FC<{
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, error, required, children }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-muted-foreground">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

/* ── Types & Schemas ────────────────────────────────────────────────────── */
type DrawerMode = "create" | "edit";

const projectSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  description: z.string().optional().default(""),
  responsible_department: z.string().optional().default(""),
  is_boxed: z.boolean().optional().default(false),
  domain_id: z.string().nullable().optional(),
});
type ProjectFormValues = z.infer<typeof projectSchema>;
const PROJECT_EMPTY: ProjectFormValues = {
  name: "",
  description: "",
  responsible_department: "",
  is_boxed: false,
  domain_id: null,
};

const resourceSchema = z.object({
  name: z.string().optional().default(""),
  vm_id: z.string().min(1, "Укажите ВМ"),
  project_id: z.string().min(1, "Укажите проект"),
});
type ResourceFormValues = z.infer<typeof resourceSchema>;
const RESOURCE_EMPTY: ResourceFormValues = { name: "", vm_id: "", project_id: "" };

const tabList = [
  { id: "projects", label: "Проекты" },
  { id: "resources", label: "Ресурсы проектов" },
];

/* ── Filter descriptors for Projects ────────────────────────────────────── */
const projectFilterDescriptors: FilterDescriptors<ProjectFilters> = {
  is_boxed: customFilter<ProjectFilters>({
    options: [
      { value: "true", label: "Да" },
      { value: "false", label: "Нет" },
    ],
    exclusive: true,
    toFilter: (vals) => ({
      is_boxed: vals.includes("true") ? true : vals.includes("false") ? false : undefined,
    }),
    fromFilter: (f) => {
      if (f.is_boxed === true) return ["true"];
      if (f.is_boxed === false) return ["false"];
      return [];
    },
  }),
};

/* ══════════════════════════════════════════════════════════════════════════
   Projects Tab
   ══════════════════════════════════════════════════════════════════════════ */
const ProjectsTab: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const clearRef = useRef<(() => void) | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const sortCtl = useColumnSorting();
  const filterCtl = useColumnFilters<ProjectFilters>(projectFilterDescriptors);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle = useCallback((id: string, on: boolean) => {
    setSelected((p) => { const n = new Set(p); if (on) n.add(id); else n.delete(id); return n; });
  }, []);
  const selectedIds = useMemo(() => [...selected], [selected]);
  const clearSelection = useCallback(() => setSelected(new Set()), []);
  const deleteMut = useDeleteProject();

  const effectiveFilters: ProjectFilters = useMemo(
    () => ({ ...filterCtl.filters }),
    [filterCtl.filters],
  );

  const handleFetch = useCallback(
    async (p: InfiniteScrollParams): Promise<InfiniteScrollResponse<Project>> =>
      getProjectsListMock(p.offset, p.limit, p.sortBy, p.sortOrder, debouncedSearch, effectiveFilters),
    [debouncedSearch, effectiveFilters],
  );

  const handleCreate = () => { setSelectedId(null); setDrawerMode("create"); setDrawerOpen(true); };
  const handleRowClick = useCallback((r: Project) => {
    setSelectedId(r.id); setDrawerMode("edit"); setDrawerOpen(true);
  }, []);
  const handleEdit = () => { if (selectedIds.length === 1) { setSelectedId(selectedIds[0]); setDrawerMode("edit"); setDrawerOpen(true); } };
  const handleDelete = () => { if (selectedIds.length) { setPendingIds(selectedIds); clearRef.current = clearSelection; setDeleteOpen(true); } };
  const handleConfirmDelete = useCallback(async () => {
    await Promise.all(pendingIds.map((id) => deleteMut.mutateAsync(id)));
    clearRef.current?.(); clearRef.current = null; setPendingIds([]); setDeleteOpen(false);
  }, [deleteMut, pendingIds]);

  const { getSortProps } = sortCtl;
  const { getFilterProps } = filterCtl;
  const columns = useMemo((): ColumnDef<Project>[] => [
    { id: "select", header: () => null, cell: ({ row }) => <Checkbox checked={selected.has(row.original.id)} onCheckedChange={(c) => toggle(row.original.id, c as boolean)} onClick={(e) => e.stopPropagation()} aria-label="Выбрать" />, size: 40 },
    { accessorKey: "name", header: () => <ColumnHeaderMenu label="Имя" {...getSortProps("name")} />, cell: ({ row }) => <button onClick={() => handleRowClick(row.original)} className="text-left font-medium text-primary hover:underline truncate max-w-[200px]">{row.getValue("name")}</button>, size: 180 },
    { accessorKey: "description", header: "Описание", cell: ({ row }) => <span className="text-sm text-muted-foreground truncate max-w-[250px] block">{row.getValue("description") || "—"}</span>, size: 250 },
    { accessorKey: "responsible_department", header: "Ответственный отдел", cell: ({ row }) => <span className="text-sm truncate max-w-[180px] block">{row.getValue("responsible_department") || "—"}</span>, size: 180 },
    { accessorKey: "is_boxed", header: () => <ColumnHeaderMenu label="Коробочное решение" {...getFilterProps("is_boxed")} />, cell: ({ row }) => <Badge variant={row.original.is_boxed ? "default" : "secondary"}>{row.original.is_boxed ? "Да" : "Нет"}</Badge>, size: 140 },
    { accessorKey: "domain_id", header: "Домен", cell: ({ row }) => { const d = row.original.domain_id; return <span className="font-mono text-xs truncate max-w-[120px] block">{d ? d.slice(0, 8) : "—"}</span>; }, size: 120 },
    { accessorKey: "created_at", header: () => <ColumnHeaderMenu label="Создан" {...getSortProps("created_at")} />, cell: ({ row }) => <span className="text-xs text-muted-foreground">{new Date(row.getValue("created_at") as string).toLocaleDateString("ru-RU")}</span>, size: 100 },
  ], [selected, toggle, handleRowClick, getSortProps, getFilterProps]);

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Поиск по имени…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-[260px] text-sm" /></div>
        <div className="flex-1" />
        <Button size="sm" onClick={handleCreate} className="gap-2"><Plus size={16} />Новый проект</Button>
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
        <VirtualInfiniteTable columns={columns as ColumnDef<unknown>[]} queryKey={["projects", debouncedSearch, effectiveFilters]} fetchFn={handleFetch} pageSize={20} search={debouncedSearch} sorting={sortCtl.sorting} />
      </div>
      <ProjectDrawer open={drawerOpen} mode={drawerMode} itemId={selectedId} onClose={() => { setDrawerOpen(false); setSelectedId(null); }} onSaved={() => { setDrawerOpen(false); setSelectedId(null); }} />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Подтверждение удаления</AlertDialogTitle><AlertDialogDescription>{pendingIds.length === 1 ? "Удалить выбранный проект?" : `Удалить ${pendingIds.length} проектов?`}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setPendingIds([]); setDeleteOpen(false); }}>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleteMut.isPending ? "Удаление…" : "Удалить"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

/* ── Project Drawer ─────────────────────────────────────────────────────── */
const ProjectDrawer: React.FC<{ open: boolean; mode: DrawerMode; itemId: string | null; onClose: () => void; onSaved: () => void }> = ({ open, mode, itemId, onClose, onSaved }) => {
  const isCreate = mode === "create";
  const { data: item, isLoading } = useProject(mode === "edit" && itemId ? itemId : undefined);
  const createMut = useCreateProject();
  const updateMut = useUpdateProject(itemId ?? "");
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ProjectFormValues>({ resolver: zodResolver(projectSchema) as never, defaultValues: PROJECT_EMPTY });

  useEffect(() => { if (open && isCreate) reset(PROJECT_EMPTY); }, [open, isCreate, reset]);
  useEffect(() => {
    if (open && !isCreate && item) reset({
      name: item.name,
      description: item.description ?? "",
      responsible_department: item.responsible_department ?? "",
      is_boxed: item.is_boxed ?? false,
      domain_id: item.domain_id ?? null,
    });
  }, [open, isCreate, item, reset]);

  const onSubmit = async (v: ProjectFormValues) => {
    const payload = {
      name: v.name,
      description: v.description,
      responsible_department: v.responsible_department,
      is_boxed: v.is_boxed,
      domain_id: v.domain_id || null,
    };
    if (isCreate) await createMut.mutateAsync(payload as CreateProjectRequest);
    else if (itemId) await updateMut.mutateAsync(payload as UpdateProjectRequest);
    onSaved();
  };
  const saving = createMut.isPending || updateMut.isPending;
  const loading = !isCreate && isLoading;

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="h-screen flex flex-col">
        <DrawerHeader className="flex-shrink-0 pb-3 border-b"><DrawerTitle>{isCreate ? "Новый проект" : "Редактирование проекта"}</DrawerTitle><DrawerDescription>{isCreate ? "Заполните форму" : "Измените поля и сохраните"}</DrawerDescription></DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {loading ? <div className="flex items-center justify-center h-40 gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /><span>Загрузка…</span></div> : (
            <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Field label="Имя" error={errors.name?.message} required>
                <Input {...register("name")} placeholder="Название проекта" />
              </Field>
              <Field label="Описание" error={errors.description?.message}>
                <Input {...register("description")} placeholder="Описание" />
              </Field>
              <Field label="Ответственный отдел" error={errors.responsible_department?.message}>
                <Input {...register("responsible_department")} placeholder="Отдел" />
              </Field>
              <Controller
                name="is_boxed"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="is_boxed"
                      checked={!!field.value}
                      onCheckedChange={(c) => field.onChange(!!c)}
                    />
                    <label htmlFor="is_boxed" className="text-sm">Коробочное решение</label>
                  </div>
                )}
              />
              <Field label="ID домена (необязательно)" error={errors.domain_id?.message}>
                <Input {...register("domain_id")} placeholder="UUID домена" />
              </Field>
            </form>
          )}
        </div>
        <DrawerFooter className="flex-row justify-end border-t pt-3"><Button variant="ghost" onClick={onClose}>Отмена</Button><Button type="submit" form="project-form" disabled={saving || loading}>{saving ? "Сохранение…" : "Сохранить"}</Button></DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   Project Resources Tab
   ══════════════════════════════════════════════════════════════════════════ */
const ProjectResourcesTab: React.FC = () => {
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
  const deleteMut = useDeleteProjectResource();

  const handleFetch = useCallback(
    async (p: InfiniteScrollParams): Promise<InfiniteScrollResponse<ProjectResource>> =>
      getProjectResourcesListMock(p.offset, p.limit, p.sortBy, p.sortOrder, debouncedSearch),
    [debouncedSearch],
  );

  const handleCreate = () => { setSelectedId(null); setDrawerMode("create"); setDrawerOpen(true); };
  const handleRowClick = useCallback((r: ProjectResource) => {
    setSelectedId(r.id); setDrawerMode("edit"); setDrawerOpen(true);
  }, []);
  const handleEdit = () => { if (selectedIds.length === 1) { setSelectedId(selectedIds[0]); setDrawerMode("edit"); setDrawerOpen(true); } };
  const handleDelete = () => { if (selectedIds.length) { setPendingIds(selectedIds); clearRef.current = clearSelection; setDeleteOpen(true); } };
  const handleConfirmDelete = useCallback(async () => {
    await Promise.all(pendingIds.map((id) => deleteMut.mutateAsync(id)));
    clearRef.current?.(); clearRef.current = null; setPendingIds([]); setDeleteOpen(false);
  }, [deleteMut, pendingIds]);

  const { getSortProps } = sortCtl;
  const columns = useMemo((): ColumnDef<ProjectResource>[] => [
    { id: "select", header: () => null, cell: ({ row }) => <Checkbox checked={selected.has(row.original.id)} onCheckedChange={(c) => toggle(row.original.id, c as boolean)} onClick={(e) => e.stopPropagation()} aria-label="Выбрать" />, size: 40 },
    { accessorKey: "name", header: () => <ColumnHeaderMenu label="Имя" {...getSortProps("name")} />, cell: ({ row }) => <button onClick={() => handleRowClick(row.original)} className="text-left font-medium text-primary hover:underline truncate max-w-[200px]">{row.getValue("name")}</button>, size: 180 },
    { accessorKey: "vm_id", header: "VM", cell: ({ row }) => <span className="font-mono text-xs truncate max-w-[120px] block">{(row.getValue("vm_id") as string).slice(0, 8)}</span>, size: 120 },
    { accessorKey: "project_id", header: "Проект", cell: ({ row }) => <span className="font-mono text-xs truncate max-w-[120px] block">{(row.getValue("project_id") as string).slice(0, 8)}</span>, size: 120 },
    { accessorKey: "created_at", header: () => <ColumnHeaderMenu label="Создан" {...getSortProps("created_at")} />, cell: ({ row }) => <span className="text-xs text-muted-foreground">{new Date(row.getValue("created_at") as string).toLocaleDateString("ru-RU")}</span>, size: 100 },
  ], [selected, toggle, handleRowClick, getSortProps]);

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Поиск по имени…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-[260px] text-sm" /></div>
        <div className="flex-1" />
        <Button size="sm" onClick={handleCreate} className="gap-2"><Plus size={16} />Новый ресурс</Button>
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
        <VirtualInfiniteTable columns={columns as ColumnDef<unknown>[]} queryKey={["projectResources", debouncedSearch]} fetchFn={handleFetch} pageSize={20} search={debouncedSearch} sorting={sortCtl.sorting} />
      </div>
      <ProjectResourceDrawer open={drawerOpen} mode={drawerMode} itemId={selectedId} onClose={() => { setDrawerOpen(false); setSelectedId(null); }} onSaved={() => { setDrawerOpen(false); setSelectedId(null); }} />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Подтверждение удаления</AlertDialogTitle><AlertDialogDescription>{pendingIds.length === 1 ? "Удалить выбранный ресурс?" : `Удалить ${pendingIds.length} ресурсов?`}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setPendingIds([]); setDeleteOpen(false); }}>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleteMut.isPending ? "Удаление…" : "Удалить"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

/* ── Project Resource Drawer ────────────────────────────────────────────── */
const ProjectResourceDrawer: React.FC<{ open: boolean; mode: DrawerMode; itemId: string | null; onClose: () => void; onSaved: () => void }> = ({ open, mode, itemId, onClose, onSaved }) => {
  const isCreate = mode === "create";
  const { data: item, isLoading } = useProjectResource(mode === "edit" && itemId ? itemId : undefined);
  const createMut = useCreateProjectResource();
  const updateMut = useUpdateProjectResource(itemId ?? "");
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ResourceFormValues>({ resolver: zodResolver(resourceSchema) as never, defaultValues: RESOURCE_EMPTY });

  useEffect(() => { if (open && isCreate) reset(RESOURCE_EMPTY); }, [open, isCreate, reset]);
  useEffect(() => {
    if (open && !isCreate && item) reset({
      name: item.name ?? "",
      vm_id: item.vm_id,
      project_id: item.project_id,
    });
  }, [open, isCreate, item, reset]);

  const onSubmit = async (v: ResourceFormValues) => {
    const payload = {
      name: v.name || undefined,
      vm_id: v.vm_id,
      project_id: v.project_id,
    };
    if (isCreate) await createMut.mutateAsync(payload as CreateProjectResourceRequest);
    else if (itemId) await updateMut.mutateAsync(payload as UpdateProjectResourceRequest);
    onSaved();
  };
  const saving = createMut.isPending || updateMut.isPending;
  const loading = !isCreate && isLoading;

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="h-screen flex flex-col">
        <DrawerHeader className="flex-shrink-0 pb-3 border-b"><DrawerTitle>{isCreate ? "Новый ресурс проекта" : "Редактирование ресурса"}</DrawerTitle><DrawerDescription>{isCreate ? "Заполните форму" : "Измените поля и сохраните"}</DrawerDescription></DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {loading ? <div className="flex items-center justify-center h-40 gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /><span>Загрузка…</span></div> : (
            <form id="resource-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Field label="Имя (необязательно, автогенерация)" error={errors.name?.message}>
                <Input {...register("name")} placeholder={`${RESOURCE_NAME_PREFIX.PROJECT_RESOURCE}XX`} />
              </Field>
              <Field label="ID виртуальной машины" error={errors.vm_id?.message} required>
                <Input {...register("vm_id")} placeholder="UUID виртуальной машины" />
              </Field>
              <Field label="ID проекта" error={errors.project_id?.message} required>
                <Input {...register("project_id")} placeholder="UUID проекта" />
              </Field>
            </form>
          )}
        </div>
        <DrawerFooter className="flex-row justify-end border-t pt-3"><Button variant="ghost" onClick={onClose}>Отмена</Button><Button type="submit" form="resource-form" disabled={saving || loading}>{saving ? "Сохранение…" : "Сохранить"}</Button></DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   Page
   ══════════════════════════════════════════════════════════════════════════ */
export const ProjectsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("projects");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3 mb-3">
          <FolderKanban className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Проекты</h1>
        </div>
        <Tabs tabs={tabList} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        {activeTab === "projects" ? <ProjectsTab /> : <ProjectResourcesTab />}
      </div>
    </div>
  );
};
