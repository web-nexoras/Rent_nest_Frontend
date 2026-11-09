import { cn } from "../../lib/utils.js";
import { TableSkeleton } from "./Skeleton.jsx";
import { EmptyState, ErrorState } from "./States.jsx";

/**
 * Generic responsive table.
 * columns: [{ key, header, render?(row), className?, hideOn? ("md" | "lg") }]
 */
export default function DataTable({
  columns,
  rows,
  rowKey = "_id",
  loading,
  error,
  onRetry,
  empty,
  footer,
}) {
  return (
    <div className="card overflow-hidden">
      {loading ? (
        <TableSkeleton cols={Math.min(columns.length, 5)} />
      ) : error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : !rows?.length ? (
        empty || <EmptyState title="Nothing here yet" />
      ) : (
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-200/70 bg-navy-50/80 text-[11px] font-semibold uppercase tracking-wider text-navy-500">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-5 py-3.5",
                      column.hideOn === "md" && "hidden md:table-cell",
                      column.hideOn === "lg" && "hidden lg:table-cell",
                      column.className,
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {rows.map((row, idx) => (
                <tr
                  key={typeof row[rowKey] === "object" ? row[rowKey]?.id || idx : row[rowKey] ?? idx}
                  className="group transition-colors hover:bg-brand-50/35"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-5 py-3.5 align-middle text-navy-700",
                        column.hideOn === "md" && "hidden md:table-cell",
                        column.hideOn === "lg" && "hidden lg:table-cell",
                        column.className,
                      )}
                    >
                      {column.render ? column.render(row) : row[column.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !error && rows?.length > 0 && footer}
    </div>
  );
}
