import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
  type RowSelectionState,
  type PaginationState,
} from "@tanstack/react-table";
import { cn } from "#lib/utils";
import type { GetManyQuery } from "../../utils/types";

// ------------------------------------------------------------------
// Props Interfaces (Discriminated Union)
// ------------------------------------------------------------------
interface CommonProps<TData extends object> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  enableSorting?: boolean;
  enableRowSelection?: boolean;
  enableColumnResizing?: boolean;
  stickyColumns?: number;
  isLoading?: boolean;
  alignLastEnd?: boolean;
  onRowSelectionChange?: (selection: RowSelectionState) => void;

  // Custom classNames for main elements
  className?: string;
  tableClassName?: string;
  theadClassName?: string;
  headerRowClassName?: string;
  headerCellClassName?: string;
  tbodyClassName?: string;
  bodyRowClassName?: string;
  bodyCellClassName?: string;
  paginationClassName?: string;
}

interface ClientModeProps<TData extends object> extends CommonProps<TData> {
  mode?: "client";
  initialPageSize?: number;
  totalCount?: never;
  page?: never;
  pageSize?: never;
  onPaginationChange?: never;
}

interface ServerModeProps<TData extends object> extends CommonProps<TData> {
  mode: "server";
  totalCount: number;
  page: number;
  pageSize: number;
  onPaginationChange: (query: GetManyQuery) => void;
  initialPageSize?: never;
}

