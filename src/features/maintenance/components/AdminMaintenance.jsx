import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Trash2, Wrench } from "lucide-react";
import { PageHeader, Avatar } from "@/components/common/Layout.jsx";
import Button from "@/components/common/Button.jsx";
import Badge from "@/components/common/Badge.jsx";
import DataTable from "@/components/common/DataTable.jsx";
import Modal from "@/components/common/Modal.jsx";
import ConfirmDialog from "@/components/common/ConfirmDialog.jsx";
import Pagination from "@/components/common/Pagination.jsx";
import { FilterTabs, SearchInput } from "@/components/common/Filters.jsx";
import { Select } from "@/components/common/Input.jsx";
import { EmptyState } from "@/components/feedback/States.jsx";
import {
  deleteMaintenanceRequest,
  listMaintenanceRequests,
  updateMaintenanceStatus,
} from "@/features/maintenance/api/maintenanceApi.js";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { formatDate, formatDateTime } from "@/utils/helpers.js";

const LIMIT = 10;
const STATUS_TABS = [
  { value: "", label: "All Tickets" },
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];
const CATEGORIES = ["plumbing", "electrical", "gas", "other"];

function DetailModal({ request, onClose, onDelete }) {
  const [status, setStatus] = useState("pending");
  useEffect(() => {
    if (request) setStatus(request.status);
  }, [request]);

  const update = useApiMutation((value) => updateMaintenanceStatus(request._id, value), {
    invalidate: [["maintenance"], ["admin"]],
    onSuccess: onClose,
  });

  if (!request) return null;
  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`${request.category[0].toUpperCase()}${request.category.slice(1)} maintenance ticket`}
      description={`Unit ${request.unit?.unitNumber || "—"} · submitted ${formatDateTime(request.createdAt)}`}
      footer={
        <>
          <Button variant="ghost" className="mr-auto text-rose-600 hover:bg-rose-50" onClick={() => onDelete(request)}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button loading={update.isPending} disabled={status === request.status} onClick={() => update.mutate(status)}>
            Update status
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 rounded-xl bg-surface-subtle p-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">Resident</p>
            <p className="mt-1 font-semibold text-navy-900">{request.tenant?.name || "Removed tenant"}</p>
            <p className="text-xs text-navy-500">{request.tenant?.phone}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">Current status</p>
            <div className="mt-1"><Badge status={request.status} /></div>
            {request.resolvedAt && <p className="mt-1 text-xs text-navy-400">Resolved {formatDate(request.resolvedAt)}</p>}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">Issue Description</p>
          <p className="mt-1.5 break-words whitespace-pre-wrap text-sm leading-relaxed text-navy-700">{request.description}</p>
        </div>
        {request.images?.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-400">Attached Photos</p>
            <div className="flex flex-wrap gap-3">
              {request.images.map((src) => (
                <a key={src} href={src} target="_blank" rel="noreferrer">
                  <img src={src} alt="Maintenance issue" className="h-24 w-24 rounded-xl border border-navy-200/70 object-cover shadow-xs transition hover:opacity-80" />
                </a>
              ))}
            </div>
          </div>
        )}
        <Select label="Update ticket status" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="pending">Pending</option>
          <option value="in-progress">In progress</option>
          <option value="resolved">Resolved</option>
        </Select>
      </div>
    </Modal>
  );
}

export default function AdminMaintenance() {
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => setPage(1), [status, category, search]);

  const query = useQuery({
    queryKey: ["maintenance", "all", { status, category }],
    queryFn: () => listMaintenanceRequests({ status: status || undefined, category: category || undefined }),
    refetchOnMount: "always",
  });

  const remove = useApiMutation((id) => deleteMaintenanceRequest(id), {
    invalidate: [["maintenance"], ["admin"]],
    onSuccess: () => {
      setToDelete(null);
      setSelected(null);
    },
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const all = query.data?.maintenanceRequests || [];
    if (!term) return all;
    return all.filter((request) =>
      [request.tenant?.name, request.unit?.unitNumber, request.description, request.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [query.data, search]);

  const pageRows = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const columns = [
    {
      key: "tenant",
      header: "Resident & Unit",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.tenant?.name || "?"} size="sm" />
          <div>
            <p className="font-semibold text-navy-900">{row.tenant?.name || "Removed tenant"}</p>
            <p className="text-xs text-navy-400">Unit {row.unit?.unitNumber || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (row) => (
        <span className="inline-flex rounded-lg bg-surface-subtle px-2.5 py-1 text-xs font-semibold capitalize text-navy-700">
          {row.category}
        </span>
      ),
    },
    {
      key: "description",
      header: "Issue Summary",
      hideOn: "md",
      render: (row) => <p className="max-w-xs truncate text-navy-600">{row.description}</p>,
    },
    { key: "createdAt", header: "Submitted", hideOn: "lg", render: (row) => formatDate(row.createdAt) },
    { key: "status", header: "Status", render: (row) => <Badge status={row.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <Button size="sm" variant="outline" onClick={() => setSelected(row)}>
          <Eye className="h-3.5 w-3.5" /> Manage
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Maintenance Desk"
        description="Track, triage, and resolve repair requests across all units."
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs value={status} onChange={setStatus} options={STATUS_TABS} />
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
            className="h-10 rounded-xl border border-navy-200/80 bg-white dark:bg-[#131722] px-3 text-sm capitalize text-navy-900 shadow-2xs focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <SearchInput value={search} onChange={setSearch} placeholder="Search" />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={pageRows}
        loading={query.isFetching}
        error={query.isError ? query.error : null}
        onRetry={query.refetch}
        empty={<EmptyState icon={Wrench} title="No maintenance requests" description="Requests submitted by tenants will show up here." />}
        footer={<Pagination page={page} total={filtered.length} limit={LIMIT} onPageChange={setPage} />}
      />

      <DetailModal request={selected} onClose={() => setSelected(null)} onDelete={setToDelete} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={() => remove.mutate(toDelete._id)}
        loading={remove.isPending}
        title="Delete this request?"
        message="The request and its photos will be permanently removed."
        confirmLabel="Delete request"
      />
    </>
  );
}
