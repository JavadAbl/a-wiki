import { useState, useMemo } from "react";
import { Button } from "#components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#components/ui/dropdown-menu";
import { Link2, MoreVertical, Pencil, PlusIcon, Trash2 } from "lucide-react";
import LinkCreate from "./components/link-create";
import LinkUpdate from "./components/link-update";
import type { LinkDto } from "../../../features/link/dto/link.dto";
import { type ColumnDef } from "@tanstack/react-table";
import { DataGrid } from "#components/grids/data-grid";
import { ConfirmModal } from "#components/modals/confirm-modal";
import {
  useLinkDeleteMutation,
  useLinksGetManyQuery,
} from "../../../features/link/link-api";
import { toast } from "sonner";

export default function AdminPanelLinks() {
  const [isOpenLinkCreate, setIsOpenLinkCreate] = useState(false);
  const [selectedLinkForUpdate, setSelectedLinkForUpdate] =
    useState<LinkDto | null>(null);
  const [selectedLinkForDelete, setSelectedLinkForDelete] =
    useState<LinkDto | null>(null);
  const [modalKeys, setModalsKey] = useState(0);

  const increaseModalsKey = () => setModalsKey((v) => v + 1);

  const { data: links, isFetching } = useLinksGetManyQuery();

  const [mutateLinkDelete, { isLoading: isLoadingLinkDelete }] =
    useLinkDeleteMutation();

  const handleLinkDelete = async () => {
    if (!selectedLinkForDelete) return;
    const res = await mutateLinkDelete(selectedLinkForDelete.id);
    if (!res.error) {
      toast.success("لینک حذف شد");
      setSelectedLinkForDelete(null);
    }
  };

  const columns = useMemo<ColumnDef<LinkDto>[]>(
    () => [
      {
        id: "title",
        header: "عنوان و آدرس",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="font-medium truncate max-w-60">
              {row.original.title || "—"}
            </div>
            <a
              href={row.original.url}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="text-sm text-muted-foreground hover:text-primary truncate block max-w-60 text-start"
            >
              {row.original.url}
            </a>
          </div>
        ),
      },
      {
        id: "description",
        header: "توضیحات",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground line-clamp-2 max-w-80">
            {row.original.description || "—"}
          </span>
        ),
      },
      {
        id: "order",
        header: "ترتیب",
        cell: ({ row }) => row.original.order,
      },
      {
        id: "actions",
        header: "عملیات",
        size: 100,
        cell: ({ row }) => {
          const link = row.original;
          return (
            <DropdownMenu modal={true}>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">باز کردن منو</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedLinkForUpdate(link)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  ویرایش
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 text-xs"
                  onClick={() => setSelectedLinkForDelete(link)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      {/* Modals */}
      <LinkCreate
        key={`LinkCreate_${modalKeys}`}
        isOpen={isOpenLinkCreate}
        setIsOpen={(open: boolean) => {
          setIsOpenLinkCreate(open);
          increaseModalsKey();
        }}
      />

      <LinkUpdate
        key={`LinkUpdate_${modalKeys}`}
        isOpen={!!selectedLinkForUpdate}
        setIsOpen={() => {
          setSelectedLinkForUpdate(null);
          increaseModalsKey();
        }}
        link={selectedLinkForUpdate}
      />

      <ConfirmModal
        open={!!selectedLinkForDelete}
        onOpenChange={() => setSelectedLinkForDelete(null)}
        onConfirm={handleLinkDelete}
        description={`آیا از حذف لینک «${
          selectedLinkForDelete?.title || selectedLinkForDelete?.url
        }» مطمئن هستید؟`}
        destructive
        title="حذف لینک"
        loading={isLoadingLinkDelete}
      />

      <div className="h-full box-border flex flex-col gap-4 overflow-hidden p-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">لینک‌ها</h2>
          </div>

          <Button onClick={() => setIsOpenLinkCreate(true)}>
            <PlusIcon />
            {" افزودن لینک"}
          </Button>
        </div>

        <DataGrid
          mode="client"
          data={links ?? []}
          columns={columns}
          isLoading={isFetching}
          className="flex-1 min-h-0"
          alignLastEnd
        />

        {links && links.length === 0 && !isFetching && (
          <div className="flex flex-col items-center justify-center py-10 text-center text-content-tertiary">
            <Link2 className="size-10 mb-2 opacity-50" />
            <span className="text-sm">هیچ لینکی ثبت نشده است.</span>
          </div>
        )}
      </div>
    </>
  );
}