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
import {
  CheckCircleIcon,
  MoreVertical,
  Pencil,
  PlusIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { useUserGetManyQuery } from "../../../features/user/user-api";
import type { UserDto } from "../../../features/user/dto/user.dto";
import UserCreate from "./components/user-create";
import UserUpdate from "./components/user-update";
import { Badge } from "#components/ui/badge";
import UserSetActive from "./components/user-set-active";
import { type ColumnDef } from "@tanstack/react-table";
import { DataGrid } from "#components/grids/data-grid";
import { cn } from "#lib/utils";
import { useDebounce } from "#hooks/use-debounce";

export default function AdminPanelUsers() {
  const [isOpenUserCreate, setIsOpenUserCreate] = useState(false);
  const [selectedUserForUpdate, setSelectedUserForUpdate] =
    useState<UserDto | null>(null);
  const [selectedUserForSetActive, setSelectedUserForSetActive] =
    useState<UserDto | null>(null);
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
  const { data: usersRes, isFetching } = useUserGetManyQuery({
    pageSize,
    page: pageIndex,
    search: debouncedSearch ? debouncedSearch : undefined,
  });

  const users = usersRes?.items || [];
  const totalCount = usersRes?.totalCount || 0;

  useEffect(() => {
    const run = () => setPageIndex(1);
    run();
  }, [debouncedSearch]);

  // Column definitions
  const columns = useMemo<ColumnDef<UserDto>[]>(
    () => [
      {
        id: "firstName",
        header: "نام",
        cell: ({ row }) => row.original.firstName,
      },
      {
        id: "lastName",
        header: "نام خانوادگی",
        cell: ({ row }) => row.original.lastName,
      },
      {
        id: "mobile",
        header: "موبایل",
        cell: ({ row }) => row.original.mobile,
      },
      {
        id: "status",
        header: "وضعیت",
        cell: ({ row }) => (
          <Badge
            className={cn("font-normal")}
            variant={row.original.isActive ? "default" : "secondary"}
          >
            {row.original.isActive ? "فعال" : "غیر فعال"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "عملیات",
        size: 100,
        cell: ({ row }) => {
          const user = row.original;
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
                  onClick={() => setSelectedUserForUpdate(user)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
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
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      {/* Modals */}
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

      <div className="h-full box-border flex flex-col gap-4 overflow-hidden p-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">کاربران</h2>

            {/* Search input */}
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="جستجوی کاربر..."
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

          <Button onClick={() => setIsOpenUserCreate(true)}>
            <PlusIcon />
            افزودن کاربر
          </Button>
        </div>

        {/* DataGrid in Server Mode */}
        <DataGrid
          mode="server"
          data={users}
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
