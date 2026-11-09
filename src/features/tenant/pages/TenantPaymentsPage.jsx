import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, CreditCard, Plus, Printer, ReceiptText, RotateCcw } from "lucide-react";
import { PageHeader } from "../../../components/ui/Layout.jsx";
import Button from "../../../components/ui/Button.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import DataTable from "../../../components/ui/DataTable.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import Logo from "../../../components/layout/Logo.jsx";
import { FilterTabs } from "../../../components/ui/Filters.jsx";
import { Input, Select } from "../../../components/ui/Input.jsx";
import { Skeleton } from "../../../components/ui/Skeleton.jsx";
import { EmptyState, ErrorState } from "../../../components/ui/States.jsx";
import Pagination from "../../../components/ui/Pagination.jsx";
import { paymentService } from "../../../services/paymentService.js";
import { unitService } from "../../../services/unitService.js";
import { useApiMutation } from "../../../hooks/useApiMutation.js";
import { currentMonth, formatDate, formatDateTime, formatMoney, formatMonth } from "../../../lib/utils.js";

const LIMIT = 8;
// Must match VALID_METHODS in controllers/payments/submitPayment.js
const METHODS = ["bKash", "Nagad", "Rocket", "Upay", "Bank", "Cash"];
const TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

const paymentSchema = z
  .object({
    amount: z
      .string()
      .trim()
      .min(1, "Amount is required")
      .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, "Enter a valid amount"),
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Select a month"),
    paymentMethod: z.enum(METHODS, { errorMap: () => ({ message: "Select a payment method" }) }),
    transactionId: z.string().trim().optional(),
  })
  .refine((values) => values.paymentMethod === "Cash" || Boolean(values.transactionId), {
    path: ["transactionId"],
    message: "Transaction ID is required",
  });

function PaymentFormModal({ open, onClose, rent, preset }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: "", month: currentMonth(), paymentMethod: "bKash", transactionId: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      amount: String(preset?.amount ?? rent ?? ""),
      month: preset?.month || currentMonth(),
      paymentMethod: "bKash",
      transactionId: "",
    });
  }, [open, rent, preset, reset]);

  const method = watch("paymentMethod");

  const mutation = useApiMutation((values) => paymentService.submit({ ...values, amount: Number(values.amount) }), {
    invalidate: [["tenant"], ["payments"]],
    onSuccess: onClose,
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={preset ? "Resubmit rejected payment" : "Submit rent payment"}
      description="An administrator will verify your payment before it's marked as paid."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="secondary" type="submit" form="payment-form" loading={mutation.isPending}>
            Submit payment
          </Button>
        </>
      }
    >
      <form id="payment-form" onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Amount (৳)" type="number" min="1" error={errors.amount?.message} {...register("amount")} />
          <Input label="Rent month" type="month" error={errors.month?.message} {...register("month")} />
        </div>
        <Select label="Payment method" error={errors.paymentMethod?.message} {...register("paymentMethod")}>
          {METHODS.map((item) => <option key={item} value={item}>{item}</option>)}
        </Select>
        <Input
          label="Transaction ID"
          placeholder={method === "Cash" ? "Optional for cash payments" : "e.g. 9A7B6C5D4E"}
          hint={method === "Cash" ? "A reference is generated automatically for cash." : undefined}
          error={errors.transactionId?.message}
          {...register("transactionId")}
        />
      </form>
    </Modal>
  );
}

