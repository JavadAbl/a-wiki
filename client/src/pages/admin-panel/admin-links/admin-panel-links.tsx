import { useState } from "react";
import { Button } from "#components/ui/button";
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
  Link2,
  MoreVertical,
  Pencil,
  PlusIcon,
  Trash2,
} from "lucide-react";
import LinkCreate from "./components/link-create";
import LinkUpdate from "./components/link-update";
import type { LinkDto } from "../../../features/link/dto/link.dto";
import { ConfirmModal } from "#components/modals/confirm-modal";
import {
  useLinkDeleteMutation,
  useLinksGetManyQuery,
  useLinkSetOrdersMutation,
} from "../../../features/link/link-api";
import { toast } from "sonner";
import { cn } from "#lib/utils";

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
  const [mutateSetOrders] = useLinkSetOrdersMutation();

  const handleLinkDelete = async () => {
    if (!selectedLinkForDelete) return;
    const res = await mutateLinkDelete(selectedLinkForDelete.id);
    if (!res.error) {
      toast.success("لینک حذف شد");
      setSelectedLinkForDelete(null);
    }
  };

  // ---------- Drag-and-drop reorder ----------
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !links) return;

    const oldIndex = links.findIndex((l) => String(l.id) === String(active.id));
    const newIndex = links.findIndex((l) => String(l.id) === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(links, oldIndex, newIndex);

    // Optimistic cache update + persistence happen inside the mutation hook
    const res = await mutateSetOrders({
      orders: reordered.map((l, index) => ({ id: l.id, order: index + 1 })),
    });

    if (res.error) {
      toast.error("ذخیره ترتیب ناموفق بود");
    }
  };

  const headerCells = [
    { id: "order", label: "ترتیب", className: "w-16" },
    { id: "title", label: "عنوان و آدرس", className: "" },
    {
      id: "description",
      label: "توضیحات",
      className: "hidden md:table-cell",
    },
    { id: "actions", label: "عملیات", className: "w-24 text-end" },
  ];

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
                items={(links ?? []).map((l) => String(l.id))}
                strategy={verticalListSortingStrategy}
              >
                <tbody className="divide-y divide-gray-100">
                  {isFetching && (!links || links.length === 0) ? (
                    <tr>
                      <td
                        colSpan={headerCells.length}
                        className="px-4 py-12 text-center text-sm font-medium text-gray-500"
                      >
                        در حال بارگذاری...
                      </td>
                    </tr>
                  ) : !links || links.length === 0 ? (
                    <tr>
                      <td
                        colSpan={headerCells.length}
                        className="px-4 py-12 text-center text-sm font-medium text-gray-500"
                      >
                        <Link2 className="mx-auto mb-2 h-8 w-8 opacity-50" />
                        هیچ لینکی ثبت نشده است.
                      </td>
                    </tr>
                  ) : (
                    links.map((link) => (
                      <SortableRow
                        key={link.id}
                        link={link}
                        onEdit={() => setSelectedLinkForUpdate(link)}
                        onDelete={() => setSelectedLinkForDelete(link)}
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
  link,
  onEdit,
  onDelete,
}: {
  link: LinkDto;
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
  } = useSortable({ id: String(link.id) });

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
        <div className="min-w-0">
          <div className="font-medium truncate max-w-60">
            {link.title || "—"}
          </div>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            className="text-sm text-muted-foreground hover:text-primary truncate block max-w-60 text-start"
          >
            {link.url}
          </a>
        </div>
      </td>

      <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-700">
        <span className="text-sm text-muted-foreground line-clamp-2 max-w-80">
          {link.description || "—"}
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