export type DataGridProps<TData extends object> =
  | ClientModeProps<TData>
  | ServerModeProps<TData>;

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------
export function DataGrid<TData extends object>(props: DataGridProps<TData>) {
  const {
    data,
    columns,
    enableSorting = true,
    enableRowSelection = false,
    enableColumnResizing = false,
    stickyColumns = 0,
    isLoading = false,
    alignLastEnd = false,
    onRowSelectionChange,
    // Destructure custom classNames
    className,
    tableClassName,
    theadClassName,
    headerRowClassName,
    headerCellClassName,
    tbodyClassName,
    bodyRowClassName,
    bodyCellClassName,
    paginationClassName,
  } = props;

  const isServer = props.mode === "server";

  const initialPageSize = !isServer
    ? ((props as ClientModeProps<TData>).initialPageSize ?? 10)
    : 10;

  // ---------- State ----------
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const [clientPagination, setClientPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: initialPageSize,
    });

  const paginationState = isServer
    ? { pageIndex: props.page, pageSize: props.pageSize }
    : clientPagination;

  const pageCount = isServer
    ? Math.ceil(props.totalCount / props.pageSize)
    : undefined;

  // ---------- Handlers ----------
  const handlePaginationChange = (updater: any) => {
    if (isServer) {
      const newState =
        typeof updater === "function" ? updater(paginationState) : updater;
      props.onPaginationChange({
        page: newState.pageIndex,
        pageSize: newState.pageSize,
      });
    } else {
      setClientPagination(updater);
    }
  };

  const handleRowSelectionChange = (updater: any) => {
    setRowSelection((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (onRowSelectionChange) {
        onRowSelectionChange(next);
      }
      return next;
    });
  };

  // ---------- Table Instance ----------
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      pagination: paginationState,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: handleRowSelectionChange,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: !isServer ? getPaginationRowModel() : undefined,
    manualPagination: isServer,
    pageCount: pageCount,
    enableRowSelection,
    enableColumnResizing,
    columnResizeDirection: "rtl",
    columnResizeMode: "onChange",
  });

  const currentPageCount = isServer ? (pageCount ?? 1) : table.getPageCount();
  const displayPageCount = Math.max(1, currentPageCount);

  // ---------- Sticky Helpers ----------
  const isStickyCol = (index: number) =>
    stickyColumns > 0 && index < stickyColumns;
  const isLastStickyCol = (index: number) =>
    stickyColumns > 0 && index === stickyColumns - 1;

  // ---------- Render ----------
  return (
    <div className={cn("flex h-full w-full flex-col", className)}>
      {/* Material Card Container */}
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md">
        {/* Table Scroll Area */}
        <div className="flex-1 overflow-auto">
          <table
            className={cn(
              "min-w-full table-fixed border-collapse text-left",
              tableClassName,
            )}
          >
            {/* Header */}
            <thead className={cn("border-b border-gray-200", theadClassName)}>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className={cn("bg-gray-50/80", headerRowClassName)}
                >
                  {headerGroup.headers.map((header, index) => {
                    const isSorted = header.column.getIsSorted();
                    const isLast = index === headerGroup.headers.length - 1;

                    const stickyActive = isStickyCol(index);
                    const isLastSticky = isLastStickyCol(index);
                    const stickyStyle = stickyActive
                      ? { right: header.getStart() }
                      : {};

                    return (
                      <th
                        key={header.id}
                        style={{ width: header.getSize(), ...stickyStyle }}
                        className={cn(
                          "sticky top-0 z-10 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 whitespace-nowrap",
                          alignLastEnd && isLast ? "text-end" : "text-start",
                          enableColumnResizing && "border-l border-gray-200",
                          stickyActive ? "z-20 bg-gray-50/95" : "bg-gray-50",
                          isLastSticky &&
                            "shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]",
                          headerCellClassName,
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-1",
                            alignLastEnd && isLast
                              ? "justify-end"
                              : "justify-start",
                            header.column.getCanSort() &&
                              "cursor-pointer select-none transition-colors hover:text-gray-900",
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {isSorted === "asc" && (
                            <span className="text-blue-600">↑</span>
                          )}
                          {isSorted === "desc" && (
                            <span className="text-blue-600">↓</span>
                          )}
                        </div>

                        {/* Material Resize Handle */}
                        {enableColumnResizing &&
                          header.column.getCanResize() && (
                            <div
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className={cn(
                                "absolute left-0 top-0 z-30 h-full w-1 cursor-col-resize touch-none select-none",
                                header.column.getIsResizing()
                                  ? "bg-blue-600"
                                  : "bg-gray-300 hover:bg-blue-500",
                              )}
                            />
                          )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            {/* Body */}
            <tbody className={cn("divide-y divide-gray-100", tbodyClassName)}>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-sm font-medium text-gray-500"
                  >
                    در حال بارگذاری...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-sm font-medium text-gray-500"
                  >
                    {"داده ای یافت نشد!"}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "transition-colors duration-150",
                      enableRowSelection && row.getIsSelected()
                        ? "bg-blue-50/50"
                        : "hover:bg-gray-50",
                      bodyRowClassName,
                    )}
                  >
                    {row.getVisibleCells().map((cell, index, array) => {
                      const isLast = index === array.length - 1;

                      const stickyActive = isStickyCol(index);
                      const isLastSticky = isLastStickyCol(index);
                      const stickyStyle = stickyActive
                        ? { right: cell.column.getStart() }
                        : {};

                      return (
                        <td
                          key={cell.id}
                          style={{
                            width: cell.column.getSize(),
                            ...stickyStyle,
                          }}
                          className={cn(
                            "truncate max-w-full px-4 py-3 text-sm text-gray-700",
                            alignLastEnd && isLast ? "text-end" : "text-start",
                            enableColumnResizing && "border-l border-gray-100",
                            stickyActive && "sticky z-10 bg-inherit",
                            isLastSticky &&
                              "shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]",
                            bodyCellClassName,
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Integrated Material Pagination Footer */}
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/50 px-4 py-3",
            paginationClassName,
          )}
        >
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <span className="">{"ردیف در هر صفحه:"}</span>
            <div className="relative">
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  table.setPageSize(newSize);
                }}
                className="appearance-none rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                {[5, 10, 20, 30, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm  text-gray-700">
            <span>
              صفحه {table.getState().pagination.pageIndex + 1} از{" "}
              {displayPageCount}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm  text-gray-700 transition-colors hover:bg-gray-200/70 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
              >
                صفحه قبلی
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm  text-gray-700 transition-colors hover:bg-gray-200/70 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
              >
                صفحه بعدی
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
