import { useState } from "react";
import { useCoursesGetManyQuery } from "../../../features/course/course-api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/ui/table";
import { Button } from "#components/ui/button";
import { Badge } from "#components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import CourseCreate from "./components/course-create";
import { useNavigate } from "react-router";

export default function AdminPanelCourses() {
  const nav = useNavigate();
  const [isOpenCourseCreate, setIsOpenCourseCreate] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: coursesRes, isFetching } = useCoursesGetManyQuery({
    pageSize,
    page: currentPage,
  });

  const courses = coursesRes?.items || [];
  const coursesCount = coursesRes?.totalCount || 0;
  const totalPages = Math.ceil(coursesCount / pageSize);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs} ساعت و ${mins} دقیقه`;
    return `${mins} دقیقه`;
  };

  return (
    // 1. h-screen + box-border ensures the container is exactly the viewport height (including padding)
    // 2. overflow-hidden prevents the main browser window from scrolling
    <div className="h-screen box-border flex flex-col gap-4 overflow-hidden p-4 ">
      {/* Header: shrink-0 prevents it from being squished */}
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-2xl font-bold tracking-tight">دوره‌های آموزشی</h2>
        <Button onClick={() => setIsOpenCourseCreate(true)}>افزودن دوره</Button>
      </div>

      {/* Table Container: flex-1 takes remaining space, min-h-0 allows internal scrolling */}
      <div className="flex-1 min-h-0 rounded-md border overflow-auto">
        <Table>
          {/* sticky top-0 keeps the header visible when scrolling the table */}
          <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
            <TableRow>
              <TableHead className="text-start">عنوان و مدرس</TableHead>
              <TableHead className="text-center">تعداد دروس</TableHead>
              <TableHead className="text-center">مدت زمان</TableHead>
              <TableHead className="text-center">وضعیت</TableHead>
              <TableHead className="text-left w-[80px]">عملیات</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  در حال بارگذاری...
                </TableCell>
              </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  دوره‌ای یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="font-medium">{course.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {course.lecturer}
                      {course.lecturerProfession
                        ? ` • ${course.lecturerProfession}`
                        : ""}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    {course.totalContents} عدد
                  </TableCell>

                  <TableCell className="text-center">
                    {formatDuration(course.totalContentsLength)}
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      variant={course.isPublished ? "default" : "secondary"}
                    >
                      {course.isPublished ? "انتشار یافته" : "پیش‌نویس"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-left">
                    <DropdownMenu modal={false}>
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
                          <Pencil className="mr-2 h-4 w-4 " />
                          نمایش
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 text-xs">
                          <Trash2 className="mr-2 h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination: shrink-0 prevents it from being squished */}
      <div className="flex items-center justify-between px-2 shrink-0">
        <p className="text-sm text-muted-foreground">
          {coursesCount > 0
            ? `نمایش ${(currentPage - 1) * pageSize + 1} تا ${Math.min(
                currentPage * pageSize,
                coursesCount,
              )} از ${coursesCount} دوره`
            : "دوره‌ای برای نمایش وجود ندارد"}
        </p>

        <div className="flex items-center space-x-2 space-x-reverse">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isFetching}
          >
            قبلی
            <ChevronRight className="mr-1 h-4 w-4" />
          </Button>

          <span className="text-sm font-medium px-2">
            صفحه {currentPage} از {totalPages || 1}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={
              currentPage === totalPages || isFetching || totalPages === 0
            }
          >
            <ChevronLeft className="ml-1 h-4 w-4" />
            بعدی
          </Button>
        </div>
      </div>

      <CourseCreate
        isOpen={isOpenCourseCreate}
        setIsOpen={setIsOpenCourseCreate}
      />
    </div>
  );
}
