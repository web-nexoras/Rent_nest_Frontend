import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Check, CreditCard, X } from "lucide-react";
import { PageHeader } from "../../../components/ui/Layout.jsx";
import Button from "../../../components/ui/Button.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import DataTable from "../../../components/ui/DataTable.jsx";
import ConfirmDialog from "../../../components/ui/ConfirmDialog.jsx";
import Pagination from "../../../components/ui/Pagination.jsx";
import { FilterTabs } from "../../../components/ui/Filters.jsx";
import { EmptyState } from "../../../components/ui/States.jsx";
import { paymentService } from "../../../services/paymentService.js";
import { useApiMutation } from "../../../hooks/useApiMutation.js";
import { formatDate, formatMoney, formatMonth } from "../../../lib/utils.js";

const LIMIT = 10;
const TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [month, setMonth] = useState("");
  const [confirm, setConfirm] = useState(null); // { type: 'verify' | 'reject', payment }

  useEffect(() => setPage(1), [status, month]);

  const query = useQuery({
    queryKey: ["payments", { page, status, month }],
    queryFn: () => paymentService.list({ page, limit: LIMIT, status: status || undefined, month: month || undefined }),
    placeholderData: keepPreviousData,
  });

  const close = () => setConfirm(null);
  const invalidate = [["payments"], ["admin"]];
  const verify = useApiMutation((id) => paymentService.verify(id), { invalidate, onSuccess: close });
  const reject = useApiMutation((id) => paymentService.reject(id), { invalidate, onSuccess: close });

  const columns = [
    {
      key: "tenant",
      header: "Tenant",
      render: (row) => (
        <div>
          <p className="font-semibold text-navy-900">{row.tenant?.name || "Removed tenant"}</p>
          <p className="text-xs text-navy-400">{row.tenant?.email}</p>
        </div>
      ),
    },
    { key: "unit", header: "Unit", render: (row) => (row.unit ? `Unit ${row.unit.unitNumber}` : "—") },
    { key: "month", header: "Month", render: (row) => formatMonth(row.month) },
    { key: "amount", header: "Amount", render: (row) => <span className="font-semibold text-navy-900">{formatMoney(row.amount)}</span> },
    {
      key: "method",
      header: "Method",
      hideOn: "md",
      render: (row) => (
        <div>
          <p>{row.paymentMethod}</p>
          <p className="max-w-[10rem] truncate font-mono text-xs text-navy-400" title={row.transactionId}>{row.transactionId}</p>
        </div>
      ),
    },
    { key: "paidAt", header: "Submitted", hideOn: "lg", render: (row) => formatDate(row.paidAt) },
    { key: "status", header: "Status", render: (row) => <Badge status={row.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) =>
        row.status === "pending" ? (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="subtle" onClick={() => setConfirm({ type: "verify", payment: row })}>
              <Check className="h-3.5 w-3.5" /> Verify
            </Button>
            <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => setConfirm({ type: "reject", payment: row })}>
              <X className="h-3.5 w-3.5" /> Reject
            </Button>
          </div>
        ) : null,
    },
  ];

  const isVerify = confirm?.type === "verify";

  return (
    <>
      <PageHeader title="Payments" description="Verify or reject rent payments submitted by tenants." />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs value={status} onChange={setStatus} options={TABS} />
        <div className="flex items-center gap-2">
          <label htmlFor="month-filter" className="text-sm text-navy-400">Month</label>
          <input
            id="month-filter"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            className="h-10 rounded-xl border border-navy-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          {month && <Button variant="ghost" size="sm" onClick={() => setMonth("")}>Clear</Button>}
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={query.data?.payments}
        loading={query.isLoading}
        error={query.isError ? query.error : null}
        onRetry={query.refetch}
        empty={<EmptyState icon={CreditCard} title="No payments found" description="Try changing the status or month filter." />}
        footer={<Pagination page={page} total={query.data?.total} limit={LIMIT} onPageChange={setPage} />}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={close}
        onConfirm={() => (isVerify ? verify : reject).mutate(confirm.payment._id)}
        loading={verify.isPending || reject.isPending}
        variant={isVerify ? "secondary" : "danger"}
        title={isVerify ? "Verify this payment?" : "Reject this payment?"}
        message={
          isVerify
            ? `Confirm that ${formatMoney(confirm?.payment.amount)} was received from ${confirm?.payment.tenant?.name} for ${formatMonth(confirm?.payment.month)}. A receipt email is sent to the tenant.`
            : `${confirm?.payment.tenant?.name} will be asked to resubmit the payment for ${formatMonth(confirm?.payment.month)}.`
        }
        confirmLabel={isVerify ? "Verify payment" : "Reject payment"}
      />
    </>
  );
}
