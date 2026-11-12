import { useEffect, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Megaphone, Plus } from "lucide-react";
import { PageHeader, Card } from "@/components/common/Layout.jsx";
import Button from "@/components/common/Button.jsx";
import ConfirmDialog from "@/components/common/ConfirmDialog.jsx";
import Pagination from "@/components/common/Pagination.jsx";
import { SearchInput } from "@/components/common/Filters.jsx";
import { CardSkeleton } from "@/components/common/Skeleton.jsx";
import { EmptyState, ErrorState } from "@/components/feedback/States.jsx";
import { deleteNotice, listNotices } from "@/features/notices/api/noticeApi.js";
import { NoticeCard } from "@/features/notices/components/NoticeCard.jsx";
import { NoticeFormModal } from "@/features/notices/components/NoticeFormModal.jsx";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { useDebounce } from "@/hooks/useDebounce.js";

const LIMIT = 9;

export default function Notices() {
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search);
  const [formState, setFormState] = useState({ open: false, notice: null });
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => setPage(1), [debounced]);

  const query = useQuery({
    queryKey: ["notices", { page, search: debounced }],
    queryFn: () => listNotices({ page, limit: LIMIT, search: debounced || undefined }),
    placeholderData: keepPreviousData,
    refetchOnMount: "always",
  });

  const remove = useApiMutation((id) => deleteNotice(id), {
    invalidate: [["notices"]],
    onSuccess: () => setToDelete(null),
  });

  const notices = query.data?.notices || [];

  return (
    <>
      <PageHeader
        eyebrow="Community Board"
        title="Building Notices"
        description={
          isAdmin
            ? "Publish building-wide announcements, maintenance advisories, and notices for residents."
            : "Official announcements, notices, and updates from your property manager."
        }
        actions={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Search notices..." />
            {isAdmin && (
              <Button onClick={() => setFormState({ open: true, notice: null })}>
                <Plus className="h-4 w-4" /> New notice
              </Button>
            )}
          </>
        }
      />

      {query.isFetching ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} lines={4} />
          ))}
        </div>
      ) : query.isError ? (
        <Card padded={false}>
          <ErrorState error={query.error} onRetry={query.refetch} />
        </Card>
      ) : notices.length === 0 ? (
        <Card padded={false}>
          <EmptyState
            icon={Megaphone}
            title={debounced ? "No notices match your search" : "No notices published yet"}
            description={isAdmin && !debounced ? "Publish your first announcement for tenants." : undefined}
            action={
              isAdmin && !debounced ? (
                <Button onClick={() => setFormState({ open: true, notice: null })}>
                  <Plus className="h-4 w-4" /> New notice
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {notices.map((notice) => (
              <NoticeCard
                key={notice._id}
                notice={notice}
                isAdmin={isAdmin}
                onEdit={(n) => setFormState({ open: true, notice: n })}
                onDelete={(n) => setToDelete(n)}
              />
            ))}
          </div>

          {query.data?.totalPages > 1 && (
            <div className="card mt-6 overflow-hidden">
              <Pagination
                page={page}
                total={query.data.total}
                totalPages={query.data.totalPages}
                limit={LIMIT}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      <NoticeFormModal
        open={formState.open}
        notice={formState.notice}
        onClose={() => setFormState({ open: false, notice: null })}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={() => remove.mutate(toDelete._id)}
        loading={remove.isPending}
        title="Delete this notice?"
        message={`"${toDelete?.title}" and all of its comments will be permanently removed.`}
        confirmLabel="Delete notice"
      />
    </>
  );
}
