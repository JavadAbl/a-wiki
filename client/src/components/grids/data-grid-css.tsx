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
import type { GetManyQuery } from "../../../utils/types";
import "./theme-material.css";

// [Interfaces remain exactly the same...]
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
      if (onRowSelectionChange) onRowSelectionChange(next);
      return next;
    });
  };

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection, pagination: paginationState },
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

  const isStickyCol = (index: number) =>
    stickyColumns > 0 && index < stickyColumns;
  const isLastStickyCol = (index: number) =>
    stickyColumns > 0 && index === stickyColumns - 1;

  return (
    <div className={cn("flex h-full w-full flex-col", className)}>
      <div className="flex h-full flex-col overflow-hidden rounded-dg-card border border-dg-border bg-dg-bg shadow-md">
        <div className="flex-1 overflow-auto">
          <table className="min-w-full table-fixed border-collapse text-left">
            <thead className="border-b border-dg-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-dg-header-bg/80">
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
                          "sticky top-0 z-10 px-dg-header-x py-dg-header-y text-xs font-semibold uppercase tracking-wider text-dg-header-text whitespace-nowrap",
                          alignLastEnd && isLast ? "text-end" : "text-start",
                          enableColumnResizing && "border-l border-dg-border",
                          stickyActive
                            ? "z-20 bg-dg-header-bg/95"
                            : "bg-dg-header-bg/80",
                          isLastSticky &&
                            "shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]",
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-dg-icon-gap",
                            alignLastEnd && isLast
                              ? "justify-end"
                              : "justify-start",
                            header.column.getCanSort() &&
                              "cursor-pointer select-none transition-colors hover:text-dg-header-hover",
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {isSorted === "asc" && (
                            <span className="text-dg-primary">↑</span>
                          )}
                          {isSorted === "desc" && (
                            <span className="text-dg-primary">↓</span>
                          )}
                        </div>

                        {enableColumnResizing &&
                          header.column.getCanResize() && (
                            <div
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className={cn(
                                "absolute left-0 top-0 z-30 h-full w-dg-resize cursor-col-resize touch-none select-none",
                                header.column.getIsResizing()
                                  ? "bg-dg-primary"
                                  : "bg-dg-border hover:bg-dg-primary",
                              )}
                            />
                          )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-dg-border">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-dg-cell-x py-dg-empty-y text-center text-sm font-medium text-dg-header-text"
                  >
                    در حال بارگذاری...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-dg-cell-x py-dg-empty-y text-center text-sm font-medium text-dg-header-text"
                  >
                    No results found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "transition-colors duration-150",
                      enableRowSelection && row.getIsSelected()
                        ? "bg-dg-row-selected"
                        : "hover:bg-dg-row-hover",
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
                            "truncate max-w-full px-dg-cell-x py-dg-cell-y text-sm text-dg-cell",
                            alignLastEnd && isLast ? "text-end" : "text-start",
                            enableColumnResizing && "border-l border-dg-border",
                            stickyActive && "sticky z-10 bg-inherit",
                            isLastSticky &&
                              "shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]",
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

        {/* Integrated Pagination Footer */}
        <div className="flex flex-wrap items-center justify-between gap-dg-footer-gap border-t border-dg-border bg-dg-footer-bg px-dg-footer-x py-dg-footer-y">
          <div className="flex items-center gap-dg-control-gap text-sm text-dg-footer-text">
            <span className="font-medium">Rows per page:</span>
            <div className="relative">
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="appearance-none rounded-md border border-dg-border bg-dg-bg px-dg-control-px pr-dg-control-pr py-dg-control-py text-sm font-medium text-dg-footer-text shadow-sm transition-colors hover:border-dg-header-text focus:border-dg-primary focus:outline-none focus:ring-1 focus:ring-dg-primary"
              >
                {[5, 10, 20, 30, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2 top-1/2 w-dg-icon h-dg-icon -translate-y-1/2 text-dg-header-text"
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

          <div className="flex items-center gap-dg-footer-gap text-sm font-medium text-dg-footer-text">
            <span>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {displayPageCount}
            </span>
            <div className="flex items-center gap-dg-btn-gap">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="inline-flex items-center justify-center rounded-md px-dg-btn-px py-dg-btn-py text-sm font-medium text-dg-footer-text transition-colors hover:bg-dg-row-hover disabled:cursor-not-allowed disabled:text-dg-border disabled:hover:bg-transparent"
              >
                Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="inline-flex items-center justify-center rounded-md px-dg-btn-px py-dg-btn-py text-sm font-medium text-dg-footer-text transition-colors hover:bg-dg-row-hover disabled:cursor-not-allowed disabled:text-dg-border disabled:hover:bg-transparent"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
