import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Check, CreditCard, X } from "lucide-react";
import { PageHeader, Avatar } from "@/components/common/Layout.jsx";
import Button from "@/components/common/Button.jsx";
import Badge from "@/components/common/Badge.jsx";
import DataTable from "@/components/common/DataTable.jsx";
import ConfirmDialog from "@/components/common/ConfirmDialog.jsx";
import Pagination from "@/components/common/Pagination.jsx";
import { FilterTabs } from "@/components/common/Filters.jsx";
import { EmptyState } from "@/components/feedback/States.jsx";
import { listPayments, rejectPayment, verifyPayment } from "@/features/payments/api/paymentApi.js";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { formatDate, formatMoney, formatMonth } from "@/utils/helpers.js";

const LIMIT = 10;
const TABS = [
  { value: "", label: "All Payments" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminPayments() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [month, setMonth] = useState(searchParams.get("month") || "");
  const [confirm, setConfirm] = useState(null);

  useEffect(() => setPage(1), [status, month]);
  useEffect(() => {
    setStatus(searchParams.get("status") || "");
    setMonth(searchParams.get("month") || "");
  }, [searchParams]);

  const query = useQuery({
    queryKey: ["payments", { page, status, month }],
    queryFn: () => listPayments({ page, limit: LIMIT, status: status || undefined, month: month || undefined }),
    placeholderData: keepPreviousData,
    refetchOnMount: "always",
  });

  const close = () => setConfirm(null);
  const invalidate = [["payments"], ["admin"]];
  const verify = useApiMutation((id) => verifyPayment(id), { invalidate, onSuccess: close });
  const reject = useApiMutation((id) => rejectPayment(id), { invalidate, onSuccess: close });

  const columns = [
    {
      key: "tenant",
      header: "Tenant",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.tenant?.name || "?"} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-navy-900">{row.tenant?.name || "Removed tenant"}</p>
            <p className="truncate text-xs text-navy-400">{row.tenant?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "unit",
      header: "Unit",
      render: (row) =>
        row.unit ? (
          <span className="font-semibold text-navy-800">Unit {row.unit.unitNumber}</span>
        ) : (
          "—"
        ),
    },
    { key: "month", header: "Billing Period", render: (row) => formatMonth(row.month) },
    {
      key: "amount",
      header: "Amount",
      render: (row) => <span className="font-display font-bold tabular text-navy-900">{formatMoney(row.amount)}</span>,
    },
    {
      key: "method",
      header: "Method & Ref",
      hideOn: "md",
      render: (row) => (
        <div>
          <p className="font-medium text-navy-800">{row.paymentMethod}</p>
          <p className="max-w-[11rem] truncate font-mono text-xs text-navy-400" title={row.transactionId}>
            {row.transactionId}
          </p>
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
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" variant="emerald" onClick={() => setConfirm({ type: "verify", payment: row })}>
              <Check className="h-3.5 w-3.5" /> Verify
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={() => setConfirm({ type: "reject", payment: row })}
            >
              <X className="h-3.5 w-3.5" /> Reject
            </Button>
          </div>
        ) : null,
    },
  ];

  const isVerify = confirm?.type === "verify";

  return (
    <>
      <PageHeader
        eyebrow="Billing & Ledger"
        title="Payment Ledger"
        description="Verify or reject rent payments submitted by residents."
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs value={status} onChange={setStatus} options={TABS} />
        <div className="flex items-center gap-2">
          <label htmlFor="month-filter" className="text-xs font-semibold uppercase tracking-wider text-navy-500">
            Period
          </label>
          <input
            id="month-filter"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            className="h-10 rounded-xl border border-navy-200/80 bg-white dark:bg-[#131722] px-3 text-sm text-navy-900 shadow-2xs focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
          />
          {month && <Button variant="ghost" size="sm" onClick={() => setMonth("")}>Reset</Button>}
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={query.data?.payments}
        loading={query.isFetching}
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
        variant={isVerify ? "primary" : "danger"}
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
