/**
 * ObjectGroupsPage — CRUD-страница групп объектов
 * Фильтрация по типу (NSC, RDC, DBC, BLC, CEPH), поиск, drawer-форма, удаление.
 */

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  useObjectGroupList,
  useObjectGroup,
  useCreateObjectGroup,
  useUpdateObjectGroup,
  useDeleteObjectGroup,
} from "@/entities/object-group";
import type {
  ObjectGroup,
  CreateObjectGroupRequest,
  UpdateObjectGroupRequest,
  ObjectGroupFilters,
} from "@/entities/object-group";
import { GroupType, GROUP_NAME_PREFIX } from "@/shared/config/enums";
import { generateName } from "@/shared/lib/utils/name-generator";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
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
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Boxes, Search, Loader2 } from "lucide-react";

// ─── Zod schema ────────────────────────────────────────────────────────────

const groupSchema = z.object({
  type: z.enum(["NSC", "RDC", "DBC", "BLC", "CEPH"]),
  name: z.string().optional().default(""),
  description: z.string().optional().default(""),
  repo_url: z
    .string()
    .url("Некорректный URL")
    .nullable()
    .optional()
    .or(z.literal("")),
});

type GroupFormValues = z.infer<typeof groupSchema>;

// ─── Type filter options ───────────────────────────────────────────────────

const typeOptions: { value: GroupType | undefined; label: string }[] = [
  { value: undefined, label: "Все" },
  { value: GroupType.NSC, label: "NSC" },
  { value: GroupType.RDC, label: "RDC" },
  { value: GroupType.DBC, label: "DBC" },
  { value: GroupType.BLC, label: "BLC" },
  { value: GroupType.CEPH, label: "CEPH" },
];

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

