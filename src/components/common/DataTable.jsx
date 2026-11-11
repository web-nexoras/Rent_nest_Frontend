import React from "react";
import { EmptyState, Skeleton } from "@/components/common/Layout.jsx";
import { ErrorState } from "@/components/feedback/States.jsx";
import { cn } from "@/utils/helpers.js";

const hideClasses = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
};

export function DataTable({
  columns = [],
  data,
  rows,
  isLoading = false,
  loading = false,
  error = null,
  onRetry,
  empty,
  emptyTitle = "No records found",
  emptyDescription = "No entries match your current filter selection.",
  emptyAction,
  footer,
  rowKey = "_id",
  onRowClick,
}) {
  const list = data ?? rows ?? [];
  const busy = isLoading || loading;

  if (busy) {
    return (
      <div className="surface-card space-y-3 p-4">
        {[...Array(5)].map((_, idx) => (
          <Skeleton key={idx} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="surface-card">
        <ErrorState error={error} onRetry={onRetry} />
      </div>
    );
  }

  if (!list || list.length === 0) {
    if (empty) {
      return <div className="surface-card">{empty}</div>;
    }
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="surface-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#EAE1D0] dark:border-[#1E2433] bg-[#F6F2E9]/70 dark:bg-[#0E1117]/70">
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  className={cn(
                    "px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6E675F] dark:text-[#9A9488] whitespace-nowrap sm:px-4",
                    col.hideOn && hideClasses[col.hideOn],
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFE9DC] dark:divide-[#1C2230] text-sm">
            {list.map((row, rowIndex) => {
              const keyVal =
                typeof row[rowKey] === "object"
                  ? row[rowKey]?._id || rowIndex
                  : row[rowKey] || row.id || rowIndex;
              return (
                <tr
                  key={keyVal}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "transition-colors hover:bg-[#FAF7F2] dark:hover:bg-[#161B26]",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key || col.header}
                      className={cn(
                        "px-3 py-3.5 text-[#141413] dark:text-[#F5F0E6] align-middle sm:px-4",
                        col.hideOn && hideClasses[col.hideOn],
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.className
                      )}
                    >
                      {col.render ? col.render(row, rowIndex) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {footer && <div>{footer}</div>}
    </div>
  );
}

export default DataTable;
