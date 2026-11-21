import { useState } from "react";
import { Button } from "#components/ui/button";
import { Switch } from "#components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#components/ui/dropdown-menu";
import { Building2, MoreVertical, Pencil, PlusIcon, Trash2 } from "lucide-react";
import TenantCreate from "./components/tenant-create";
import TenantUpdate from "./components/tenant-update";
import type { TenantDto } from "../../../features/tenant/dto/tenant.dto";
import { ConfirmModal } from "#components/modals/confirm-modal";
import {
  useTenantDeleteMutation,
  useTenantSetActiveMutation,
  useTenantsGetManyQuery,
} from "../../../features/tenant/tenant-api";
import { toast } from "sonner";
import { cn } from "#lib/utils";
import { toAbsoluteAssetUrl } from "../../../features/base-api";
import { storage } from "../../../utils/storage";

/// SuperAdmin page: manage the tenant instances of the platform
export default function AdminPanelTenants() {
  const [isOpenTenantCreate, setIsOpenTenantCreate] = useState(false);
  const [selectedTenantForUpdate, setSelectedTenantForUpdate] =
    useState<TenantDto | null>(null);
  const [selectedTenantForDelete, setSelectedTenantForDelete] =
    useState<TenantDto | null>(null);
  const [modalKeys, setModalsKey] = useState(0);

  const increaseModalsKey = () => setModalsKey((v) => v + 1);

  const { data: tenants, isFetching } = useTenantsGetManyQuery();

  const [mutateTenantDelete, { isLoading: isLoadingTenantDelete }] =
    useTenantDeleteMutation();
  const [mutateTenantSetActive] = useTenantSetActiveMutation();

  const handleTenantDelete = async () => {
    if (!selectedTenantForDelete) return;
    const res = await mutateTenantDelete(selectedTenantForDelete.id);
    if (!res.error) {
      toast.success("نمونه حذف شد");
      setSelectedTenantForDelete(null);
    }
  };

  const handleSetActive = async (tenant: TenantDto, isActive: boolean) => {
    const res = await mutateTenantSetActive({ tenantId: tenant.id, isActive });
    if (!res.error && !isActive) {
      const current = storage.getTenant();
      if (current?.id === tenant.id) {
        toast.warning("نمونه فعلی غیرفعال شد");
      }
    }
  };

  const headerCells = [
    { id: "tenant", label: "نمونه", className: "" },
    { id: "slug", label: "شناسه", className: "hidden md:table-cell" },
    { id: "order", label: "ترتیب", className: "w-20" },
    { id: "active", label: "فعال", className: "w-20" },
    { id: "actions", label: "عملیات", className: "w-24 text-end" },
  ];

  return (
    <>
      {/* Modals */}
      <TenantCreate
        key={`TenantCreate_${modalKeys}`}
        isOpen={isOpenTenantCreate}
        setIsOpen={(open: boolean) => {
          setIsOpenTenantCreate(open);
          increaseModalsKey();
        }}
      />

      <TenantUpdate
        key={`TenantUpdate_${modalKeys}`}
        isOpen={!!selectedTenantForUpdate}
        setIsOpen={() => {
          setSelectedTenantForUpdate(null);
          increaseModalsKey();
        }}
        tenant={selectedTenantForUpdate}
      />

      <ConfirmModal
        open={!!selectedTenantForDelete}
        onOpenChange={() => setSelectedTenantForDelete(null)}
        onConfirm={handleTenantDelete}
        description={`آیا از حذف نمونه «${selectedTenantForDelete?.name}» مطمئن هستید؟ حذف تنها زمانی ممکن است که نمونه هیچ کاربر یا محتوایی نداشته باشد.`}
        destructive
        title="حذف نمونه"
        loading={isLoadingTenantDelete}
      />

      <div className="h-full box-border flex flex-col gap-4 overflow-hidden p-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">سامانه‌ها</h2>
          </div>

          <Button onClick={() => setIsOpenTenantCreate(true)}>
            <PlusIcon />
            {" افزودن نمونه"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground shrink-0">
          هر نمونه یک فضای مستقل با کاربران، دوره‌ها و محتوای خودش است. نمونه‌های
          غیرفعال در صفحه انتخاب نمایش داده نمی‌شوند.
        </p>

        {/* Table */}
        <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-gray-100 bg-white shadow-md">
          <table className="min-w-full table-fixed border-collapse text-left">
            <thead className="border-b border-gray-200">
              <tr className="bg-gray-50/80">
                {headerCells.map((cell, index) => (
                  <th
                    key={cell.id}
                    className={cn(
                      "sticky top-0 z-10 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 whitespace-nowrap",
                      index === headerCells.length - 1
                        ? "text-end"
                        : "text-start",
                      cell.className,
                    )}
                  >
                    {cell.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isFetching && (!tenants || tenants.length === 0) ? (
                <tr>
                  <td
                    colSpan={headerCells.length}
                    className="px-4 py-12 text-center text-sm font-medium text-gray-500"
                  >
                    در حال بارگذاری...
                  </td>
                </tr>
              ) : !tenants || tenants.length === 0 ? (
                <tr>
                  <td
                    colSpan={headerCells.length}
                    className="px-4 py-12 text-center text-sm font-medium text-gray-500"
                  >
                    <Building2 className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    هیچ نمونه‌ای ثبت نشده است.
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <TenantRow
                    key={tenant.id}
                    tenant={tenant}
                    onEdit={() => setSelectedTenantForUpdate(tenant)}
                    onDelete={() => setSelectedTenantForDelete(tenant)}
                    onSetActive={(active) => handleSetActive(tenant, active)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function TenantRow({
  tenant,
  onEdit,
  onDelete,
  onSetActive,
}: {
  tenant: TenantDto;
  onEdit: () => void;
  onDelete: () => void;
  onSetActive: (isActive: boolean) => void;
}) {
  return (
    <tr className="transition-colors hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-700">
        <div className="flex items-center gap-3 min-w-0">
          {tenant.logoUrl ? (
            <img
              src={toAbsoluteAssetUrl(tenant.logoUrl) ?? tenant.logoUrl}
              alt={tenant.name}
              className="h-9 w-9 rounded-lg object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              {tenant.name.slice(0, 1)}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-medium truncate max-w-60">{tenant.name}</div>
            {tenant.description && (
              <div className="text-xs text-muted-foreground truncate max-w-60">
                {tenant.description}
              </div>
            )}
          </div>
        </div>
      </td>

      <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-700">
        <span dir="ltr" className="text-muted-foreground text-start block max-w-60 truncate">
          {tenant.slug}
        </span>
      </td>

      <td className="px-4 py-3 text-sm text-gray-700">{tenant.order}</td>

      <td className="px-4 py-3 text-sm text-gray-700">
        <Switch
          checked={tenant.isActive}
          onCheckedChange={onSetActive}
          aria-label="فعال/غیرفعال"
        />
      </td>

      <td className="px-4 py-3 text-sm text-gray-700 text-end">
        <DropdownMenu modal={true}>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">باز کردن منو</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="cursor-pointer text-xs" onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              ویرایش
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 text-xs"
              onClick={onDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
