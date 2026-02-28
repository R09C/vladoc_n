/**
 * VMDrawer — форма создания / редактирования ВМ
 * Принимает vmId, подгружает детальную информацию через useVM(id).
 * Справочники (ОС, шлюзы, DNS-группы) загружаются внутри компонента
 * с кэшированием (staleTime: 10 мин, gcTime: 30 мин).
 */

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  VirtualMachine,
  CreateVMRequest,
  UpdateVMRequest,
} from "@/entities/virtual-machine";
import { useVM, useCreateVM, useUpdateVM } from "@/entities/virtual-machine";
import { useOSList } from "@/entities/operating-system";
import { useGatewayList } from "@/entities/gateway";
import { useObjectGroupList } from "@/entities/object-group";
import { GroupType } from "@/shared/config/enums";
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
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import { Loader2 } from "lucide-react";

/* ── Types ────────────────────────────────────────────────────────────────── */

export type DrawerMode = "edit" | "create";

/* ── Zod schema ───────────────────────────────────────────────────────────── */

const vmSchema = z.object({
  name: z.string().min(3, "Минимум 3 символа"),
  description: z.string().optional().default(""),
  is_closed_circuit: z.boolean().optional().default(false),
  cpu_count: z.coerce.number().min(1, "Минимум 1"),
  ram_size: z.coerce.number().min(1, "Минимум 1 ГБ"),
  swap_size: z.coerce.number().min(0),
  rem_size: z.coerce.number().min(0),
  os_id: z.string().nullable().optional(),
  gateway_id: z.string().nullable().optional(),
  dns_group_id: z.string().nullable().optional(),
});

type VMFormValues = z.infer<typeof vmSchema>;

/* ── Props ────────────────────────────────────────────────────────────────── */

export interface VMDrawerProps {
  open: boolean;
  mode: DrawerMode;
  /** ID ВМ для редактирования (null при создании) */
  vmId?: string | null;
  onClose: () => void;
  onSaved?: () => void;
}

/* ── Defaults ─────────────────────────────────────────────────────────────── */

const EMPTY_FORM: VMFormValues = {
  name: "",
  description: "",
  is_closed_circuit: false,
  cpu_count: 1,
  ram_size: 1,
  swap_size: 0,
  rem_size: 0,
  os_id: null,
  gateway_id: null,
  dns_group_id: null,
};

const vmToForm = (vm: VirtualMachine): VMFormValues => ({
  name: vm.name,
  description: vm.description ?? "",
  is_closed_circuit: vm.is_closed_circuit,
  cpu_count: vm.cpu_count,
  ram_size: vm.ram_size,
  swap_size: vm.swap_size,
  rem_size: vm.rem_size,
  os_id: vm.os_id,
  gateway_id: vm.gateway_id,
  dns_group_id: vm.dns_group_id,
});

/* ── Component ────────────────────────────────────────────────────────────── */

