import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import { Card, Avatar } from "../../../components/ui/Layout.jsx";
import Button from "../../../components/ui/Button.jsx";
import ConfirmDialog from "../../../components/ui/ConfirmDialog.jsx";
import { Textarea } from "../../../components/ui/Input.jsx";
import { Skeleton } from "../../../components/ui/Skeleton.jsx";
import { ErrorState, EmptyState } from "../../../components/ui/States.jsx";
import { noticeService } from "../../../services/noticeService.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useApiMutation } from "../../../hooks/useApiMutation.js";
import { formatDateTime } from "../../../lib/utils.js";

export default function NoticeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isApproved } = useAuth();
  const [text, setText] = useState("");
  const [commentToDelete, setCommentToDelete] = useState(null);

  const query = useQuery({ queryKey: ["notice", id], queryFn: () => noticeService.get(id) });

  const addComment = useApiMutation((value) => noticeService.addComment(id, value), {
    invalidate: [["notice", id], ["notices"]],
    onSuccess: () => setText(""),
  });

  const deleteComment = useApiMutation((commentId) => noticeService.deleteComment(id, commentId), {
    invalidate: [["notice", id], ["notices"]],
    onSuccess: () => setCommentToDelete(null),
  });

  const notice = query.data?.notice;

  const submit = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    addComment.mutate(text.trim());
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/notices"
        className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-navy-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to notices
      </Link>

      {query.isLoading ? (
        <Card>
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-2 h-4 w-4/6" />
        </Card>
      ) : query.isError ? (
        <Card padded={false}>
          <ErrorState
            error={query.error}
            title="Notice unavailable"
            onRetry={query.error?.response?.status === 404 ? () => navigate("/notices") : query.refetch}
          />
        </Card>
      ) : (
        <>
          <Card>
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600">Official Announcement</p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-navy-900">{notice.title}</h1>
            <p className="mt-1 text-xs text-navy-400">
              {formatDateTime(notice.createdAt)}
              {notice.createdBy?.name ? ` · Published by ${notice.createdBy.name}` : ""}
            </p>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-navy-700">
              {notice.description}
            </p>
          </Card>

          <Card title={`Discussion (${notice.comments?.length || 0})`} subtitle="Resident & management comments" className="mt-6">
            {notice.comments?.length ? (
              <ul className="space-y-4">
                {notice.comments.map((comment) => {
                  const authorId = comment.tenant?._id || comment.tenant;
                  const canDelete = isAdmin || authorId === user?._id;
                  return (
                    <li key={comment._id} className="flex gap-3">
                      <Avatar name={comment.tenant?.name || "User"} size="sm" />
                      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-surface-subtle px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-navy-900">
                            {comment.tenant?.name || "Deleted user"}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-navy-400">{formatDateTime(comment.createdAt)}</span>
                            {canDelete && (
                              <button
                                onClick={() => setCommentToDelete(comment)}
                                className="text-navy-300 transition hover:text-rose-600"
                                aria-label="Delete comment"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-navy-600">
                          {comment.text}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState title="No comments yet" description="Be the first to share a thought." />
            )}

            {isApproved ? (
              <form onSubmit={submit} className="mt-6 border-t border-navy-100/80 pt-5">
                <Textarea
                  label="Add a comment"
                  rows={3}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                />
                <div className="mt-3 flex justify-end">
                  <Button type="submit" loading={addComment.isPending} disabled={!text.trim()}>
                    <Send className="h-4 w-4" /> Post comment
                  </Button>
                </div>
              </form>
            ) : (
              <p className="mt-6 border-t border-navy-100/80 pt-4 text-sm text-navy-400">
                Commenting is available once your account is approved.
              </p>
            )}
          </Card>
        </>
      )}

      <ConfirmDialog
        open={Boolean(commentToDelete)}
        onClose={() => setCommentToDelete(null)}
        onConfirm={() => deleteComment.mutate(commentToDelete._id)}
        loading={deleteComment.isPending}
        title="Delete this comment?"
        message="This comment will be permanently removed."
        confirmLabel="Delete"
      />
    </div>
  );
}
