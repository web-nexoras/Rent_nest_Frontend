import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Calendar,
  CreditCard,
  Download,
  Lock,
  Plus,
  Printer,
} from "lucide-react";
import { paymentApi } from "@/features/payments/paymentApi.js";
import { tenantDashboardApi } from "@/features/tenants/dashboardApi.js";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useToast } from "@/components/feedback/Toast.jsx";
import { PageHeader, Card, CardHeader } from "@/components/common/Layout.jsx";
import { DataTable } from "@/components/common/DataTable.jsx";
import { Badge } from "@/components/common/Badge.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Input, Select } from "@/components/common/Input.jsx";
import { Modal } from "@/components/common/Modal.jsx";
import { Logo } from "@/components/layout/Logo.jsx";
import {
  formatCurrency,
  formatDate,
  formatMonthLabel,
  getCurrentMonthString,
  getErrorMessage,
} from "@/utils/index.js";

const MANUAL_METHODS = [
  { value: "bkash", label: "bKash Transfer" },
  { value: "nagad", label: "Nagad Transfer" },
  { value: "rocket", label: "Rocket Transfer" },
  { value: "upay", label: "Upay Transfer" },
  { value: "bank_transfer", label: "Bank Transfer / EFT" },
  { value: "cash", label: "Cash at Vault Desk" },
];

const SSL_MESSAGES = {
  failed: "SSLCommerz checkout was unsuccessful.",
  cancelled: "SSLCommerz checkout was cancelled.",
  error: "SSLCommerz could not complete the payment.",
};

const receiptNumber = (payment) =>
  payment?.receiptNumber ||
  (payment?._id ? `RN-${String(payment._id).slice(-6).toUpperCase()}` : "—");

const methodLabel = (payment) =>
  String(payment?.paymentMethod || payment?.method || "").replace(/_/g, " ");

