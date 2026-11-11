import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Wrench } from "lucide-react";
import { PageHeader, Card } from "@/components/common/Layout.jsx";
import Button from "@/components/common/Button.jsx";
import Badge from "@/components/common/Badge.jsx";
import Modal from "@/components/common/Modal.jsx";
import ConfirmDialog from "@/components/common/ConfirmDialog.jsx";
import ImagePicker from "@/components/common/ImagePicker.jsx";
import Pagination from "@/components/common/Pagination.jsx";
import { FilterTabs } from "@/components/common/Filters.jsx";
import { Select, Textarea } from "@/components/common/Input.jsx";
import { CardSkeleton } from "@/components/common/Skeleton.jsx";
import { EmptyState, ErrorState } from "@/components/feedback/States.jsx";
import { maintenanceApi } from "@/features/maintenance/maintenanceApi.js";
import { unitApi } from "@/features/units/unitApi.js";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { formatDate, formatDateTime } from "@/utils/index.js";

const LIMIT = 6;
const CATEGORIES = ["plumbing", "electrical", "gas", "other"];
const TABS = [
  { value: "", label: "All Requests" },
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

const requestSchema = z.object({
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: "Select a category" }) }),
  description: z.string().trim().min(10, "Please describe the issue (at least 10 characters)"),
});

function RequestFormModal({ open, onClose }) {
  const [images, setImages] = useState([]);
  const [pickerKey, setPickerKey] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(requestSchema), defaultValues: { category: "plumbing", description: "" } });

  const mutation = useApiMutation(
    (values) => {
      const form = new FormData();
      form.append("category", values.category);
      form.append("description", values.description);
      images.forEach((file) => form.append("images", file));
      return maintenanceApi.create(form);
    },
    {
      invalidate: [["tenant"]],
      onSuccess: () => {
        reset();
        setImages([]);
        setPickerKey((key) => key + 1);
        onClose();
      },
    },
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New maintenance request"
      description="Tell us what needs fixing and attach photos if helpful."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="maintenance-form" loading={mutation.isPending}>Submit request</Button>
        </>
      }
    >
      <form id="maintenance-form" onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4" noValidate>
        <Select label="Category" error={errors.category?.message} {...register("category")} className="capitalize">
          {CATEGORIES.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}
        </Select>
        <Textarea label="Description" rows={5} error={errors.description?.message} {...register("description")} />
        <ImagePicker key={pickerKey} label="Photos (optional)" max={3} onChange={setImages} />
      </form>
    </Modal>
  );
}

export default function TenantMaintenancePage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const unit = useQuery({ queryKey: ["tenant", "unit"], queryFn: unitApi.mine });
  const query = useQuery({ queryKey: ["tenant", "maintenance"], queryFn: maintenanceApi.mine });

  const remove = useApiMutation((id) => maintenanceApi.remove(id), {
    invalidate: [["tenant"]],
    onSuccess: () => setToDelete(null),
  });

  const filtered = (query.data?.maintenanceRequests || []).filter((item) => !status || item.status === status);
  const rows = filtered.slice((page - 1) * LIMIT, page * LIMIT);
  const hasUnit = Boolean(unit.data?.unit);

  return (
    <>
      <PageHeader
        eyebrow="Support & Repairs"
        title="Maintenance Requests"
        description="Report unit issues and track repair progress in real time."
        actions={
          <Button disabled={!hasUnit} onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> New request
          </Button>
        }
      />

      {!unit.isLoading && !hasUnit && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900">
          You can submit requests once an administrator assigns you a unit.
        </div>
      )}

      <div className="mb-4">
        <FilterTabs value={status} onChange={(value) => { setStatus(value); setPage(1); }} options={TABS} />
      </div>

      {query.isLoading ? (
        <div className="grid gap-5 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <CardSkeleton key={i} lines={4} />)}</div>
      ) : query.isError ? (
        <Card padded={false}><ErrorState error={query.error} onRetry={query.refetch} /></Card>
      ) : filtered.length === 0 ? (
        <Card padded={false}>
          <EmptyState icon={Wrench} title={status ? "No requests with this status" : "No maintenance requests"}
            description="Everything running smoothly? Submit a request whenever something needs attention." />
        </Card>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            {rows.map((request) => (
              <article key={request._id} className="card-interactive flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-500/15">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold capitalize text-navy-900">{request.category}</h3>
                      <p className="text-xs text-navy-400">Submitted {formatDate(request.createdAt)}</p>
                    </div>
                  </div>
                  <Badge status={request.status} />
                </div>
                <p className="mt-4 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-navy-600">{request.description}</p>
                {request.images?.length > 0 && (
                  <div className="mt-4 flex gap-2">
                    {request.images.map((src) => (
                      <a key={src} href={src} target="_blank" rel="noreferrer">
                        <img src={src} alt="Issue" className="h-16 w-16 rounded-xl border border-navy-200/70 object-cover shadow-2xs transition hover:opacity-80" />
                      </a>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-navy-100/80 pt-3 text-xs text-navy-400">
                  <span className="min-w-0 truncate">
                    {request.status === "resolved" && request.resolvedAt
                      ? `Resolved ${formatDateTime(request.resolvedAt)}`
                      : `Updated ${formatDateTime(request.updatedAt)}`}
                  </span>
                  {request.status === "pending" && (
                    <button onClick={() => setToDelete(request)} className="inline-flex shrink-0 items-center gap-1 font-semibold text-rose-600 hover:text-rose-700">
                      <Trash2 className="h-3.5 w-3.5" /> Cancel request
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
          <div className="card mt-6 overflow-hidden">
            <Pagination page={page} total={filtered.length} limit={LIMIT} onPageChange={setPage} />
          </div>
        </>
      )}

      <RequestFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={() => remove.mutate(toDelete._id)}
        loading={remove.isPending}
        title="Cancel this request?"
        message="Only pending requests can be cancelled. This will permanently remove it."
        confirmLabel="Cancel request"
      />
    </>
  );
}
