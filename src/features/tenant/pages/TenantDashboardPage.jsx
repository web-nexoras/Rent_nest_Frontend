import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  Home,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { dashboardService } from "../../../services/dashboardService";
import { paymentService } from "../../../services/paymentService";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../components/ui/Toast";
import { PageHeader, Card, CardHeader, Skeleton } from "../../../components/ui/Layout";
import { StatCard } from "../../../components/ui/StatCard";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import {
  formatCurrency,
  formatDate,
  formatMonthLabel,
  getErrorMessage,
} from "../../../lib/utils";

// Tenant Luxury Dashboard with 2-Stage Due/Overdue Banner, 1-Click SSLCommerz & Agreement Access
export default function TenantDashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingSsl, setPayingSsl] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getTenantDashboard();
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
      const res = await paymentService.initSsl({
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
        <Skeleton className="h-12 w-72" />
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
  const rentStatus = dueStatus ? (dueStatus.isOverdue ? "overdue" : (dueStatus.status === "paid" ? "paid" : "due")) : (unit ? "due" : "no_unit");
  const payment = data?.recentPayments?.[0];
  const pendingMaintenanceCount = data?.pendingMaintenanceCount || 0;
  const totalPaidAmount = (data?.recentPayments || []).filter(p => p.status === "verified").reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidPaymentsCount = (data?.recentPayments || []).filter(p => p.status === "verified").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome home, ${user?.fullName?.split(" ")[0] || "Resident"}`}
        description={
          unit
            ? `Suite ${unit.unitNumber} · Floor ${unit.floor} · ${formatMonthLabel(
                data?.currentMonth
              )}`
            : "Your luxury resident portal & lease workspace"
        }
        badge={
          unit ? (
            <Badge status={rentStatus === "paid" ? "paid" : rentStatus}>
              {rentStatus === "paid"
                ? "Current Month Paid"
                : rentStatus === "overdue"
                ? "Overdue (Past 10th)"
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
            {unit && rentStatus !== "paid" && (
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

      {/* 2-Stage Due / 10th-of-Month Overdue & Admin Reminder Banner */}
      {unit && rentStatus !== "paid" && (
        <div
          className={`rounded-3xl border p-5 sm:p-6 shadow-sm transition-all ${
            rentStatus === "overdue"
              ? "border-rose-300 dark:border-rose-500/40 bg-gradient-to-r from-rose-50 via-white to-rose-50/60 dark:from-rose-950/40 dark:via-[#131722] dark:to-rose-950/20"
              : "border-[#D4AF37]/60 bg-gradient-to-r from-[#FBF7EA] via-white to-[#F6F2E9] dark:from-[#1C2230] dark:via-[#131722] dark:to-[#181D2B]"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  rentStatus === "overdue"
                    ? "bg-rose-600 text-white"
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
                      : `Monthly Rent Due — ${formatMonthLabel(data?.currentMonth)}`}
                  </h3>
                  {payment?.reminderCount > 0 && (
                    <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                      Admin Reminder Sent ({payment.reminderCount}x)
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs sm:text-sm text-[#5C5549] dark:text-[#B8B2A6]">
                  {rentStatus === "overdue"
                    ? `The 10th-of-the-month cutoff has passed. Please settle your fixed rent of ${formatCurrency(
                        unit.rentAmount
                      )} for Suite ${unit.unitNumber} immediately.`
                    : `Your fixed rent of ${formatCurrency(
                        unit.rentAmount
                      )} is due between the 1st and 10th (${
                        data?.daysUntilOverdue ?? 0
                      } day(s) remaining before overdue status).`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
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
            </div>
          </div>
        </div>
      )}

      {/* Top 4 Resident KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Assigned Suite"
          value={unit ? `Suite ${unit.unitNumber}` : "Unassigned"}
          subtext={unit ? `Floor ${unit.floor} · ${unit.sizeSqft} Sq.Ft` : "Contact Admin"}
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
          label="Total Paid Rent"
          value={formatCurrency(totalPaidAmount)}
          subtext={`${paidPaymentsCount} verified receipts`}
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
          {data?.recentPayments?.length > 0 ? (
            <div className="divide-y divide-[#EFE9DC] dark:divide-[#1C2230]">
              {data.recentPayments.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between py-3.5 text-sm"
                >
                  <div>
                    <p className="font-semibold text-[#141413] dark:text-[#F5F0E6]">
                      {formatMonthLabel(p.month)} · {p.invoiceNumber}
                    </p>
                    <p className="text-xs text-[#7A7267] dark:text-[#9A9488] capitalize">
                      Method: {String(p.method || "").replace("_", " ")} ·{" "}
                      {formatDate(p.paidAt || p.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
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
