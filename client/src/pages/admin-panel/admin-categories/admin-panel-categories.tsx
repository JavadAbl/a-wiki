import { useState, useMemo } from "react";
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
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
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
  useCategorySetOrdersMutation,
} from "../../../features/course/course-api";
import CategoryUpdate from "./components/category-update";
import type { CategoryDto } from "../../../features/course/dto/category.dto";
import { ConfirmModal } from "#components/modals/confirm-modal";
import { toast } from "sonner";
import { cn } from "#lib/utils";
import { useDebounce } from "#hooks/use-debounce";

export default function AdminPanelCategories() {
  const [isOpenCategoryCreate, setIsOpenCategoryCreate] = useState(false);
  const [selectedCategoryForUpdate, setSelectedCategoryForUpdate] =
    useState<CategoryDto | null>(null);
  const [selectedCategoryForDelete, setSelectedCategoryForDelete] =
    useState<CategoryDto | null>(null);
  const [modalKeys, setModalsKey] = useState(0);

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  const increaseModalsKey = () => {
    setModalsKey((val) => val + 1);
  };

  // Data Hooks — fetch all categories (pagination removed for drag-and-drop ordering)
  const { data: categoriesRes, isFetching } = useCategoryGetManyQuery({
    pageSize: 1000,
  });

  const [mutateDelete, { isLoading: isLoadingDelete }] =
    useCategoryDeleteByIdMutation();
  const [mutateSetOrders] = useCategorySetOrdersMutation();

  const categories = useMemo(
    () => categoriesRes?.items || [],
    [categoriesRes],
  );

  const visibleCategories = useMemo(
    () =>
      debouncedSearch
        ? categories.filter((c) => c.name.includes(debouncedSearch))
        : categories,
    [categories, debouncedSearch],
  );

  const handleDelete = async () => {
    if (!selectedCategoryForDelete) return;
    const res = await mutateDelete(selectedCategoryForDelete.id);
    if (!res.error) setSelectedCategoryForDelete(null);
  };

  // ---------- Drag-and-drop reorder ----------
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = visibleCategories.findIndex(
      (c) => String(c.id) === String(active.id),
    );
    const newIndex = visibleCategories.findIndex(
      (c) => String(c.id) === String(over.id),
    );
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(visibleCategories, oldIndex, newIndex);

    // Optimistic cache update + persistence happen inside the mutation hook
    const res = await mutateSetOrders({
      orders: reordered.map((c, index) => ({ id: c.id, order: index + 1 })),
    });

    if (res.error) {
      toast.error("ذخیره ترتیب ناموفق بود");
    }
  };

  // Column definitions (kept for the drag-list header)
  const headerCells = [
    { id: "order", label: "ترتیب", className: "w-16" },
    { id: "name", label: "نام", className: "" },
    { id: "description", label: "توضیحات", className: "hidden md:table-cell" },
    { id: "actions", label: "عملیات", className: "w-24 text-end" },
  ];

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

        {/* Hint */}
        <p className="text-xs text-muted-foreground shrink-0">
          برای تغییر ترتیب نمایش، ردیف‌ها را با کشیدن دستگیره جابجا کنید.
        </p>

        {/* Reorderable table */}
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

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={visibleCategories.map((c) => String(c.id))}
                strategy={verticalListSortingStrategy}
              >
                <tbody className="divide-y divide-gray-100">
                  {isFetching && categories.length === 0 ? (
                    <tr>
                      <td
                        colSpan={headerCells.length}
                        className="px-4 py-12 text-center text-sm font-medium text-gray-500"
                      >
                        در حال بارگذاری...
                      </td>
                    </tr>
                  ) : visibleCategories.length === 0 ? (
                    <tr>
                      <td
                        colSpan={headerCells.length}
                        className="px-4 py-12 text-center text-sm font-medium text-gray-500"
                      >
                        {"داده ای یافت نشد!"}
                      </td>
                    </tr>
                  ) : (
                    visibleCategories.map((category) => (
                      <SortableRow
                        key={category.id}
                        category={category}
                        onEdit={() => setSelectedCategoryForUpdate(category)}
                        onDelete={() => setSelectedCategoryForDelete(category)}
                      />
                    ))
                  )}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        </div>
      </div>
    </>
  );
}

// ---------- Sortable row ----------
function SortableRow({
  category,
  onEdit,
  onDelete,
}: {
  category: CategoryDto;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(category.id) });

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "transition-colors hover:bg-gray-50",
        isDragging && "opacity-50 bg-blue-50 z-50 relative",
      )}
    >
      <td className="px-4 py-3 text-sm text-gray-700">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="جابجایی ردیف"
          className="cursor-grab touch-none text-gray-400 hover:text-gray-600 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>

      <td className="px-4 py-3 text-sm text-gray-700">
        <div className="font-medium">{category.name}</div>
      </td>

      <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-700">
        <span className="line-clamp-2 max-w-80">
          {category.description || "—"}
        </span>
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
            <DropdownMenuItem
              className="cursor-pointer text-xs"
              onClick={onEdit}
            >
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