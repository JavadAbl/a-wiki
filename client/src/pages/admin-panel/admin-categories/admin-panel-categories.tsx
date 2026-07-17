import { useState, useMemo, useEffect } from "react";
import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#components/ui/dropdown-menu";
import {
  MoreVertical,
  Pencil,
  PlusIcon,
  SearchIcon,
  Trash2,
  XIcon,
} from "lucide-react";
import CategoryCreate from "./components/category-create";
import {
  useCategoryDeleteByIdMutation,
  useCategoryGetManyQuery,
} from "../../../features/course/course-api";
import CategoryUpdate from "./components/category-update";
import type { CategoryDto } from "../../../features/course/dto/category.dto";
import { ConfirmModal } from "#components/modals/confirm-modal";
import { type ColumnDef } from "@tanstack/react-table";
import { DataGrid } from "#components/grids/data-grid";
import { useDebounce } from "#hooks/use-debounce";

export default function AdminPanelCategories() {
  const [isOpenCategoryCreate, setIsOpenCategoryCreate] = useState(false);
  const [selectedCategoryForUpdate, setSelectedCategoryForUpdate] =
    useState<CategoryDto | null>(null);
  const [selectedCategoryForDelete, setSelectedCategoryForDelete] =
    useState<CategoryDto | null>(null);
  const [modalKeys, setModalsKey] = useState(0);

  // Server pagination state
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  const increaseModalsKey = () => {
    setModalsKey((val) => val + 1);
  };

  // Data Hooks
  const { data: categoriesRes, isFetching } = useCategoryGetManyQuery({
    pageSize,
    page: pageIndex,
    search: debouncedSearch ? debouncedSearch : undefined,
  });

  const [mutateDelete, { isLoading: isLoadingDelete }] =
    useCategoryDeleteByIdMutation();

  const handleDelete = async () => {
    if (!selectedCategoryForDelete) return;
    const res = await mutateDelete(selectedCategoryForDelete.id);
    if (!res.error) setSelectedCategoryForDelete(null);
  };

  const categories = categoriesRes?.items || [];
  const totalCount = categoriesRes?.totalCount || 0;

  useEffect(() => {
    const run = () => setPageIndex(1);
    run();
  }, [debouncedSearch]);

  // Column definitions
  const columns = useMemo<ColumnDef<CategoryDto>[]>(
    () => [
      {
        id: "name",
        header: "نام",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      },
      {
        id: "description",
        header: "توضیحات",
        cell: ({ row }) => row.original.description,
      },
      {
        id: "actions",
        header: "عملیات",
        size: 100,
        cell: ({ row }) => {
          const category = row.original;
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
                  onClick={() => setSelectedCategoryForUpdate(category)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  ویرایش
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 text-xs"
                  onClick={() => setSelectedCategoryForDelete(category)}
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
      <CategoryCreate
        key={`Create_${modalKeys}`}
        isOpen={isOpenCategoryCreate}
        setIsOpen={(open: boolean) => {
          setIsOpenCategoryCreate(open);
          increaseModalsKey();
        }}
      />
      <CategoryUpdate
        key={`Update_${modalKeys}`}
        category={selectedCategoryForUpdate}
        close={() => {
          setSelectedCategoryForUpdate(null);
          increaseModalsKey();
        }}
      />

      <ConfirmModal
        open={!!selectedCategoryForDelete}
        onOpenChange={() => {
          setSelectedCategoryForDelete(null);
        }}
        title="حذف دسته بندی?"
        description={`آیا از حذف ${selectedCategoryForDelete?.name} مطمئن هستید؟`}
        destructive={true}
        loading={isLoadingDelete}
        onConfirm={handleDelete}
      />

      <div className="h-full box-border flex flex-col gap-4 overflow-hidden p-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">دسته‌بندی‌ها</h2>

            {/* Search input */}
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="جستجوی دسته‌بندی..."
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

          <Button onClick={() => setIsOpenCategoryCreate(true)}>
            <PlusIcon />
            افزودن دسته‌بندی
          </Button>
        </div>

        {/* DataGrid in Server Mode */}
        <DataGrid
          mode="server"
          data={categories}
          columns={columns}
          isLoading={isFetching}
          totalCount={totalCount}
          // Convert 1-based API page to 0-based TanStack Table page
          page={pageIndex - 1}
          pageSize={pageSize}
          // Convert 0-based TanStack Table page back to 1-based API page
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
