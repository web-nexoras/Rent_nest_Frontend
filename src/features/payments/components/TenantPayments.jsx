import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Calendar,
  Plus,
  Printer,
} from "lucide-react";
import {
  getMyPayments,
  getPaymentReceipt,
  initSslPayment,
  submitPayment,
} from "@/features/payments/api/paymentApi.js";
import { getTenantDashboard } from "@/features/tenants/api/dashboardApi.js";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useToast } from "@/components/feedback/ToastContext.jsx";
import { PageHeader, Card, CardHeader } from "@/components/common/Layout.jsx";
import { DataTable } from "@/components/common/DataTable.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Input, Select } from "@/components/common/Input.jsx";
import { Modal } from "@/components/common/Modal.jsx";
import { PaymentCalendar } from "@/features/payments/components/PaymentCalendar.jsx";
import { ManualPaymentModal } from "@/features/payments/components/ManualPaymentModal.jsx";
import { ReceiptModal } from "@/features/payments/components/ReceiptModal.jsx";
import TenantCheckoutCard from "@/features/payments/components/TenantCheckoutCard.jsx";
import { createTenantPaymentColumns } from "@/features/payments/components/TenantPaymentColumns.jsx";
import {
  formatMonthLabel,
  getCurrentMonthString,
  getErrorMessage,
} from "@/utils/helpers.js";

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

// Tenant Payments Page with Locked Fixed Rent, 1-Click SSLCommerz & Printable PDF Receipt
export default function TenantPayments() {
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
        getMyPayments(),
        getTenantDashboard().catch(() => null),
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
      const res = await initSslPayment({ month: selectedMonth });
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
      await submitPayment({
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
      const res = await getPaymentReceipt(payment._id);
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

  const columns = createTenantPaymentColumns({ unit, onReceipt: openReceipt });

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
      {unit && (
        <TenantCheckoutCard
          unit={unit}
          lockedRentAmount={lockedRentAmount}
          paymentLocked={paymentLocked}
          selectedRecord={selectedRecord}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          minMonth={joinMonth}
          isPaying={payingSsl}
          onCheckout={handleSslCheckout}
        />
      )}


      {/* 12-Month Rent Compliance Calendar Grid */}
      <PaymentCalendar
        calendarMonths={calendarMonths}
        onSelectMonth={(monthKey) => setSelectedMonth(monthKey)}
      />

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
      <ManualPaymentModal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        unit={unit}
        lockedRentAmount={lockedRentAmount}
        joinMonth={joinMonth}
        form={manualForm}
        setForm={setManualForm}
        onSubmit={handleManualSubmit}
        isSubmitting={submittingManual}
      />

      {/* Printable Official Payment Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(receiptPayment)}
        onClose={() => setReceiptPayment(null)}
        payment={receiptPayment}
        unit={unit}
        user={user}
      />
    </div>
  );
}