export const ObjectGroupsPage: React.FC = () => {
  /* ── Filter state ─────────────────────── */
  const [typeFilter, setTypeFilter] = useState<GroupType | undefined>(undefined);
  const [search, setSearch] = useState("");

  const filters = useMemo<ObjectGroupFilters>(
    () => (typeFilter ? { type: typeFilter } : {}),
    [typeFilter],
  );

  /* ── Queries ──────────────────────────── */
  const { data: groups, isLoading } = useObjectGroupList(filters);

  // All groups (unfiltered) for name generation
  const { data: allGroups } = useObjectGroupList(undefined, true);

  /* ── Filtered + searched list ─────────── */
  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        (g.repo_url && g.repo_url.toLowerCase().includes(q)),
    );
  }, [groups, search]);

  /* ── Drawer state ─────────────────────── */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const isEditMode = editId !== null;

  const { data: editGroup } = useObjectGroup(editId ?? undefined);

  /* ── Mutations ────────────────────────── */
  const createMut = useCreateObjectGroup();
  const updateMut = useUpdateObjectGroup(editId ?? "");
  const deleteMut = useDeleteObjectGroup();

  /* ── Delete dialog ────────────────────── */
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  /* ── Form ─────────────────────────────── */
  const form = useForm<GroupFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(groupSchema) as any,
    defaultValues: {
      type: "NSC",
      name: "",
      description: "",
      repo_url: "",
    },
  });

  // Reset form when drawer opens/closes or editing group loads
  useEffect(() => {
    if (!drawerOpen) return;
    if (isEditMode && editGroup) {
      form.reset({
        type: editGroup.type,
        name: editGroup.name,
        description: editGroup.description,
        repo_url: editGroup.repo_url ?? "",
      });
    } else if (!isEditMode) {
      form.reset({
        type: "NSC",
        name: "",
        description: "",
        repo_url: "",
      });
    }
  }, [drawerOpen, isEditMode, editGroup, form]);

  /* ── Handlers ─────────────────────────── */
  const handleCreate = useCallback(() => {
    setEditId(null);
    setDrawerOpen(true);
  }, []);

  const handleRowClick = useCallback((group: ObjectGroup) => {
    setEditId(group.id);
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setEditId(null);
  }, []);

  const handleSubmit = useCallback(
    async (values: GroupFormValues) => {
      if (isEditMode) {
        const payload: UpdateObjectGroupRequest = {
          name: values.name || undefined,
          description: values.description || undefined,
          repo_url: values.repo_url || null,
        };
        await updateMut.mutateAsync(payload);
      } else {
        const existingNames = (allGroups ?? [])
          .filter((g) => g.type === values.type)
          .map((g) => g.name);
        const name =
          values.name ||
          generateName(
            GROUP_NAME_PREFIX[values.type as GroupType],
            existingNames,
          );
        const payload: CreateObjectGroupRequest = {
          type: values.type as GroupType,
          name,
          description: values.description || undefined,
          repo_url: values.repo_url || null,
        };
        await createMut.mutateAsync(payload);
      }
      handleDrawerClose();
    },
    [isEditMode, updateMut, createMut, allGroups, handleDrawerClose],
  );

  const handleDeleteClick = useCallback(() => {
    if (!editId) return;
    setPendingDeleteId(editId);
    setDeleteDialogOpen(true);
  }, [editId]);

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDeleteId) return;
    await deleteMut.mutateAsync(pendingDeleteId);
    setPendingDeleteId(null);
    setDeleteDialogOpen(false);
    handleDrawerClose();
  }, [pendingDeleteId, deleteMut, handleDrawerClose]);

  const handleCancelDelete = useCallback(() => {
    setPendingDeleteId(null);
    setDeleteDialogOpen(false);
  }, []);

  const isMutating = createMut.isPending || updateMut.isPending;

  /* ── Render ───────────────────────────── */
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Boxes className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Группы объектов</h1>
          </div>
          <Button size="sm" onClick={handleCreate} className="gap-2">
            <Plus size={16} />
            Новая группа
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-border bg-card flex flex-wrap items-center gap-3">
        {/* Type filter buttons */}
        <div className="flex items-center gap-1">
          {typeOptions.map((opt) => (
            <Button
              key={opt.label}
              variant={typeFilter === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative ml-auto w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени, описанию…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Нет групп объектов
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>URL репозитория</TableHead>
                <TableHead>Дата создания</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.map((group) => (
                <TableRow
                  key={group.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(group)}
                >
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{group.type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {group.description || "—"}
                  </TableCell>
                  <TableCell className="max-w-[250px] truncate text-xs text-muted-foreground">
                    {group.repo_url || "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(group.created_at).toLocaleDateString("ru-RU")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ── Drawer ──────────────────────────── */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {isEditMode ? "Редактирование группы" : "Новая группа объектов"}
            </DrawerTitle>
            <DrawerDescription>
              {isEditMode
                ? "Измените параметры группы объектов"
                : "Заполните данные для новой группы"}
            </DrawerDescription>
          </DrawerHeader>

          <form
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onSubmit={form.handleSubmit(handleSubmit as any)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-auto px-4 py-4 sm:px-6 space-y-4">
              {/* Type */}
              <Controller
                control={form.control}
                name="type"
                render={({ field, fieldState }) => (
                  <Field
                    label="Тип группы"
                    error={fieldState.error?.message}
                    required
                  >
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isEditMode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NSC">NSC</SelectItem>
                        <SelectItem value="RDC">RDC</SelectItem>
                        <SelectItem value="DBC">DBC</SelectItem>
                        <SelectItem value="BLC">BLC</SelectItem>
                        <SelectItem value="CEPH">CEPH</SelectItem>
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
                  placeholder="Авто (по типу), либо укажите вручную"
                  {...form.register("name")}
                />
              </Field>

              {/* Description */}
              <Field
                label="Описание"
                error={form.formState.errors.description?.message}
              >
                <Input
                  placeholder="Описание группы…"
                  {...form.register("description")}
                />
              </Field>

              {/* Repo URL */}
              <Field
                label="URL репозитория"
                error={form.formState.errors.repo_url?.message}
              >
                <Input
                  placeholder="https://git.example.com/repo"
                  {...form.register("repo_url")}
                />
              </Field>
            </div>

            <DrawerFooter>
              {isEditMode && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteClick}
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
              Вы уверены, что хотите удалить эту группу объектов? Это действие
              нельзя отменить.
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
