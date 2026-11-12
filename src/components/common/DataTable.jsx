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
  responsiveCards = false,
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
      {responsiveCards && (
        <div className="space-y-3 p-3 2xl:hidden">
          {list.map((row, rowIndex) => {
            const keyVal =
              typeof row[rowKey] === "object"
                ? row[rowKey]?._id || rowIndex
                : row[rowKey] || row.id || rowIndex;
            const [primary, ...details] = columns;
            return (
              <article
                key={keyVal}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "min-w-0 rounded-2xl border border-[#E8DFCE] bg-white p-3.5 shadow-sm dark:border-[#252C3D] dark:bg-[#131722] sm:p-4",
                  onRowClick && "cursor-pointer"
                )}
              >
                {primary && (
                  <div className="min-w-0 border-b border-[#EFE9DC] pb-3 dark:border-[#252C3D]">
                    {primary.render ? primary.render(row, rowIndex) : row[primary.key]}
                  </div>
                )}
                {details.length > 0 && (
                  <dl className="mt-3 grid min-w-0 grid-cols-2 gap-2 sm:gap-2.5">
                    {details.map((column) => (
                      <div
                        key={column.key || column.header}
                        className={cn(
                          "min-w-0 rounded-xl bg-[#FAF7F2] px-2.5 py-2 dark:bg-[#0E1117] sm:px-3",
                          ["actions", "action"].includes(column.key) && "col-span-2"
                        )}
                      >
                        {column.header && (
                          <dt className="mb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#8C8479] dark:text-[#9A9488]">
                            {column.header}
                          </dt>
                        )}
                        <dd className="min-w-0 break-words text-xs text-[#141413] dark:text-[#F5F0E6]">
                          {column.render ? column.render(row, rowIndex) : row[column.key]}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </article>
            );
          })}
        </div>
      )}
      <div className={responsiveCards ? "hidden 2xl:block" : ""}>
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
      </div>
      {footer && <div>{footer}</div>}
    </div>
  );
}

export default DataTable;
