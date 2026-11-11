import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/common/Button.jsx";

export function Pagination({
  pagination,
  page: propPage,
  total: propTotal,
  totalPages: propTotalPages,
  limit: propLimit = 10,
  onPageChange,
}) {
  const page = pagination?.page ?? propPage ?? 1;
  const total = pagination?.total ?? propTotal ?? 0;
  const limit = pagination?.limit ?? propLimit ?? 10;
  const pages =
    pagination?.pages ??
    pagination?.totalPages ??
    propTotalPages ??
    Math.ceil(total / Math.max(1, limit));

  if (!pages || pages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[#EFE9DC] dark:border-[#1E2433] px-4 py-3.5 text-xs text-[#6E675F] dark:text-[#9A9488]">
      <div>
        Showing <span className="font-semibold text-[#141413] dark:text-[#F5F0E6]">{start}</span> to{" "}
        <span className="font-semibold text-[#141413] dark:text-[#F5F0E6]">{end}</span> of{" "}
        <span className="font-semibold text-[#141413] dark:text-[#F5F0E6]">{total}</span> results
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="xs"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          leftIcon={ChevronLeft}
        >
          Prev
        </Button>
        <span className="px-2.5 font-medium text-[#141413] dark:text-[#F5F0E6]">
          Page {page} of {pages}
        </span>
        <Button
          variant="secondary"
          size="xs"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          rightIcon={ChevronRight}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
