import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button.jsx";

export default function Pagination({ page, totalPages, total, limit, onPageChange }) {
  if (!total) return null;
  const pages = Math.max(1, totalPages || Math.ceil(total / limit));
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-navy-100 bg-navy-50/40 px-5 py-3 sm:flex-row">
      <p className="text-xs text-navy-500">
        Showing <span className="tabular font-semibold text-navy-800">{from}</span>–
        <span className="tabular font-semibold text-navy-800">{to}</span> of{" "}
        <span className="tabular font-semibold text-navy-800">{total}</span> results
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </Button>
        <span className="tabular min-w-[4.5rem] rounded-lg bg-white px-2.5 py-1 text-center text-xs font-semibold text-navy-700 ring-1 ring-navy-200/80">
          {page} / {pages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
