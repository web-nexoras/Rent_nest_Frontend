import { useState } from "react";
import { Send, Trash2 } from "lucide-react";
import Button from "@/components/common/Button.jsx";
import { Textarea } from "@/components/common/Input.jsx";
import { Avatar } from "@/components/common/Layout.jsx";
import { formatDateTime } from "@/utils/helpers.js";

export function NoticeCommentSection({
  comments = [],
  currentUserId,
  isAdmin,
  onAddComment,
  onDeleteComment,
  isAddingComment,
}) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddComment(text.trim(), () => setText(""));
  };

  return (
    <section aria-labelledby="notice-comments-heading" className="mt-8 space-y-6 border-t border-[#E5DEC9] pt-6 dark:border-[#252C3D]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="notice-comments-heading" className="font-display text-lg font-bold text-[#141413] dark:text-[#F5F0E6]">
            Resident Discussion
          </h2>
          <span className="rounded-full bg-[#F6F2E9] px-2.5 py-1 text-[11px] font-semibold text-[#6E675F] dark:bg-[#1C2230] dark:text-[#C8C2B8]">
            {comments.length}
          </span>
        </div>
        <p className="text-xs text-[#6E675F] dark:text-[#9A9488]">
          Ask questions or leave comments regarding this announcement.
        </p>
      </div>

      {/* Comment List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center py-6 text-xs text-[#8A8477] dark:text-[#6F768A]">
            No comments posted yet. Be the first to reply.
          </p>
        ) : (
          comments.map((comment) => {
            const author = comment.tenant || comment.user || comment.author;
            const authorId = author?._id || author;
            const authorName = author?.name || author?.fullName || author?.email || "Resident";
            const canDelete = isAdmin || (currentUserId && authorId === currentUserId);

            return (
              <div
                key={comment._id}
                className="group flex min-w-0 items-start gap-3 rounded-2xl border border-[#E5DEC9] bg-white/60 p-4 transition-colors dark:border-[#252C3D] dark:bg-[#131722]/60"
              >
                <Avatar name={authorName} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-2 sm:items-center">
                    <span className="min-w-0 break-words font-semibold text-xs text-[#141413] dark:text-[#F5F0E6]">
                      {authorName}
                    </span>
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="text-right text-[10px] text-[#8A8477] dark:text-[#6F768A] sm:text-[11px]">
                        {formatDateTime(comment.createdAt)}
                      </span>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDeleteComment(comment)}
                          className="inline-flex min-h-10 min-w-10 items-center justify-center text-rose-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-600 [@media(hover:none)]:opacity-100"
                          title="Delete comment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs text-[#3E3A35] dark:text-[#D5D0C6] leading-relaxed break-words">
                    {comment.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Keep the composer after the existing discussion so replies stay together. */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          rows={3}
          placeholder="Write a message or question..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!text.trim() || isAddingComment}
            loading={isAddingComment}
          >
            <Send className="mr-1.5 h-3.5 w-3.5" /> Post Comment
          </Button>
        </div>
      </form>
    </section>
  );
}

export default NoticeCommentSection;
