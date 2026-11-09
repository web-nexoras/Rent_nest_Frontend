import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button.jsx";

export default function Pagination({ page, totalPages, total, limit, onPageChange }) {
  if (!total) return null;
  const pages = Math.max(1, totalPages || Math.ceil(total / limit));
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-navy-100 px-4 py-3 sm:flex-row">
      <p className="text-sm text-navy-400">
        Showing <span className="font-medium text-navy-700">{from}</span>–
        <span className="font-medium text-navy-700">{to}</span> of{" "}
        <span className="font-medium text-navy-700">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <span className="min-w-[4.5rem] text-center text-sm text-navy-600">
          {page} / {pages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
