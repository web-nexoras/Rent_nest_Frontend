import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Calendar,
  Printer,
} from "lucide-react";
import {
  getMyPayments,
  getPaymentReceipt,
  initSslPayment,
} from "@/features/payments/api/paymentApi.js";
import { getTenantDashboard } from "@/features/tenants/api/dashboardApi.js";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useToast } from "@/components/feedback/ToastContext.jsx";
import {
  PageHeader,
  Card,
  CardHeader,
  Skeleton,
} from "@/components/common/Layout.jsx";
import { DataTable } from "@/components/common/DataTable.jsx";
import { PaymentCalendar } from "@/features/payments/components/PaymentCalendar.jsx";
import { ReceiptModal } from "@/features/payments/components/ReceiptModal.jsx";
import TenantCheckoutCard from "@/features/payments/components/TenantCheckoutCard.jsx";
import SecureCheckoutModal from "@/features/payments/components/SecureCheckoutModal.jsx";
import { createTenantPaymentColumns } from "@/features/payments/components/TenantPaymentColumns.jsx";
import {
  formatMonthLabel,
  getCurrentMonthString,
  getErrorMessage,
} from "@/utils/helpers.js";

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
  const loadRequestRef = useRef(0);
  const [payingSsl, setPayingSsl] = useState(false);
  const [sslConfirmOpen, setSslConfirmOpen] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState(null);

  const loadData = useCallback(async () => {
    const requestId = ++loadRequestRef.current;
    try {
      setLoading(true);
      setPayments([]);
      const [payRes, dashRes] = await Promise.all([
        getMyPayments(),
        getTenantDashboard().catch(() => null),
      ]);
      if (requestId !== loadRequestRef.current) return;

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
        setSslConfirmOpen(true);
        clearParams("pay");
      }
    } catch (err) {
      if (requestId === loadRequestRef.current) {
        toast.error(getErrorMessage(err, "Failed to load payments"));
      }
    } finally {
      if (requestId === loadRequestRef.current) setLoading(false);
    }
  }, [searchParams, setSearchParams, toast, user?.assignedUnit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const joinMonth = useMemo(
    () => unit?.assignedMonth || getCurrentMonthString(),
    [unit?.assignedMonth]
  );
  const visiblePayments = useMemo(
    () => payments.filter((payment) => payment.month >= joinMonth),
    [payments, joinMonth]
  );

  // Fixed monthly rent locked strictly to the assigned unit's rentAmount
  const lockedRentAmount = unit?.rentAmount || 0;
  const selectedRecord = visiblePayments.find((p) => p.month === selectedMonth);
  const paymentLocked =
    selectedRecord?.status === "pending" || selectedRecord?.status === "verified";
  const handleSslCheckout = async () => {
    if (loading) return;
    if (!unit) {
      toast.error("You do not have an assigned suite yet.");
      return;
    }
    if (paymentLocked || payingSsl) return;
    setSslConfirmOpen(true);
  };

  const continueSslCheckout = async () => {
    if (!unit || loading || paymentLocked || payingSsl) return;
    try {
      setPayingSsl(true);
      const res = await initSslPayment({ month: selectedMonth });
      if (res?.gatewayUrl) {
        window.location.assign(res.gatewayUrl);
      } else {
        toast.error("SSLCommerz gateway link could not be generated.");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not start online checkout"));
    } finally {
      setPayingSsl(false);
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
  const calendarMonths = useMemo(() => {
    const year = new Date().getFullYear();
    const currentMonthStr = getCurrentMonthString();
    const dayOfMonth = new Date().getDate();

    return Array.from({ length: 12 }, (_, idx) => {
      const m = String(idx + 1).padStart(2, "0");
      const key = `${year}-${m}`;
      const record = visiblePayments.find((p) => p.month === key);
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
    }).filter((item) => item.key >= joinMonth);
  }, [visiblePayments, joinMonth]);

  const columns = createTenantPaymentColumns({ unit, onReceipt: openReceipt });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rent Payments & SSLCommerz Checkout"
        description="Your monthly rent is locked to your assigned suite's fixed rate. Settle between the 1st and 10th to avoid overdue status."
      />
      {loading ? (
        <Card className="space-y-3">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-28 w-full" />
        </Card>
      ) : unit && (
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
      {loading ? (
        <Card>
          <Skeleton className="h-40 w-full" />
        </Card>
      ) : (
        <PaymentCalendar
          calendarMonths={calendarMonths}
          onSelectMonth={(monthKey) => setSelectedMonth(monthKey)}
        />
      )}

      {/* Payment Ledger Table */}
      <Card padding="p-0" className="overflow-hidden">
        <DataTable
          columns={columns}
          data={visiblePayments}
          isLoading={loading}
          emptyTitle="No rent payments recorded yet"
          emptyDescription="Use the SSLCommerz checkout above to settle your monthly rent."
        />
      </Card>

      <SecureCheckoutModal
        isOpen={sslConfirmOpen}
        onClose={() => setSslConfirmOpen(false)}
        onConfirm={continueSslCheckout}
        isLoading={payingSsl}
        unit={unit}
        amount={lockedRentAmount}
        month={selectedMonth}
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
