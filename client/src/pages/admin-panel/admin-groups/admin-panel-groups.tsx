import { useEffect, useMemo, useState } from "react";
import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#components/ui/dropdown-menu";
import { MoreVertical, Pencil, PlusIcon, SearchIcon, Trash2, XIcon } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "#hooks/use-debounce";
import { DataGrid } from "#components/grids/data-grid";
import { ConfirmModal } from "#components/modals/confirm-modal";
import { type ColumnDef } from "@tanstack/react-table";
import {
  useGroupDeleteMutation,
  useGroupGetManyQuery,
} from "../../../features/group/group-api";
import type { GroupDto } from "../../../features/group/dto/group.dto";
import GroupForm from "./components/group-form";

export default function AdminPanelGroups() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupDto | null>(null);
  const [selectedGroupForDelete, setSelectedGroupForDelete] = useState<GroupDto | null>(null);
  const [modalKeys, setModalKeys] = useState(0);

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  const increaseModalsKey = () => setModalKeys((val) => val + 1);

  const { data: groupsRes, isFetching } = useGroupGetManyQuery({
    pageSize,
    page: pageIndex,
    search: debouncedSearch ? debouncedSearch : undefined,
  });
  const [mutateDelete, { isLoading: isLoadingDelete }] = useGroupDeleteMutation();

  const groups = groupsRes?.items ?? [];
  const totalCount = groupsRes?.totalCount ?? 0;

  useEffect(() => {
    setPageIndex(1);
  }, [debouncedSearch]);

  const openCreate = () => {
    setSelectedGroup(null);
    setIsFormOpen(true);
    increaseModalsKey();
  };

  const openEdit = (group: GroupDto) => {
    setSelectedGroup(group);
    setIsFormOpen(true);
    increaseModalsKey();
  };

  const handleDelete = async () => {
    if (!selectedGroupForDelete) return;
    const res = await mutateDelete(selectedGroupForDelete.id);
    if (!res.error) setSelectedGroupForDelete(null);
    else toast.error("حذف گروه ناموفق بود");
  };

  const columns = useMemo<ColumnDef<GroupDto>[]>(
    () => [
      {
        id: "name",
        header: "نام گروه",
        cell: ({ row }) => row.original.name,
      },
      {
        id: "description",
        header: "توضیحات",
        cell: ({ row }) => row.original.description ?? "-",
      },
      {
        id: "actions",
        header: "عملیات",
        size: 100,
        cell: ({ row }) => {
          const group = row.original;
          return (
            <DropdownMenu modal={true}>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">باز کردن منو</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem className="cursor-pointer text-xs" onClick={() => openEdit(group)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  ویرایش
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 text-xs"
                  onClick={() => setSelectedGroupForDelete(group)}
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
      <GroupForm
        key={`Form_${modalKeys}`}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedGroup(null);
          increaseModalsKey();
        }}
        group={selectedGroup}
      />
      <ConfirmModal
        open={!!selectedGroupForDelete}
        onOpenChange={(open) => !open && setSelectedGroupForDelete(null)}
        title="حذف گروه"
        description={`آیا از حذف گروه «${selectedGroupForDelete?.name ?? ""}» اطمینان دارید؟ کاربران این گروه بدون محدودیت میشوند.`}
        onConfirm={handleDelete}
        confirmText="حذف"
        destructive
        loading={isLoadingDelete}
      />

      <div className="h-full box-border flex flex-col gap-4 overflow-hidden p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">گروه ها</h2>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="جستجوی گروه..."
                className="h-9 w-56 pr-9 pl-8 text-sm rounded-md bg-background"
              />
              {searchInput && (
                <button
                  type="button"
                  aria-label="پاک کردن جستجو"
                  onClick={() => setSearchInput("")}
                  className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <Button onClick={openCreate}>
            <PlusIcon />
            افزودن گروه
          </Button>
        </div>

        <DataGrid
          mode="server"
          data={groups}
          columns={columns}
          isLoading={isFetching}
          totalCount={totalCount}
          page={pageIndex - 1}
          pageSize={pageSize}
          onPaginationChange={({ page, pageSize }) => {
            if (page !== undefined) setPageIndex(page + 1);
            if (pageSize !== undefined) setPageSize(pageSize);
          }}
          className="flex-1 min-h-0"
          alignLastEnd
        />
      </div>
    </>
  );
}
