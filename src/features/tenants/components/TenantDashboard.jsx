import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  Home,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { getTenantDashboard } from "@/features/tenants/api/dashboardApi.js";
import { initSslPayment } from "@/features/payments/api/paymentApi.js";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useToast } from "@/components/feedback/ToastContext.jsx";
import { PageHeader, Card, CardHeader, Skeleton } from "@/components/common/Layout.jsx";
import { StatCard } from "@/components/common/StatCard.jsx";
import { Badge } from "@/components/common/Badge.jsx";
import { Button } from "@/components/common/Button.jsx";
import {
  formatCurrency,
  formatDate,
  formatFloor,
  formatMonthLabel,
  getErrorMessage,
} from "@/utils/helpers.js";

// Tenant Luxury Dashboard with 2-Stage Due/Overdue Banner, 1-Click SSLCommerz & Agreement Access
export default function TenantDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingSsl, setPayingSsl] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTenantDashboard();
      setData(res);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load resident dashboard"));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handlePayOnlineNow = async () => {
    try {
      setPayingSsl(true);
      const res = await initSslPayment({
        month: data?.currentMonth,
      });
      if (res?.gatewayUrl) {
        window.location.href = res.gatewayUrl;
      } else {
        toast.error("Could not initialize SSLCommerz payment session.");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Payment gateway initialization failed"));
    } finally {
      setPayingSsl(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const unit = data?.unit;
  const dueStatus = data?.dueStatus;
  const dueState = dueStatus?.status;
  const rentStatus = !unit
    ? "no_unit"
    : dueState === "paid"
    ? "paid"
    : dueState === "pending_verification"
    ? "pending_verification"
    : dueStatus?.isOverdue
    ? "overdue"
    : "due";
  const needsPayment = Boolean(unit) && (rentStatus === "due" || rentStatus === "overdue");
  const reminderCount = data?.reminder?.reminderCount || 0;
  const recentPayments = data?.recentPayments || [];
  const pendingMaintenanceCount = data?.pendingMaintenanceCount || 0;
  const totalPaidAmount = recentPayments.filter((p) => p.status === "verified").reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidPaymentsCount = recentPayments.filter((p) => p.status === "verified").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome home, ${user?.fullName?.split(" ")[0] || "Resident"}`}
        description={
          unit
            ? `Suite ${unit.unitNumber} · ${formatFloor(
                unit.floor,
                unit.unitNumber
              )} · ${formatMonthLabel(data?.currentMonth)}`
            : "Your luxury resident portal & lease workspace"
        }
        badge={
          unit ? (
            <Badge status={rentStatus}>
              {rentStatus === "paid"
                ? "Current Month Paid"
                : rentStatus === "overdue"
                ? "Overdue (Past 10th)"
                : rentStatus === "pending_verification"
                ? "Awaiting Verification"
                : "Rent Due (1st–10th)"}
            </Badge>
          ) : null
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={FileCheck2}
              onClick={() => navigate("/tenant/agreement")}
            >
              Tenancy Agreement (PDF)
            </Button>
            {needsPayment && (
              <Button
                variant="gold"
                size="sm"
                leftIcon={CreditCard}
                isLoading={payingSsl}
                onClick={handlePayOnlineNow}
              >
                Pay {formatCurrency(unit.rentAmount)} via SSLCommerz
              </Button>
            )}
          </>
        }
      />

      {/* 2-Stage Due / 10th-of-Month Overdue, Pending Verification & Admin Reminder Banner */}
      {unit && rentStatus !== "paid" && (
        <div
          className={`rounded-3xl border p-5 sm:p-6 shadow-sm transition-all ${
            rentStatus === "overdue"
              ? "border-rose-300 dark:border-rose-500/40 bg-gradient-to-r from-rose-50 via-white to-rose-50/60 dark:from-rose-950/40 dark:via-[#131722] dark:to-rose-950/20"
              : rentStatus === "pending_verification"
              ? "border-sky-300 dark:border-sky-500/40 bg-gradient-to-r from-sky-50 via-white to-sky-50/60 dark:from-sky-950/40 dark:via-[#131722] dark:to-sky-950/20"
              : "border-[#D4AF37]/60 bg-gradient-to-r from-[#FBF7EA] via-white to-[#F6F2E9] dark:from-[#1C2230] dark:via-[#131722] dark:to-[#181D2B]"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  rentStatus === "overdue"
                    ? "bg-rose-600 text-white"
                    : rentStatus === "pending_verification"
                    ? "bg-sky-600 text-white"
                    : "bg-[#141413] text-[#D4AF37]"
                }`}
              >
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-[#141413] dark:text-[#F5F0E6]">
                    {rentStatus === "overdue"
                      ? `Overdue Rent Alert — ${formatMonthLabel(data?.currentMonth)}`
                      : rentStatus === "pending_verification"
                      ? `Payment Awaiting Verification — ${formatMonthLabel(data?.currentMonth)}`
                      : `Monthly Rent Due — ${formatMonthLabel(data?.currentMonth)}`}
                  </h3>
                  {reminderCount > 0 && (
                    <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                      Admin Reminder Sent ({reminderCount}×)
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs sm:text-sm text-[#5C5549] dark:text-[#B8B2A6]">
                  {dueStatus?.message ||
                    (rentStatus === "overdue"
                      ? `The 10th-of-the-month cutoff has passed. Please settle your fixed rent of ${formatCurrency(
                          unit.rentAmount
                        )} for Suite ${unit.unitNumber} immediately.`
                      : rentStatus === "pending_verification"
                      ? `Your payment for ${formatMonthLabel(
                          data?.currentMonth
                        )} has been submitted and is awaiting admin verification.`
                      : `Your fixed rent of ${formatCurrency(
                          unit.rentAmount
                        )} is due between the 1st and 10th (${
                          dueStatus?.daysUntil10th ?? 0
                        } day(s) remaining before overdue status).`)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {needsPayment ? (
                <>
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={CreditCard}
                    isLoading={payingSsl}
                    onClick={handlePayOnlineNow}
                  >
                    Pay Online Now
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => navigate("/tenant/payments")}
                  >
                    Manual / bKash Record
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate("/tenant/payments")}
                >
                  View Payment Status
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top 4 Resident KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Assigned Suite"
          value={unit ? `Suite ${unit.unitNumber}` : "Unassigned"}
          subtext={
            unit
              ? `${formatFloor(unit.floor, unit.unitNumber)} · ${unit.sizeSqft} Sq.Ft`
              : "Contact Admin"
          }
          icon={Home}
          tone="indigo"
        />
        <StatCard
          label="Fixed Monthly Rent"
          value={unit ? formatCurrency(unit.rentAmount) : "—"}
          subtext="Locked rate · Due by 10th"
          icon={CreditCard}
          tone="amber"
        />
        <StatCard
          label="Verified Rent (Recent)"
          value={formatCurrency(totalPaidAmount)}
          subtext={`${paidPaymentsCount} of ${recentPayments.length} recent receipts`}
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="Open Maintenance"
          value={pendingMaintenanceCount}
          subtext="Natural wear repairs are free"
          icon={Wrench}
          tone="violet"
        />
      </div>

      {/* Bottom Split: Recent Payments & Building Notices + Quick Agreement Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" padding="p-6">
          <CardHeader
            title="Recent Rent Settlements"
            subtitle="Your latest verified rent payments and downloadable receipts"
            action={
              <Link
                to="/tenant/payments"
                className="text-xs font-semibold text-[#9A7418] dark:text-[#D4AF37] hover:underline"
              >
                Full Ledger & Receipts →
              </Link>
            }
          />
          {recentPayments.length > 0 ? (
            <div className="divide-y divide-[#EFE9DC] dark:divide-[#1C2230]">
              {recentPayments.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between gap-3 py-3.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#141413] dark:text-[#F5F0E6]">
                      {formatMonthLabel(p.month)} ·{" "}
                      {p.transactionId ||
                        `RN-${String(p._id || "").slice(-6).toUpperCase()}`}
                    </p>
                    <p className="text-xs text-[#7A7267] dark:text-[#9A9488]">
                      Method: {p.paymentMethod || p.method || "—"} ·{" "}
                      {formatDate(p.paidAt || p.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-bold text-[#141413] dark:text-[#D4AF37]">
                      {formatCurrency(p.amount)}
                    </span>
                    <Badge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-[#7A7267]">
              No payment records yet. Use &quot;Pay Online Now&quot; to settle your monthly rent.
            </p>
          )}
        </Card>

        {/* Signature Dark Obsidian Lease Covenant Summary Card */}
        <div className="obsidian-card p-6 flex flex-col justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C59B27]/20 px-3 py-1 text-[11px] font-semibold text-[#D4AF37]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Official Lease Covenant
            </span>
            <h3 className="mt-4 font-display text-2xl font-bold text-white">
              Tenancy Agreement &amp; Damage Policy
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#B8B2A6]">
              Natural wear &amp; tear repairs carry <strong>zero fee</strong>. Intentional or
              negligent property damage requires compensation as outlined in your lease dossier.
            </p>
          </div>

          <div className="mt-6 space-y-2.5 pt-4 border-t border-[#26231D]">
            <Button
              variant="gold"
              size="md"
              leftIcon={FileCheck2}
              onClick={() => navigate("/tenant/agreement")}
              className="w-full"
            >
              View &amp; Download Agreement PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
