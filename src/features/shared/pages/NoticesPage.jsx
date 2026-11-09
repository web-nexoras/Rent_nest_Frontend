import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Megaphone, MessageSquare, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader, Card } from "../../../components/ui/Layout.jsx";
import Button from "../../../components/ui/Button.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import ConfirmDialog from "../../../components/ui/ConfirmDialog.jsx";
import Pagination from "../../../components/ui/Pagination.jsx";
import { SearchInput } from "../../../components/ui/Filters.jsx";
import { Input, Textarea } from "../../../components/ui/Input.jsx";
import { CardSkeleton } from "../../../components/ui/Skeleton.jsx";
import { EmptyState, ErrorState } from "../../../components/ui/States.jsx";
import { noticeService } from "../../../services/noticeService.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useApiMutation } from "../../../hooks/useApiMutation.js";
import { useDebounce } from "../../../hooks/useDebounce.js";
import { formatDate } from "../../../lib/utils.js";

const LIMIT = 9;

const noticeSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title is too long"),
  description: z.string().trim().min(1, "Description is required"),
});

function NoticeFormModal({ open, onClose, notice }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(noticeSchema), defaultValues: { title: "", description: "" } });

  useEffect(() => {
    if (open) reset({ title: notice?.title || "", description: notice?.description || "" });
  }, [open, notice, reset]);

  const mutation = useApiMutation(
    (values) => (notice ? noticeService.update(notice._id, values) : noticeService.create(values)),
    { invalidate: [["notices"], ["notice"]], onSuccess: onClose },
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={notice ? "Edit notice" : "Publish a notice"}
      description="Notices are visible to every tenant in the building."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button form="notice-form" type="submit" loading={mutation.isPending}>
            {notice ? "Save changes" : "Publish"}
          </Button>
        </>
      }
    >
      <form
        id="notice-form"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4"
        noValidate
      >
        <Input label="Title" error={errors.title?.message} {...register("title")} />
        <Textarea label="Description" rows={6} error={errors.description?.message} {...register("description")} />
      </form>
    </Modal>
  );
}

export default function NoticesPage() {
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search);
  const [formState, setFormState] = useState({ open: false, notice: null });
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => setPage(1), [debounced]);

  const query = useQuery({
    queryKey: ["notices", { page, search: debounced }],
    queryFn: () => noticeService.list({ page, limit: LIMIT, search: debounced || undefined }),
    placeholderData: keepPreviousData,
  });

  const remove = useApiMutation((id) => noticeService.remove(id), {
    invalidate: [["notices"]],
    onSuccess: () => setToDelete(null),
  });

  const notices = query.data?.notices || [];

  return (
    <>
      <PageHeader
        eyebrow="Community Board"
        title="Building Notices"
        description={isAdmin ? "Publish building-wide announcements and updates for residents." : "Official announcements and updates from your property manager."}
        actions={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Search notices…" />
            {isAdmin && (
              <Button onClick={() => setFormState({ open: true, notice: null })}>
                <Plus className="h-4 w-4" /> New notice
              </Button>
            )}
          </>
        }
      />

      {query.isLoading ? (
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
            title={debounced ? "No notices match your search" : "No notices yet"}
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
              <article
                key={notice._id}
                className="card-interactive group flex flex-col p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-500/15">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit notice"
                        onClick={() => setFormState({ open: true, notice })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete notice"
                        className="text-rose-600 hover:bg-rose-50"
                        onClick={() => setToDelete(notice)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <Link to={`/notices/${notice._id}`} className="mt-4 block flex-1">
                  <h3 className="line-clamp-2 font-display text-base font-bold text-navy-900 transition-colors group-hover:text-brand-600">
                    {notice.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-navy-500">
                    {notice.description}
                  </p>
                </Link>
                <div className="mt-4 flex items-center justify-between border-t border-navy-100/80 pt-3 text-xs text-navy-400">
                  <span>
                    {formatDate(notice.createdAt)}
                    {notice.createdBy?.name ? ` · ${notice.createdBy.name}` : ""}
                  </span>
                  <Link
                    to={`/notices/${notice._id}`}
                    className="inline-flex items-center gap-1 font-semibold text-brand-600"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> {notice.comments?.length || 0}
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className="card mt-6 overflow-hidden">
            <Pagination
              page={page}
              total={query.data.total}
              totalPages={query.data.totalPages}
              limit={LIMIT}
              onPageChange={setPage}
            />
          </div>
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
