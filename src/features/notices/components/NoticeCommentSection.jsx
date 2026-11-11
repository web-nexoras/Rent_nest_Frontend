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
    <div className="mt-8 space-y-6">
      <div className="border-t border-[#E5DEC9] dark:border-[#252C3D] pt-6">
        <h3 className="font-display text-lg font-bold text-[#141413] dark:text-[#F5F0E6]">
          Resident Discussion ({comments.length})
        </h3>
        <p className="text-xs text-[#6E675F] dark:text-[#9A9488]">
          Ask questions or leave comments regarding this announcement.
        </p>

        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
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
      </div>

      {/* Comment List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center py-6 text-xs text-[#8A8477] dark:text-[#6F768A]">
            No comments posted yet. Be the first to reply.
          </p>
        ) : (
          comments.map((comment) => {
            const author = comment.user || comment.author;
            const authorId = author?._id || author;
            const authorName = author?.name || author?.fullName || "Resident";
            const canDelete = isAdmin || (currentUserId && authorId === currentUserId);

            return (
              <div
                key={comment._id}
                className="group flex items-start gap-3 rounded-2xl border border-[#E5DEC9] dark:border-[#252C3D] bg-white/60 dark:bg-[#131722]/60 p-4 transition-colors"
              >
                <Avatar name={authorName} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-[#141413] dark:text-[#F5F0E6]">
                      {authorName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#8A8477] dark:text-[#6F768A]">
                        {formatDateTime(comment.createdAt)}
                      </span>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDeleteComment(comment)}
                          className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-600 transition-opacity p-1"
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
    </div>
  );
}

export default NoticeCommentSection;
