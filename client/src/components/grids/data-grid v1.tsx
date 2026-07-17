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
  className?: string;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  isLoading?: boolean;
  alignLastEnd?: boolean;
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
    className,
    onRowSelectionChange,
    isLoading = false,
    alignLastEnd = false,
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
      <div className="flex-1 overflow-auto rounded-lg border border-gray-200 shadow">
        <table className="min-w-full table-fixed divide-y divide-gray-200">
          {/* Header */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
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
                        // Added top-0 back here to ensure vertical stickiness
                        "sticky top-0 bg-gray-50 px-4 py-3 text-sm  uppercase tracking-wider text-gray-500 whitespace-nowrap",
                        alignLastEnd && isLast ? "text-end" : "text-start",
                        enableColumnResizing && "border-l border-gray-200",
                        // Sticky columns get a higher z-index so they overlap horizontal scroll
                        stickyActive ? "z-20" : "z-10",
                        isLastSticky &&
                          "shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.15)]",
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-1 font-bold",
                          alignLastEnd && isLast
                            ? "justify-end"
                            : "justify-start",
                          header.column.getCanSort() &&
                            "cursor-pointer select-none hover:text-gray-700",
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {isSorted === "asc" && " 🔼"}
                        {isSorted === "desc" && " 🔽"}
                      </div>

                      {/* Resize Handle */}
                      {enableColumnResizing && header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={cn(
                            "absolute left-0 top-0 z-30 flex h-full w-2 -ml-1 cursor-col-resize touch-none select-none items-center justify-center",
                            header.column.getIsResizing()
                              ? "bg-blue-500"
                              : "hover:bg-blue-500/30",
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
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  در حال بارگذاری...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No results found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "transition-colors",
                    enableRowSelection && row.getIsSelected()
                      ? "bg-blue-50"
                      : "hover:bg-gray-100 even:bg-gray-50",
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
                        style={{ width: cell.column.getSize(), ...stickyStyle }}
                        className={cn(
                          "truncate max-w-full px-3 py-2 text-xs text-gray-900",
                          // Alignment logic
                          alignLastEnd && isLast ? "text-end" : "text-start",
                          // Resizing border logic
                          enableColumnResizing && "border-l border-gray-200",
                          // Sticky body cell logic
                          stickyActive && "sticky z-10 bg-inherit",
                          isLastSticky &&
                            "shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]",
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

      {/* Pagination Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span>Rows per page:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              table.setPageSize(newSize);
            }}
            className="rounded border border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {[5, 10, 20, 30, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {displayPageCount}
          </span>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 hover:bg-gray-100"
          >
            صفحه قبلی
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 hover:bg-gray-100"
          >
            صفحه بعدی
          </button>
        </div>
      </div>
    </div>
  );
}
