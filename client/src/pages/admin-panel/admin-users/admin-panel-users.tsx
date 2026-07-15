import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/ui/table";
import { Button } from "#components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#components/ui/dropdown-menu";
import {
  CheckCircleIcon,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pencil,
} from "lucide-react";
import { cn } from "#lib/utils";
import { useUserGetManyQuery } from "../../../features/user/user-api";
import type { UserDto } from "../../../features/user/dto/user.dto";
import UserCreate from "./components/user-create";
import UserUpdate from "./components/user-update";
import { Badge } from "#components/ui/badge";
import UserSetActive from "./components/user-set-active";

export default function AdminPanelUsers() {
  const [isOpenUserCreate, setIsOpenUserCreate] = useState(false);
  const [selectedUserForUpdate, setSelectedUserForUpdate] =
    useState<UserDto | null>(null);
  const [selectedUserForSetActive, setSelectedUserForSetActive] =
    useState<UserDto | null>(null);
  const [modalKeys, setModalsKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const increaseModalsKey = () => {
    setModalsKey((val) => val + 1);
  };

  //Data Hooks
  const { data: coursesRes, isFetching } = useUserGetManyQuery({
    pageSize,
    page: currentPage,
  });

  const courses = coursesRes?.items || [];
  const coursesCount = coursesRes?.totalCount || 0;
  const totalPages = Math.ceil(coursesCount / pageSize);

  return (
    <>
      <UserCreate
        key={`Create_${modalKeys}`}
        isOpen={isOpenUserCreate}
        setIsOpen={(open: boolean) => {
          setIsOpenUserCreate(open);
          increaseModalsKey();
        }}
      />
      <UserUpdate
        key={`Update_${modalKeys}`}
        user={selectedUserForUpdate}
        close={() => {
          setSelectedUserForUpdate(null);
          increaseModalsKey();
        }}
      />
      <UserSetActive
        key={`SetActive_${modalKeys}`}
        user={selectedUserForSetActive}
        close={() => {
          setSelectedUserForSetActive(null);
          increaseModalsKey();
        }}
      />

      <div>
        <div className="h-screen box-border flex flex-col gap-4 overflow-hidden p-4 ">
          {/* Header: shrink-0 prevents it from being squished */}
          <div className="flex items-center justify-between shrink-0">
            <h2 className="text-2xl font-bold tracking-tight">
              دوره‌های آموزشی
            </h2>
            <Button onClick={() => setIsOpenUserCreate(true)}>
              افزودن دوره
            </Button>
          </div>

          {/* Table Container: flex-1 takes remaining space, min-h-0 allows internal scrolling */}
          <div className="flex-1 min-h-0 rounded-md border overflow-auto">
            <Table>
              {/* sticky top-0 keeps the header visible when scrolling the table */}
              <TableHeader className="sticky top-0 z-10 shadow-sm">
                <TableRow className={cn("flex items-center  bg-surface-200")}>
                  <TableHead className="text-start flex-1"> {"نام"}</TableHead>
                  <TableHead className="text-start flex-1">
                    {"نام خانوادگی"}
                  </TableHead>
                  <TableHead className="text-start flex-1">
                    {"موبایل"}
                  </TableHead>
                  <TableHead className="text-start flex-1">{"وضعیت"}</TableHead>
                  <TableHead className="text-left w-[80px] flex-1">
                    عملیات
                  </TableHead>
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
                  courses.map((user) => (
                    <TableRow
                      className={cn("flex items-center")}
                      key={`courses_${user.id}`}
                    >
                      <TableCell className={cn("flex-1")}>
                        {user.firstName}
                      </TableCell>

                      <TableCell className=" flex-1">{user.lastName}</TableCell>

                      <TableCell className=" flex-1">{user.mobile}</TableCell>

                      <TableCell className="flex-1">
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                        >
                          {user.isActive ? "فعال" : "غیر فعال"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-left flex-1">
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">باز کردن منو</span>
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              className="cursor-pointer text-xs"
                              onClick={() => setSelectedUserForUpdate(user)}
                            >
                              <Pencil className="mr-2 h-4 w-4 " />
                              ویرایش
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 text-xs"
                              onClick={() => setSelectedUserForSetActive(user)}
                            >
                              <CheckCircleIcon className="mr-2 h-4 w-4" />
                              تغییر وضعیت
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
        </div>
      </div>
    </>
  );
}
