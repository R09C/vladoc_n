/**
 * OperatingSystemsPage — CRUD-страница операционных систем.
 * Содержит таблицу с клиентской сортировкой / поиском, Drawer-форму и диалог удаления.
 */

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  useOSList,
  useOS,
  useCreateOS,
  useUpdateOS,
  useDeleteOS,
} from "@/entities/operating-system";
import type {
  OperatingSystem,
  CreateOperatingSystemRequest,
  UpdateOperatingSystemRequest,
} from "@/entities/operating-system";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/shared/ui/table";
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Monitor, Search, Loader2 } from "lucide-react";

/* ── Zod schema ─────────────────────────── */

const osSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  version: z.string().min(1, "Укажите версию"),
});

type OSFormValues = z.infer<typeof osSchema>;

/* ── Types ──────────────────────────────── */

type DrawerMode = "create" | "edit";

type SortField = "name" | "version" | "created_at";
type SortDir = "asc" | "desc";

/* ── Helper component ───────────────────── */

const Field: React.FC<{
  label: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, error, children }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-muted-foreground">{label}</label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

/* ── Page component ─────────────────────── */

export const OperatingSystemsPage: React.FC = () => {
  /* ── Search ───────────────────────────── */
  const [search, setSearch] = useState("");

  /* ── Sort state ───────────────────────── */
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  /* ── Drawer state ─────────────────────── */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /* ── Delete dialog state ──────────────── */
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  /* ── Queries & mutations ──────────────── */
  const { data: operatingSystems = [], isLoading: listLoading } = useOSList();
  const { data: editOS, isLoading: editLoading } = useOS(
    drawerMode === "edit" ? (selectedId ?? undefined) : undefined,
  );

  const createMutation = useCreateOS();
  const updateMutation = useUpdateOS(selectedId ?? "");
  const deleteMutation = useDeleteOS();

  /* ── Form ─────────────────────────────── */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OSFormValues>({
    resolver: zodResolver(osSchema),
    defaultValues: { name: "", version: "" },
  });

  /* Reset form when drawer opens or edit data arrives */
  useEffect(() => {
    if (drawerMode === "create" && drawerOpen) {
      reset({ name: "", version: "" });
    }
  }, [drawerMode, drawerOpen, reset]);

  useEffect(() => {
    if (drawerMode === "edit" && editOS) {
      reset({ name: editOS.name, version: editOS.version });
    }
  }, [drawerMode, editOS, reset]);

  /* ── Filtered & sorted data ───────────── */
  const filteredOS = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = operatingSystems;
    if (q) {
      list = list.filter(
        (os) =>
          os.name.toLowerCase().includes(q) ||
          os.version.toLowerCase().includes(q),
      );
    }
    const sorted = [...list].sort((a, b) => {
      const aVal = a[sortField] ?? "";
      const bVal = b[sortField] ?? "";
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [operatingSystems, search, sortField, sortDir]);

  /* ── Sort handler ─────────────────────── */
  const toggleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir("asc");
      }
    },
    [sortField],
  );

  const sortIndicator = (field: SortField) =>
    sortField === field ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  /* ── Handlers ─────────────────────────── */
  const handleCreate = useCallback(() => {
    setSelectedId(null);
    setDrawerMode("create");
    setDrawerOpen(true);
  }, []);

  const handleRowClick = useCallback((os: OperatingSystem) => {
    setSelectedId(os.id);
    setDrawerMode("edit");
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setSelectedId(null);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setPendingDeleteId(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDeleteId) return;
    await deleteMutation.mutateAsync(pendingDeleteId);
    setPendingDeleteId(null);
    setDeleteDialogOpen(false);
    // close drawer if we deleted the currently-viewed entity
    if (pendingDeleteId === selectedId) {
      setDrawerOpen(false);
      setSelectedId(null);
    }
  }, [deleteMutation, pendingDeleteId, selectedId]);

  const handleCancelDelete = useCallback(() => {
    setPendingDeleteId(null);
    setDeleteDialogOpen(false);
  }, []);

  /* ── Form submit ──────────────────────── */
  const onSubmit = useCallback(
    async (values: OSFormValues) => {
      if (drawerMode === "create") {
        await createMutation.mutateAsync(values as CreateOperatingSystemRequest);
      } else if (selectedId) {
        await updateMutation.mutateAsync(values as UpdateOperatingSystemRequest);
      }
      handleDrawerClose();
    },
    [drawerMode, selectedId, createMutation, updateMutation, handleDrawerClose],
  );

  /* ── Render ───────────────────────────── */
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Операционные системы</h1>
          </div>
          <Button size="sm" onClick={handleCreate} className="gap-2">
            <Plus size={16} />
            Новая ОС
          </Button>
        </div>
      </div>

      {/* Search + Table */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Поиск по названию или версии…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto rounded-md border">
          {listLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOS.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
              {search ? "Ничего не найдено" : "Нет операционных систем"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort("name")}
                  >
                    Наименование{sortIndicator("name")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort("version")}
                  >
                    Версия{sortIndicator("version")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort("created_at")}
                  >
                    Дата создания{sortIndicator("created_at")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOS.map((os) => (
                  <TableRow
                    key={os.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(os)}
                  >
                    <TableCell className="font-medium">{os.name}</TableCell>
                    <TableCell className="font-mono">{os.version}</TableCell>
                    <TableCell>
                      {new Date(os.created_at).toLocaleDateString("ru-RU")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="fixed inset-y-0 right-0 w-full max-w-md border-l">
          <DrawerHeader>
            <DrawerTitle>
              {drawerMode === "create"
                ? "Новая операционная система"
                : "Редактирование ОС"}
            </DrawerTitle>
            <DrawerDescription>
              {drawerMode === "create"
                ? "Заполните данные новой ОС."
                : "Измените данные операционной системы."}
            </DrawerDescription>
          </DrawerHeader>

          {drawerMode === "edit" && editLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4 px-4 pb-4"
            >
              <Field label="Наименование" error={errors.name?.message}>
                <Input
                  placeholder="Ubuntu"
                  {...register("name")}
                />
              </Field>

              <Field label="Версия" error={errors.version?.message}>
                <Input
                  placeholder="22.04"
                  {...register("version")}
                />
              </Field>

              <DrawerFooter className="flex-row gap-2 px-0">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {drawerMode === "create" ? "Создать" : "Сохранить"}
                </Button>

                {drawerMode === "edit" && selectedId && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleDelete(selectedId)}
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
              </DrawerFooter>
            </form>
          )}
        </DrawerContent>
      </Drawer>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить эту операционную систему? Это
              действие нельзя отменить.
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
              {deleteMutation.isPending ? "Удаление…" : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