// Tenant Payments Page with Locked Fixed Rent, 1-Click SSLCommerz & Printable PDF Receipt
export default function TenantPaymentsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [payments, setPayments] = useState([]);
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());
  const [payingSsl, setPayingSsl] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [submittingManual, setSubmittingManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    month: getCurrentMonthString(),
    method: "bkash",
    transactionId: "",
  });

  const [receiptPayment, setReceiptPayment] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [payRes, dashRes] = await Promise.all([
        paymentApi.myPayments(),
        tenantDashboardApi.getTenantDashboard().catch(() => null),
      ]);
      const list = payRes?.payments || [];
      const nextUnit = dashRes?.unit || user?.assignedUnit || null;
      setPayments(list);
      setUnit(nextUnit);

      const clearParams = (...keys) => {
        const next = new URLSearchParams(searchParams);
        keys.forEach((key) => next.delete(key));
        setSearchParams(next, { replace: true });
      };

      // Handle the SSLCommerz redirect (?ssl=success|failed|cancelled|error)
      const sslStatus = searchParams.get("ssl");
      const callbackPaymentId = searchParams.get("paymentId");

      if (sslStatus === "success") {
        toast.success(
          "Online rent payment verified via SSLCommerz!",
          "Payment Successful"
        );
        if (callbackPaymentId) {
          const found = list.find((p) => p._id === callbackPaymentId);
          if (found) setReceiptPayment(found);
        }
        clearParams("ssl", "paymentId");
      } else if (sslStatus && SSL_MESSAGES[sslStatus]) {
        toast.error(SSL_MESSAGES[sslStatus], "Payment Incomplete");
        clearParams("ssl", "paymentId");
      } else if (searchParams.get("pay") === "1" && nextUnit) {
        setManualForm({
          month: selectedMonth,
          method: "bkash",
          transactionId: "",
        });
        setManualModalOpen(true);
        clearParams("pay");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load payments"));
    } finally {
      setLoading(false);
    }
  }, [searchParams, setSearchParams, toast, user?.assignedUnit, selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fixed monthly rent locked strictly to the assigned unit's rentAmount
  const lockedRentAmount = unit?.rentAmount || 0;
  const selectedRecord = payments.find((p) => p.month === selectedMonth);
  const paymentLocked =
    selectedRecord?.status === "pending" || selectedRecord?.status === "verified";

  const handleSslCheckout = async () => {
    if (!unit) {
      toast.error("You do not have an assigned suite yet.");
      return;
    }
    try {
      setPayingSsl(true);
      const res = await paymentApi.initSsl({ month: selectedMonth });
      if (res?.gatewayUrl) {
        window.location.href = res.gatewayUrl;
      } else {
        toast.error("SSLCommerz gateway link could not be generated.");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not start online checkout"));
    } finally {
      setPayingSsl(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!unit) return;
    const transactionId = manualForm.transactionId.trim();
    if (manualForm.method !== "cash" && !transactionId) {
      toast.error("Transaction / reference ID is required.");
      return;
    }
    try {
      setSubmittingManual(true);
      await paymentApi.create({
        month: manualForm.month,
        method: manualForm.method,
        ...(transactionId ? { transactionId } : {}),
      });
      toast.success(
        "Payment submitted! Amount is locked to your suite's fixed rent.",
        "Submitted"
      );
      setManualModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to submit payment"));
    } finally {
      setSubmittingManual(false);
    }
  };

  const openReceipt = async (payment) => {
    setReceiptPayment(payment);
    try {
      const res = await paymentApi.receipt(payment._id);
      if (res?.receipt) {
        setReceiptPayment({ ...payment, ...res.receipt });
      }
    } catch {
      // Fall back to the ledger row when the receipt endpoint is unavailable.
    }
  };

  // Build 12-month calendar overview for current year.
  // Months before the tenancy began are hidden.
  const joinMonth = useMemo(() => {
    const dates = [user?.createdAt, ...payments.map((p) => p.createdAt)]
      .filter(Boolean)
      .map((value) => new Date(value))
      .filter((date) => !Number.isNaN(date.getTime()));

    if (!dates.length) return `${new Date().getFullYear()}-01`;

    const earliest = new Date(Math.min(...dates.map((date) => date.getTime())));
    return `${earliest.getFullYear()}-${String(earliest.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  }, [user?.createdAt, payments]);

  const calendarMonths = useMemo(() => {
    const year = new Date().getFullYear();
    const currentMonthStr = getCurrentMonthString();
    const dayOfMonth = new Date().getDate();

    return Array.from({ length: 12 }, (_, idx) => {
      const m = String(idx + 1).padStart(2, "0");
      const key = `${year}-${m}`;
      const record = payments.find((p) => p.month === key);
      let state = "upcoming";

      if (record?.status === "verified") state = "paid";
      else if (record?.status === "pending") state = "pending";
      else if (record?.status === "rejected") state = "due";
      else if (key < currentMonthStr) state = "overdue";
      else if (key === currentMonthStr) {
        state = dayOfMonth > 10 ? "overdue" : "due";
      }

      return {
        key,
        label: formatMonthLabel(key),
        state,
        record,
      };
    }).filter((item) => item.key >= joinMonth || item.record);
  }, [payments, joinMonth]);

  const columns = [
    {
      key: "invoice",
      header: "Invoice & Month",
      render: (row) => (
        <div>
          <p className="font-semibold text-[#141413] dark:text-[#F5F0E6]">
            {formatMonthLabel(row.month)}
          </p>
          <p className="text-xs text-[#7A7267] dark:text-[#9A9488]">
            Ref: {row.transactionId || receiptNumber(row)}
          </p>
        </div>
      ),
    },
    {
      key: "suite",
      header: "Suite",
      render: (row) => (
        <span className="font-semibold text-[#141413] dark:text-[#D4AF37]">
          {row.unit?.unitNumber || unit?.unitNumber || "—"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Fixed Rent",
      render: (row) => (
        <span className="font-bold text-[#141413] dark:text-[#F5F0E6]">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: "method",
      header: "Gateway / Method",
      render: (row) => (
        <span className="text-xs font-medium uppercase tracking-wider text-[#5C5549] dark:text-[#B8B2A6]">
          {methodLabel(row)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge status={row.status} />,
    },
    {
      key: "date",
      header: "Date",
      render: (row) => (
        <span className="text-xs text-[#7A7267]">
          {formatDate(row.paidAt || row.createdAt)}
        </span>
      ),
    },
    {
      key: "receipt",
      header: "Receipt",
      align: "right",
      render: (row) =>
        row.status === "verified" ? (
          <Button
            variant="secondary"
            size="xs"
            leftIcon={Download}
            onClick={() => openReceipt(row)}
          >
            Receipt PDF
          </Button>
        ) : (
          <span className="text-xs text-[#7A7267]">
            {row.status === "pending" ? "Awaiting verification" : "—"}
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rent Payments & SSLCommerz Checkout"
        description="Your monthly rent is locked to your assigned suite's fixed rate. Settle between the 1st and 10th to avoid overdue status."
        actions={
          unit && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={Plus}
              disabled={paymentLocked}
              onClick={() => {
                setManualForm({
                  month: selectedMonth,
                  method: "bkash",
                  transactionId: "",
                });
                setManualModalOpen(true);
              }}
            >
              Submit Manual / Mobile Transfer
            </Button>
          )
        }
      />

      {/* Instant SSLCommerz Fixed-Rent Checkout Card */}
      {unit && (
        <div className="obsidian-card p-6 sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C59B27]/40 bg-[#C59B27]/15 px-3 py-1 text-xs font-semibold text-[#D4AF37]">
                <Lock className="h-3.5 w-3.5" />
                Fixed Rent Lock · Suite {unit.unitNumber}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Instant Online Rent Settlement (SSLCommerz)
              </h2>
              <p className="text-xs sm:text-sm text-[#B8B2A6] max-w-2xl">
                Pay securely with Visa, Mastercard, bKash, Nagad, Rocket, or Internet Banking.
                The rent amount is strictly locked to your lease rate of{" "}
                <strong className="text-[#D4AF37]">{formatCurrency(lockedRentAmount)}</strong>.
              </p>
              {paymentLocked && (
                <p className="text-xs font-semibold text-[#D4AF37]">
                  {selectedRecord?.status === "verified"
                    ? `${formatMonthLabel(selectedMonth)} rent is already paid & verified.`
                    : `${formatMonthLabel(selectedMonth)} payment is awaiting admin verification.`}
                </p>
              )}
            </div>

            <div className="flex flex-col items-stretch gap-3 rounded-2xl border border-[#2A3042] bg-[#181B24] p-4 sm:flex-row sm:items-end">
              <div className="w-full sm:w-auto">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#9A9488]">
                  Billing Month
                </label>
                <input
                  type="month"
                  min={joinMonth}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#2F364A] bg-[#0E1117] px-3 text-xs font-semibold text-white focus:border-[#D4AF37] focus:outline-none sm:w-auto"
                />
              </div>
              <div className="w-full sm:w-auto">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#9A9488]">
                  Locked Rent (Read-Only)
                </label>
                <input
                  type="text"
                  readOnly
                  value={formatCurrency(lockedRentAmount)}
                  className="h-10 w-full rounded-xl border border-[#2F364A] bg-[#0E1117]/80 px-3 text-xs font-bold text-[#D4AF37] cursor-not-allowed sm:w-36"
                />
              </div>
              <Button
                variant="gold"
                size="md"
                leftIcon={CreditCard}
                isLoading={payingSsl}
                disabled={paymentLocked}
                onClick={handleSslCheckout}
              >
                Pay with SSLCommerz
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 12-Month Rent Compliance Calendar Grid */}
      <Card padding="p-6">
        <CardHeader
          icon={Calendar}
          title={`${new Date().getFullYear()} Rent Compliance Calendar`}
          subtitle="Due window: 1st–10th of each month · Overdue after the 10th"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {calendarMonths.map((item) => {
            const styles =
              item.state === "paid"
                ? "border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200"
                : item.state === "pending"
                ? "border-sky-300 dark:border-sky-500/40 bg-sky-50/70 dark:bg-sky-950/30 text-sky-900 dark:text-sky-200"
                : item.state === "overdue"
                ? "border-rose-300 dark:border-rose-500/40 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200"
                : item.state === "due"
                ? "border-[#D4AF37] bg-[#FBF3DC] dark:bg-amber-950/40 text-[#7A590E] dark:text-[#E2BE5C]"
                : "border-[#EAE1D0] dark:border-[#1E2433] bg-[#FAF7F2] dark:bg-[#0E1117] text-[#7A7267]";

            return (
              <div
                key={item.key}
                onClick={() => setSelectedMonth(item.key)}
                className={`cursor-pointer rounded-2xl border p-3 transition-transform hover:-translate-y-0.5 ${styles}`}
              >
                <p className="text-xs font-bold">{item.label}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider">
                  {item.state}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Payment Ledger Table */}
      <Card padding="p-0" className="overflow-hidden">
        <DataTable
          columns={columns}
          data={payments}
          isLoading={loading}
          emptyTitle="No rent payments recorded yet"
          emptyDescription="Use the SSLCommerz checkout above to settle your monthly rent."
        />
      </Card>

      {/* Manual Transfer Modal (With Read-Only Fixed Rent Lock) */}
      <Modal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        title="Record Bank / Mobile Rent Transfer"
        description="Your rent amount is strictly locked to your assigned suite's monthly rate."
      >
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Assigned Suite (Locked)"
              value={unit ? `Suite ${unit.unitNumber}` : ""}
              readOnly
              disabled
            />
            <Input
              label="Fixed Monthly Rent (Locked)"
              value={formatCurrency(lockedRentAmount)}
              readOnly
              disabled
              hint="Fixed rent cannot be edited by tenant"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Billing Month"
              type="month"
              min={joinMonth}
              required
              value={manualForm.month}
              onChange={(e) =>
                setManualForm((s) => ({ ...s, month: e.target.value }))
              }
            />
            <Select
              label="Payment Channel"
              value={manualForm.method}
              onChange={(e) =>
                setManualForm((s) => ({ ...s, method: e.target.value }))
              }
              options={MANUAL_METHODS}
            />
          </div>

          <Input
            label={
              manualForm.method === "cash"
                ? "Transaction / Reference ID (optional for cash)"
                : "Transaction / Reference ID"
            }
            required={manualForm.method !== "cash"}
            value={manualForm.transactionId}
            onChange={(e) =>
              setManualForm((s) => ({ ...s, transactionId: e.target.value }))
            }
          />

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setManualModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submittingManual}>
              Submit Fixed Rent ({formatCurrency(lockedRentAmount)})
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable Official Payment Receipt Modal */}
      <Modal
        isOpen={Boolean(receiptPayment)}
        onClose={() => setReceiptPayment(null)}
        title="Official Rent Payment Receipt"
        description="Verified Tower Vault payment voucher"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReceiptPayment(null)}>
              Close
            </Button>
            <Button
              variant="gold"
              leftIcon={Printer}
              onClick={() => window.print()}
            >
              Print / Save PDF Receipt
            </Button>
          </>
        }
      >
        {receiptPayment && (
          <div
            id="receipt-print"
            className="space-y-5 rounded-2xl border-2 border-[#E5DEC9] bg-[#FAF7F2] p-4 dark:border-[#252C3D] dark:bg-[#0E1117] sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5DEC9] pb-4 dark:border-[#1E2433]">
              <Logo to="/tenant/dashboard" />
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-[#9A7418] dark:text-[#D4AF37]">
                  Official Rent Receipt
                </p>
                <p className="text-sm font-bold text-[#141413] dark:text-[#F5F0E6]">
                  {receiptNumber(receiptPayment)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs sm:gap-4">
              <div>
                <p className="text-[#7A7267]">Resident Name</p>
                <p className="break-words text-sm font-bold text-[#141413] dark:text-[#F5F0E6]">
                  {receiptPayment.tenant?.name || user?.fullName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#7A7267]">Suite & Billing Month</p>
                <p className="break-words text-sm font-bold text-[#141413] dark:text-[#D4AF37]">
                  Suite {receiptPayment.unit?.unitNumber || unit?.unitNumber} ·{" "}
                  {formatMonthLabel(receiptPayment.month)}
                </p>
              </div>
              <div>
                <p className="text-[#7A7267]">Payment Method & Reference</p>
                <p className="break-words font-semibold uppercase text-[#141413] dark:text-[#F5F0E6]">
                  {methodLabel(receiptPayment)}{" "}
                  {receiptPayment.transactionId
                    ? `(${receiptPayment.transactionId})`
                    : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#7A7267]">Settlement Date</p>
                <p className="font-semibold text-[#141413] dark:text-[#F5F0E6]">
                  {formatDate(
                    receiptPayment.paidAt || receiptPayment.createdAt
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#121212] p-4 text-white">
              <div>
                <p className="text-xs text-[#B8B2A6]">Total Fixed Rent Settled</p>
                <p className="font-display text-2xl font-bold text-[#D4AF37]">
                  {formatCurrency(receiptPayment.amount)}
                </p>
              </div>
              <Badge status={receiptPayment.status} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