export const VMDrawer: React.FC<VMDrawerProps> = ({
  open,
  mode,
  vmId,
  onClose,
  onSaved,
}) => {
  const isCreate = mode === "create";
  const isEdit = mode === "edit";

  /* ── Справочники (загружаются когда drawer открыт, кэшируются) ── */
  const { data: osList = [] } = useOSList(open);
  const { data: gatewayList = [] } = useGatewayList(open);
  const { data: dnsGroupList = [] } = useObjectGroupList(
    { type: GroupType.NSC },
    open,
  );

  /* ── Load VM by ID (only in edit mode) ── */
  const { data: vm, isLoading: vmLoading } = useVM(
    isEdit && vmId ? vmId : undefined,
  );

  /* ── Mutations ────────────────────────── */
  const createMutation = useCreateVM();
  const updateMutation = useUpdateVM(vmId ?? "");

  /* ── Form ─────────────────────────────── */
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<VMFormValues>({
    resolver: zodResolver(vmSchema) as never,
    defaultValues: EMPTY_FORM,
  });

  // Reset form when drawer opens in create mode, or when VM data arrives in edit mode
  useEffect(() => {
    if (!open) return;
    if (isCreate) {
      reset(EMPTY_FORM);
    }
  }, [open, isCreate, reset]);

  useEffect(() => {
    if (!open || isCreate || !vm) return;
    reset(vmToForm(vm));
  }, [open, isCreate, vm, reset]);

  /* ── Submit ───────────────────────────── */
  const onSubmit = async (values: VMFormValues) => {
    const payload = {
      ...values,
      os_id: values.os_id || null,
      gateway_id: values.gateway_id || null,
      dns_group_id: values.dns_group_id || null,
    };
    if (isCreate) {
      await createMutation.mutateAsync(payload as CreateVMRequest);
    } else if (isEdit && vmId) {
      await updateMutation.mutateAsync(payload as UpdateVMRequest);
    }
    onSaved?.();
    onClose();
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  /* ── Loading state (edit) ─────────────── */
  const showLoading = isEdit && vmLoading;

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="h-screen flex flex-col">
        {/* Header */}
        <DrawerHeader className="flex-shrink-0 pb-3 border-b">
          <DrawerTitle>
            {isCreate ? "Новая виртуальная машина" : "Редактирование ВМ"}
          </DrawerTitle>
          <DrawerDescription>
            {isCreate
              ? "Заполните форму для создания ВМ"
              : "Измените необходимые поля и сохраните"}
          </DrawerDescription>
        </DrawerHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {showLoading ? (
            <div className="flex items-center justify-center h-40 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Загрузка…</span>
            </div>
          ) : (
            <form
              id="vm-form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Name */}
              <Field label="Имя *" error={errors.name?.message}>
                <Input {...register("name")} placeholder="mvm-001" />
              </Field>

              {/* Description */}
              <Field label="Описание">
                <Input
                  {...register("description")}
                  placeholder="Назначение ВМ"
                />
              </Field>

              {/* Resources row */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="CPU *" error={errors.cpu_count?.message}>
                  <Input
                    type="number"
                    {...register("cpu_count", { valueAsNumber: true })}
                  />
                </Field>
                <Field label="RAM, ГБ *" error={errors.ram_size?.message}>
                  <Input
                    type="number"
                    {...register("ram_size", { valueAsNumber: true })}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Swap, ГБ">
                  <Input
                    type="number"
                    {...register("swap_size", { valueAsNumber: true })}
                  />
                </Field>
                <Field label="REM, ГБ">
                  <Input
                    type="number"
                    {...register("rem_size", { valueAsNumber: true })}
                  />
                </Field>
              </div>

              {/* OS */}
              <Field label="Операционная система">
                <Controller
                  name="os_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? "__none__"}
                      onValueChange={(v) =>
                        field.onChange(v === "__none__" ? null : v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="— не выбрана —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— не выбрана —</SelectItem>
                        {osList.map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.name} {o.version}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              {/* Gateway */}
              <Field label="Шлюз (Gateway)">
                <Controller
                  name="gateway_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? "__none__"}
                      onValueChange={(v) =>
                        field.onChange(v === "__none__" ? null : v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="— не выбран —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— не выбран —</SelectItem>
                        {gatewayList.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.ip_address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              {/* DNS Group */}
              <Field label="DNS-группа (NSC)">
                <Controller
                  name="dns_group_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? "__none__"}
                      onValueChange={(v) =>
                        field.onChange(v === "__none__" ? null : v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="— не выбрана —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— не выбрана —</SelectItem>
                        {dnsGroupList.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              {/* Closed circuit */}
              <div className="flex items-center gap-2 pt-1">
                <Controller
                  name="is_closed_circuit"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="closed_circuit"
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(!!v)}
                    />
                  )}
                />
                <label htmlFor="closed_circuit" className="text-sm select-none">
                  Закрытый контур
                </label>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <DrawerFooter className="flex-row justify-end border-t pt-3">
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button
            type="submit"
            form="vm-form"
            disabled={isSaving || showLoading}
          >
            {isSaving ? "Сохранение…" : "Сохранить"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

/* ── Small helpers ────────────────────────────────────────────────────────── */

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

export default VMDrawer;
