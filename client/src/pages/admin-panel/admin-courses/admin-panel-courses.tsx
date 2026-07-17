import { useState, useMemo, useEffect } from "react";
import { useCoursesGetManyAdminQuery } from "../../../features/course/course-api";
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
  MonitorUpIcon,
  MoreVertical,
  Pencil,
  PlusIcon,
  SearchIcon,
  Trash2,
  XIcon,
} from "lucide-react";
import { useNavigate } from "react-router";
import CourseCreate from "./components/course-create";
import CourseSetPublished from "./components/course-set-published";
import type { CourseDto } from "../../../features/course/dto/course.dto";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "#components/ui/badge";
import { cn } from "#lib/utils";
import { DataGrid } from "#components/grids/data-grid";
import { useDebounce } from "#hooks/use-debounce";

export default function AdminPanelCourses() {
  const nav = useNavigate();
  const [isOpenCourseCreate, setIsOpenCourseCreate] = useState(false);
  const [modalKeys, setModalsKey] = useState(0);
  const [selectedCourseForPublish, setSelectedCourseForPublish] =
    useState<CourseDto | null>(null);

  // Server pagination state
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  const increaseModalsKey = () => setModalsKey((v) => v + 1);

  //Data Hooks
  const { data: coursesRes, isFetching } = useCoursesGetManyAdminQuery({
    pageSize,
    page: pageIndex,
    search: debouncedSearch,
  });

  const courses = coursesRes?.items || [];
  const totalCount = coursesRes?.totalCount || 0;

  useEffect(() => {
    const run = () => setPageIndex(1);
    run();
  }, [debouncedSearch]);

  // Column definitions
  const columns = useMemo<ColumnDef<CourseDto>[]>(
    () => [
      {
        id: "titleAndLecturer",
        header: "عنوان و مدرس",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.title}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.lecturer}
              {row.original.lecturerProfession
                ? ` • ${row.original.lecturerProfession}`
                : ""}
            </div>
          </div>
        ),
      },
      {
        id: "totalContents",
        header: "تعداد دروس",
        cell: ({ row }) => row.original.totalContents + " عدد",
      },
      {
        id: "totalContentsLength",
        header: "مدت زمان",
        cell: ({ row }) => {
          const seconds = row.original.totalContentsLength;
          const hrs = Math.floor(seconds / 3600);
          const mins = Math.floor((seconds % 3600) / 60);
          const text =
            hrs > 0 ? `${hrs} ساعت و ${mins} دقیقه` : `${mins} دقیقه`;
          return text;
        },
      },
      {
        id: "status",
        header: "وضعیت",
        cell: ({ row }) => (
          <Badge
            className={cn("font-normal ")}
            variant={row.original.isPublished ? "default" : "secondary"}
          >
            {row.original.isPublished ? "انتشار یافته" : "پیش‌نویس"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "عملیات",
        size: 100,
        cell: ({ row }) => {
          const course = row.original;
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
                  onClick={() => nav(`/Admin/Courses/${course.id}`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  نمایش
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedCourseForPublish(course)}
                >
                  <MonitorUpIcon className="mr-2 h-4 w-4" />
                  تغییر وضعیت انتشار
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 text-xs">
                  <Trash2 className="mr-2 h-4 w-4" />
                  حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [nav],
  );

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

        {/* DataGrid in Server Mode */}
        <DataGrid
          mode="server"
          data={courses}
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