function ReceiptModal({ paymentId, onClose }) {
  const query = useQuery({
    queryKey: ["tenant", "receipt", paymentId],
    queryFn: () => paymentService.receipt(paymentId),
    enabled: Boolean(paymentId),
  });
  const receipt = query.data?.receipt;

  return (
    <Modal
      open={Boolean(paymentId)}
      onClose={onClose}
      title="Payment receipt"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={() => window.print()} disabled={!receipt}>
            <Printer className="h-4 w-4" /> Print / Save PDF
          </Button>
        </>
      }
    >
      {query.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={query.refetch} title="Receipt unavailable" />
      ) : (
        <div id="receipt-print" className="rounded-2xl border border-navy-100 p-6">
          <div className="flex items-start justify-between">
            <Logo />
            <div className="text-right">
              <Badge status="verified">Paid</Badge>
              <p className="mt-2 break-all font-mono text-xs text-navy-400">{receipt.receiptNumber}</p>
            </div>
          </div>
          <div className="my-6 rounded-xl bg-navy-50 p-5 text-center">
            <p className="text-xs uppercase tracking-wide text-navy-400">Amount paid</p>
            <p className="mt-1 text-3xl font-bold text-navy-900">{formatMoney(receipt.amount)}</p>
            <p className="mt-1 text-sm text-navy-500">for {formatMonth(receipt.month)}</p>
          </div>
          <dl className="divide-y divide-navy-100 text-sm">
            {[
              ["Tenant", receipt.tenant?.name],
              ["Email", receipt.tenant?.email],
              ["Unit", receipt.unit ? `Unit ${receipt.unit.unitNumber}${receipt.unit.floor ? ` · Floor ${receipt.unit.floor}` : ""}` : null],
              ["Payment method", receipt.paymentMethod],
              ["Transaction ID", receipt.transactionId],
              ["Paid on", formatDateTime(receipt.paidAt)],
              ["Verified on", formatDateTime(receipt.verifiedAt)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2.5">
                <dt className="text-navy-400">{label}</dt>
                <dd className="break-all text-right font-medium text-navy-800">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </Modal>
  );
}

export default function TenantPaymentsPage() {
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(params.get("pay") === "1");
  const [preset, setPreset] = useState(null);
  const [receiptId, setReceiptId] = useState(null);

  useEffect(() => setPage(1), [status]);

  // Clean the ?pay=1 hint once consumed so refresh doesn't reopen the dialog.
  useEffect(() => {
    if (params.get("pay")) setParams({}, { replace: true });
  }, [params, setParams]);

  const unit = useQuery({ queryKey: ["tenant", "unit"], queryFn: unitService.mine });
  const query = useQuery({
    queryKey: ["tenant", "payments", status],
    queryFn: () => paymentService.mine({ status: status || undefined }),
  });

  // Backend returns all of the tenant's payments in one list (no pagination), so page on the client.
  const all = query.data?.payments || [];
  const rows = all.slice((page - 1) * LIMIT, page * LIMIT);
  const hasUnit = Boolean(unit.data?.unit);

  const openForm = (nextPreset = null) => {
    setPreset(nextPreset);
    setFormOpen(true);
  };

  const columns = [
    { key: "month", header: "Month", render: (row) => <span className="font-semibold text-navy-900">{formatMonth(row.month)}</span> },
    { key: "unit", header: "Unit", hideOn: "md", render: (row) => (row.unit ? `Unit ${row.unit.unitNumber}` : "—") },
    { key: "amount", header: "Amount", render: (row) => formatMoney(row.amount) },
    {
      key: "method",
      header: "Method",
      hideOn: "md",
      render: (row) => (
        <div>
          <p>{row.paymentMethod}</p>
          <p className="max-w-[9rem] truncate font-mono text-xs text-navy-400" title={row.transactionId}>{row.transactionId}</p>
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
        row.status === "verified" ? (
          <Button size="sm" variant="subtle" onClick={() => setReceiptId(row._id)}>
            <ReceiptText className="h-3.5 w-3.5" /> Receipt
          </Button>
        ) : row.status === "rejected" ? (
          <Button size="sm" variant="outline" onClick={() => openForm({ month: row.month, amount: row.amount })}>
            <RotateCcw className="h-3.5 w-3.5" /> Resubmit
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title="Payments"
        description="Submit rent, track verification and download receipts."
        actions={
          <Button variant="secondary" disabled={!hasUnit} onClick={() => openForm()}>
            <Plus className="h-4 w-4" /> Submit payment
          </Button>
        }
      />

      {!unit.isLoading && !hasUnit && (
        <div className="mb-4 rounded-xl border border-accent-300 bg-accent-100 px-4 py-3 text-sm text-navy-700">
          You can submit rent once an administrator assigns you a unit.
        </div>
      )}

      <div className="mb-4">
        <FilterTabs value={status} onChange={setStatus} options={TABS} />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={query.isLoading}
        error={query.isError ? query.error : null}
        onRetry={query.refetch}
        empty={
          <EmptyState
            icon={CreditCard}
            title={status ? `No ${status} payments` : "No payments yet"}
            description="Submitted payments and their verification status appear here."
            action={hasUnit && !status && <Button variant="secondary" onClick={() => openForm()}><CheckCircle2 className="h-4 w-4" /> Submit your first payment</Button>}
          />
        }
        footer={<Pagination page={page} total={all.length} limit={LIMIT} onPageChange={setPage} />}
      />

      <PaymentFormModal open={formOpen} rent={unit.data?.unit?.rentAmount} preset={preset} onClose={() => setFormOpen(false)} />
      <ReceiptModal paymentId={receiptId} onClose={() => setReceiptId(null)} />
    </>
  );
}
