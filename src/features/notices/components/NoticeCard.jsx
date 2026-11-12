import { Link } from "react-router-dom";
import { Megaphone, MessageSquare, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/common/Button.jsx";
import { formatDate } from "@/utils/helpers.js";

export function NoticeCard({ notice, isAdmin, onEdit, onDelete }) {
  return (
    <article className="card-interactive group flex min-w-0 flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-[#C59B27] dark:text-[#D4AF37] ring-1 ring-[#D4AF37]/30">
          <Megaphone className="h-5 w-5" />
        </div>
        {isAdmin && (
          <div className="flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Edit notice"
              onClick={() => onEdit(notice)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete notice"
              className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              onClick={() => onDelete(notice)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Link to={`/notices/${notice._id}`} className="mt-4 block min-w-0 flex-1">
        <h3 className="line-clamp-2 break-words font-display text-base font-bold text-[#141413] dark:text-[#F5F0E6] transition-colors group-hover:text-[#C59B27] dark:group-hover:text-[#D4AF37]">
          {notice.title}
        </h3>
        <p className="mt-2 line-clamp-3 break-words text-sm leading-relaxed text-[#6E675F] dark:text-[#9A9488]">
          {notice.description}
        </p>
      </Link>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E5DEC9] dark:border-[#252C3D] pt-3 text-xs text-[#8A8477] dark:text-[#6F768A]">
        <span className="min-w-0 truncate">
          {formatDate(notice.createdAt)}
          {notice.createdBy?.name ? ` · ${notice.createdBy.name}` : ""}
        </span>
        <Link
          to={`/notices/${notice._id}`}
          className="inline-flex shrink-0 items-center gap-1 font-semibold text-[#C59B27] dark:text-[#D4AF37]"
        >
          <MessageSquare className="h-3.5 w-3.5" /> {notice.comments?.length || 0}
        </Link>
      </div>
    </article>
  );
}

export default NoticeCard;
