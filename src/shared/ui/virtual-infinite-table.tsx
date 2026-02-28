import React, { useRef, useCallback, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { InfiniteScrollParams, InfiniteScrollResponse } from "../api";

const ITEM_HEIGHT = 45;
const SCROLL_THRESHOLD = 200;

interface VirtualInfiniteTableProps<T> {
  columns: ColumnDef<T>[];
  queryKey: unknown[];
  fetchFn: (params: InfiniteScrollParams) => Promise<InfiniteScrollResponse<T>>;
  pageSize?: number;
  search?: string;
  sorting?: SortingState;
}

export const VirtualInfiniteTable: React.FC<
  VirtualInfiniteTableProps<unknown>
> = ({
  columns,
  queryKey,
  fetchFn,
  pageSize = 50,
  search = "",
  sorting = [],
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch function wrapper for useInfiniteQuery
  const queryFn = async ({ pageParam = 0 }) => {
    const sortBy = sorting[0]?.id;
    const sortOrder = sorting[0]?.desc ? "desc" : "asc";

    return fetchFn({
      offset: pageParam,
      limit: pageSize,
      sortBy,
      sortOrder,
      search,
    });
  };

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [...queryKey, search, sorting],
      queryFn,
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.data.length < pageSize) {
          return undefined;
        }
        return allPages.length * pageSize;
      },
    });

  // Flatten all pages into a single array
  const flatData = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: flatData.length,
    getScrollElement: useCallback(() => scrollContainerRef.current, []),
    estimateSize: useCallback(() => ITEM_HEIGHT, []),
    overscan: 10,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  // Handle scroll for infinite loading
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const scrollHeight = target.scrollHeight;
      const clientHeight = target.clientHeight;
      const scrollDist = scrollHeight - clientHeight - target.scrollTop;

      if (scrollDist < SCROLL_THRESHOLD && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  const table = useReactTable({
    data: flatData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
    },
  });

  const isEmpty = flatData.length === 0 && !isFetching;

  const thClass =
    "h-12 px-4 text-left align-middle font-semibold text-gray-900 dark:text-white [&:has([role=checkbox])]:pr-0";
  const tdClass =
    "px-4 py-3 align-middle text-gray-900 dark:text-gray-100 [&:has([role=checkbox])]:pr-0";
  const trClass =
    "border-b border-gray-200 dark:border-gray-700 hover:bg-muted/50 transition-colors";

  return (
    <div className="w-full h-full flex flex-col rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Single scrollable container with sticky header */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto"
      >
        <table
          className="w-full caption-bottom text-sm"
          style={{ tableLayout: "fixed" }}
        >
          <thead className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-background [&_tr]:border-b-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className={trClass}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={thClass}
                    style={{ width: `${header.getSize()}px` }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {/* Top padding for virtualizer */}
            {virtualItems.length > 0 && virtualItems[0]?.start ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ height: `${virtualItems[0].start}px`, padding: 0 }}
                />
              </tr>
            ) : null}

            {/* Virtual rows */}
            {virtualItems.map((virtualItem) => {
              const row = table.getRowModel().rows[virtualItem.index];
              if (!row) return null;
              return (
                <tr key={row.id} className={trClass}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={tdClass}
                      style={{ width: `${cell.column.getSize()}px` }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}

            {/* Bottom padding for virtualizer */}
            {virtualItems.length > 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    height: `${Math.max(
                      0,
                      totalSize -
                        (virtualItems[virtualItems.length - 1]?.start ?? 0) -
                        (virtualItems[virtualItems.length - 1]?.size ?? 0),
                    )}px`,
                    padding: 0,
                  }}
                />
              </tr>
            )}
          </tbody>
        </table>

        {/* Loading indicator */}
        {(isFetching || isFetchingNextPage) && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Данные не найдены
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Попробуйте изменить фильтры или параметры поиска
            </p>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 flex items-center justify-end gap-3 px-2 py-1.5 text-xs">
        <span>
          Всего: <strong className="text-foreground">{flatData.length}</strong>
        </span>
      </div>
    </div>
  );
};
