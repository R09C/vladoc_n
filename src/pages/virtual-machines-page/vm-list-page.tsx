/**
 * VirtualMachinesListPage — страница списка ВМ
 * Объединяет VMTable (виджет таблицы) и VMDrawer (create / edit).
 * Загружает справочники и пробрасывает их в Drawer.
 */

import React, { useCallback, useRef, useState } from "react";
import { VMTable } from "@/widgets/vm-table";
import {
  VMDrawer,
  type DrawerMode,
} from "@/features/virtual-machines/vm-drawer";
import type { VirtualMachine } from "@/entities/virtual-machine";
import { useBulkDeleteVMs } from "@/entities/virtual-machine";
import { Button } from "@/shared/ui/button";
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
import { Plus } from "lucide-react";

export const VirtualMachinesListPage: React.FC = () => {
  /* ── Drawer state ─────────────────────── */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedVmId, setSelectedVmId] = useState<string | null>(null);

  /* ── Delete confirmation state ────────── */
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const clearSelectionRef = useRef<(() => void) | null>(null);
  /* ── Mutations ────────────────────────── */
  const bulkDelete = useBulkDeleteVMs();

  /* ── Handlers ─────────────────────────── */
  const handleCreate = () => {
    setSelectedVmId(null);
    setDrawerMode("create");
    setDrawerOpen(true);
  };

  /** Row click → open edit drawer */
  const handleRowClick = useCallback((vm: VirtualMachine) => {
    setSelectedVmId(vm.id);
    setDrawerMode("edit");
    setDrawerOpen(true);
  }, []);

  /** Toolbar edit button → open edit drawer for first selected */
  const handleEdit = useCallback((ids: string[]) => {
    if (ids.length === 1) {
      setSelectedVmId(ids[0]);
      setDrawerMode("edit");
      setDrawerOpen(true);
    }
  }, []);

  /** Toolbar delete button → show confirmation dialog */
  const handleDelete = useCallback(
    (ids: string[], clearSelection: () => void) => {
      if (ids.length === 0) return;
      setPendingDeleteIds(ids);
      clearSelectionRef.current = clearSelection;
      setDeleteDialogOpen(true);
    },
    [],
  );

  /** Confirmed deletion */
  const handleConfirmDelete = useCallback(async () => {
    if (pendingDeleteIds.length === 0) return;
    await bulkDelete.mutateAsync(pendingDeleteIds);
    clearSelectionRef.current?.();
    clearSelectionRef.current = null;
    setPendingDeleteIds([]);
    setDeleteDialogOpen(false);
  }, [bulkDelete, pendingDeleteIds]);

  const handleCancelDelete = useCallback(() => {
    setPendingDeleteIds([]);
    setDeleteDialogOpen(false);
  }, []);

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedVmId(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Виртуальные машины</h1>
          <Button size="sm" onClick={handleCreate} className="gap-2">
            <Plus size={16} />
            Новая машина
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        <VMTable
          onRowClick={handleRowClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Drawer */}
      <VMDrawer
        open={drawerOpen}
        mode={drawerMode}
        vmId={selectedVmId}
        onClose={handleDrawerClose}
        onSaved={handleDrawerClose}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeleteIds.length === 1
                ? "Вы уверены, что хотите удалить выбранную виртуальную машину? Это действие пометит её как удалённую."
                : `Вы уверены, что хотите удалить ${pendingDeleteIds.length} виртуальных машин? Это действие пометит их как удалённые.`}
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
              {bulkDelete.isPending ? "Удаление…" : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
