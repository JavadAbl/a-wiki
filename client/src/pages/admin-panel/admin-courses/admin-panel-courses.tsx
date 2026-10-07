import { useState, useMemo, useCallback } from "react";
import {
  useCategoryGetManyQuery,
  useCourseDeleteMutation,
  useCourseSetFavoriteMutation,
  useCoursesGetManyAdminQuery,
  useCourseSetOrdersMutation,
} from "../../../features/course/course-api";
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
  ListEndIcon,
  MonitorUpIcon,
  MoreVertical,
  Pencil,
  PlusIcon,
  SearchIcon,
  Star,
  StarOff,
  Trash2,
  XIcon,
} from "lucide-react";
import { useNavigate } from "react-router";
import CourseCreate from "./components/course-create";
import CourseSetPublished from "./components/course-set-published";
import type { CourseDto } from "../../../features/course/dto/course.dto";
import { Badge } from "#components/ui/badge";
import { cn } from "#lib/utils";
import { useDebounce } from "#hooks/use-debounce";
import CourseSetCategory from "./components/course-set-category";
import { ConfirmModal } from "#components/modals/confirm-modal";
import { toast } from "sonner";

export default function AdminPanelCourses() {
  const nav = useNavigate();
  const [isOpenCourseCreate, setIsOpenCourseCreate] = useState(false);
  const [modalKeys, setModalsKey] = useState(0);
  const [selectedCourseForPublish, setSelectedCourseForPublish] =
    useState<CourseDto | null>(null);
  const [selectedCourseForCategory, setSelectedCourseForCategory] =
    useState<CourseDto | null>(null);
  const [selectedCourseForDelete, setSelectedCourseForDelete] =
    useState<CourseDto | null>(null);

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  const increaseModalsKey = () => setModalsKey((v) => v + 1);

  //Data Hooks — fetch all courses (pagination removed for drag-and-drop ordering)
  const { data: coursesRes, isFetching } = useCoursesGetManyAdminQuery({
    pageSize: 1000,
  });
  const courses = useMemo(() => coursesRes?.items || [], [coursesRes]);

  // Courses are sorted by order (then id) on the backend; filter only locally
  const visibleCourses = useMemo(
    () =>
      debouncedSearch
        ? courses.filter(
            (c) =>
              c.title.includes(debouncedSearch) ||
              (c.lecturer && c.lecturer.includes(debouncedSearch)),
          )
        : courses,
    [courses, debouncedSearch],
  );

  const { data: categoriesRes } = useCategoryGetManyQuery({
    pageSize: 1000,
  });
  const categories = categoriesRes?.items || [];

  const [mutateCourseDelete, { isLoading: isLoadingCourseDelete }] =
    useCourseDeleteMutation();

  const [mutateCourseSetFavorite] = useCourseSetFavoriteMutation();
  const [mutateSetOrders] = useCourseSetOrdersMutation();

  const handleCourseSetFavorite = useCallback(
    async (course: CourseDto) => {
      const res = await mutateCourseSetFavorite({
        body: { isFavorite: !course.isFavorite },
        courseId: course.id,
      });
      if (!res.error) {
        toast.success(
          course.isFavorite
            ? `دوره «${course.title}» از پرطرفدارها حذف شد`
            : `دوره «${course.title}» به پرطرفدارها اضافه شد`,
        );
      }
    },
    [mutateCourseSetFavorite],
  );

  const handleCourseDelete = async () => {
    if (!selectedCourseForDelete) return;
    const res = await mutateCourseDelete(selectedCourseForDelete.id);
    if (!res.error) setSelectedCourseForDelete(null);
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

    const oldIndex = visibleCourses.findIndex(
      (c) => String(c.id) === String(active.id),
    );
    const newIndex = visibleCourses.findIndex(
      (c) => String(c.id) === String(over.id),
    );
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(visibleCourses, oldIndex, newIndex);

    // Optimistic cache update + persistence happen inside the mutation hook
    const res = await mutateSetOrders({
      orders: reordered.map((c, index) => ({ id: c.id, order: index + 1 })),
    });

    if (res.error) {
      toast.error("ذخیره ترتیب ناموفق بود");
    }
  };

  // Columns kept for the drag-list header
  const headerCells = [
    { id: "order", label: "ترتیب", className: "w-16" },
    { id: "titleAndLecturer", label: "عنوان و مدرس", className: "" },
    {
      id: "totalContents",
      label: "تعداد دروس",
      className: "hidden lg:table-cell w-28",
    },
    {
      id: "totalContentsLength",
      label: "مدت زمان",
      className: "hidden lg:table-cell w-40",
    },
    { id: "status", label: "وضعیت", className: "hidden md:table-cell w-44" },
    {
      id: "category",
      label: "دسته بندی",
      className: "hidden md:table-cell w-32",
    },
    { id: "actions", label: "عملیات", className: "w-24 text-end" },
  ];

  return (
    <>
      {/* Modals */}
      <CourseCreate
        key={`Create_${modalKeys}`}
        isOpen={isOpenCourseCreate}
        setIsOpen={(open: boolean) => {
          setIsOpenCourseCreate(open);
          increaseModalsKey();
        }}
      />
      <CourseSetPublished
        key={`SetPublished_${modalKeys}`}
        setIsOpen={() => {
          setSelectedCourseForPublish(null);
          increaseModalsKey();
        }}
        course={selectedCourseForPublish}
      />

      <CourseSetCategory
        key={`SetCategory_${modalKeys}`}
        setIsOpen={() => {
          setSelectedCourseForCategory(null);
          increaseModalsKey();
        }}
        course={selectedCourseForCategory}
      />

      <ConfirmModal
        open={!!selectedCourseForDelete}
        onOpenChange={() => setSelectedCourseForDelete(null)}
        onConfirm={handleCourseDelete}
        description={`آیا از حذف دوره ${selectedCourseForDelete?.title} مطمئن هستید؟`}
        destructive
        title="حذف دوره"
        loading={isLoadingCourseDelete}
      />

      <div className="h-full box-border flex flex-col gap-4 overflow-hidden p-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">
              دوره‌های آموزشی
            </h2>

            {/* Search input */}
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="جستجوی دوره..."
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

          <Button onClick={() => setIsOpenCourseCreate(true)}>
            <PlusIcon />
            {" افزودن دوره"}
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
                items={visibleCourses.map((c) => String(c.id))}
                strategy={verticalListSortingStrategy}
              >
                <tbody className="divide-y divide-gray-100">
                  {isFetching && courses.length === 0 ? (
                    <tr>
                      <td
                        colSpan={headerCells.length}
                        className="px-4 py-12 text-center text-sm font-medium text-gray-500"
                      >
                        در حال بارگذاری...
                      </td>
                    </tr>
                  ) : visibleCourses.length === 0 ? (
                    <tr>
                      <td
                        colSpan={headerCells.length}
                        className="px-4 py-12 text-center text-sm font-medium text-gray-500"
                      >
                        {"داده ای یافت نشد!"}
                      </td>
                    </tr>
                  ) : (
                    visibleCourses.map((course) => (
                      <SortableRow
                        key={course.id}
                        course={course}
                        categories={categories}
                        onView={() => nav(`/Admin/Courses/${course.id}`)}
                        onSetPublished={() =>
                          setSelectedCourseForPublish(course)
                        }
                        onSetCategory={() =>
                          setSelectedCourseForCategory(course)
                        }
                        onSetFavorite={() => handleCourseSetFavorite(course)}
                        onDelete={() => setSelectedCourseForDelete(course)}
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
  course,
  categories,
  onView,
  onSetPublished,
  onSetCategory,
  onSetFavorite,
  onDelete,
}: {
  course: CourseDto;
  categories: { id: number; name: string }[];
  onView: () => void;
  onSetPublished: () => void;
  onSetCategory: () => void;
  onSetFavorite: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(course.id) });

  const seconds = course.totalContentsLength;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const durationText =
    hrs > 0 ? `${hrs} ساعت و ${mins} دقیقه` : `${mins} دقیقه`;

  const category = categories.find((cat) => cat.id == course.categoryId);

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
        <div className="font-medium">{course.title}</div>
        <div className="text-sm text-muted-foreground">
          {course.lecturer}
          {course.lecturerProfession ? ` • ${course.lecturerProfession}` : ""}
        </div>
      </td>

      <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-700">
        {course.totalContents + " عدد"}
      </td>

      <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-700">
        {durationText}
      </td>

      <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-700">
        <div className="flex items-center gap-1">
          <Badge
            className={cn("font-normal ")}
            variant={course.isPublished ? "default" : "secondary"}
          >
            {course.isPublished ? "انتشار یافته" : "پیش‌نویس"}
          </Badge>

          {course.isFavorite && (
            <Badge variant="secondary" className="font-normal gap-1">
              <Star className="h-3 w-3 fill-current" />
              پرطرفدار
            </Badge>
          )}
        </div>
      </td>

      <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-700">
        {category ? <span>{category.name}</span> : null}
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
              onClick={onView}
            >
              <Pencil className="mr-2 h-4 w-4" />
              نمایش
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer text-xs"
              onClick={onSetPublished}
            >
              <MonitorUpIcon className="mr-2 h-4 w-4" />
              تغییر وضعیت انتشار
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer text-xs"
              onClick={onSetCategory}
            >
              <ListEndIcon className="mr-2 h-4 w-4" />
              تغییر دسته بندی
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer text-xs"
              onClick={onSetFavorite}
            >
              {course.isFavorite ? (
                <StarOff className="mr-2 h-4 w-4" />
              ) : (
                <Star className="mr-2 h-4 w-4" />
              )}
              {course.isFavorite
                ? "حذف از پرطرفدارها"
                : "افزودن به پرطرفدارها"}
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
