import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Megaphone } from "lucide-react";
import { Card, Avatar } from "@/components/common/Layout.jsx";
import ConfirmDialog from "@/components/common/ConfirmDialog.jsx";
import { Skeleton } from "@/components/common/Skeleton.jsx";
import { ErrorState, EmptyState } from "@/components/feedback/States.jsx";
import {
  addNoticeComment,
  deleteNoticeComment,
  getNotice,
} from "@/features/notices/api/noticeApi.js";
import { NoticeCommentSection } from "@/features/notices/components/NoticeCommentSection.jsx";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { formatDateTime } from "@/utils/helpers.js";

export default function NoticeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [commentToDelete, setCommentToDelete] = useState(null);

  const query = useQuery({
    queryKey: ["notice", id],
    queryFn: () => getNotice(id),
    refetchOnMount: "always",
  });

  const addComment = useApiMutation((value) => addNoticeComment(id, value), {
    invalidate: [["notice", id], ["notices"]],
  });

  const deleteComment = useApiMutation(
    (commentId) => deleteNoticeComment(id, commentId),
    {
      invalidate: [["notice", id], ["notices"]],
      onSuccess: () => setCommentToDelete(null),
    }
  );

  const notice = query.data?.notice;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/notices"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6E675F] dark:text-[#9A9488] hover:text-[#C59B27] dark:hover:text-[#D4AF37] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to notices
      </Link>

      {query.isFetching ? (
        <Card>
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-2 h-4 w-4/6" />
        </Card>
      ) : query.isError ? (
        <Card padded={false}>
          <ErrorState error={query.error} onRetry={query.refetch} />
        </Card>
      ) : !notice ? (
        <Card padded={false}>
          <EmptyState
            icon={Megaphone}
            title="Notice not found"
            description="The announcement you are looking for may have been removed."
          />
        </Card>
      ) : (
        <Card>
          <div className="flex items-center gap-3 text-xs text-[#8A8477] dark:text-[#6F768A]">
            <Avatar name={notice.createdBy?.name || "Admin"} size="sm" />
            <div>
              <p className="font-semibold text-[#141413] dark:text-[#F5F0E6]">
                {notice.createdBy?.name || "Building Management"}
              </p>
              <p>{formatDateTime(notice.createdAt)}</p>
            </div>
          </div>

          <h1 className="mt-5 break-words font-display text-2xl font-bold tracking-tight text-[#141413] dark:text-[#F5F0E6]">
            {notice.title}
          </h1>

          <div className="mt-4 break-words whitespace-pre-line text-sm leading-relaxed text-[#3E3A35] dark:text-[#D5D0C6]">
            {notice.description}
          </div>

          <NoticeCommentSection
            comments={notice.comments || []}
            currentUserId={user?._id}
            isAdmin={isAdmin}
            onAddComment={(text, resetForm) => {
              addComment.mutate(text, { onSuccess: resetForm });
            }}
            onDeleteComment={(comment) => setCommentToDelete(comment)}
            isAddingComment={addComment.isPending}
          />
        </Card>
      )}

      <ConfirmDialog
        open={Boolean(commentToDelete)}
        onClose={() => setCommentToDelete(null)}
        onConfirm={() => deleteComment.mutate(commentToDelete?._id)}
        loading={deleteComment.isPending}
        title="Delete comment?"
        message="This comment will be permanently removed from this notice."
        confirmLabel="Delete"
      />
    </div>
  );
}
