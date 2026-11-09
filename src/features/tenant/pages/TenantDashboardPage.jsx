import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  CreditCard,
  Home,
  Megaphone,
  Plus,
  Sparkles,
  Wallet,
  Wrench,
} from "lucide-react";
import { Card } from "../../../components/ui/Layout.jsx";
import StatCard from "../../../components/ui/StatCard.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import Button from "../../../components/ui/Button.jsx";
import { Skeleton } from "../../../components/ui/Skeleton.jsx";
import { EmptyState, ErrorState } from "../../../components/ui/States.jsx";
import { tenantService } from "../../../services/dashboardService.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import { cn, formatDate, formatMoney, formatMonth } from "../../../lib/utils.js";

const DUE_STYLES = {
  paid: {
    icon: CheckCircle2,
    banner: "from-navy-950 via-emerald-950 to-navy-900 border-emerald-500/30",
    pill: "bg-emerald-500/20 text-emerald-300 ring-emerald-400/30",
    label: "Paid & Verified",
  },
  pending_verification: {
    icon: Clock,
    banner: "from-navy-950 via-navy-900 to-navy-950 border-amber-500/30",
    pill: "bg-amber-500/20 text-amber-300 ring-amber-400/30",
    label: "Awaiting Verification",
  },
  unpaid: {
    icon: AlertCircle,
    banner: "from-navy-950 via-navy-900 to-brand-950 border-brand-500/30",
    pill: "bg-brand-500/20 text-brand-200 ring-brand-400/30",
    label: "Rent Due",
  },
};

export default function TenantDashboardPage() {
  const { user } = useAuth();
  const query = useQuery({ queryKey: ["tenant", "dashboard"], queryFn: tenantService.getDashboard });
  const data = query.data;

  if (query.isError) {
    return (
      <Card padded={false}>
        <ErrorState error={query.error} onRetry={query.refetch} />
      </Card>
    );
  }

  const due = data?.dueStatus;
  const style = due ? DUE_STYLES[due.status] || DUE_STYLES.unpaid : null;
  const overdue = due?.status === "unpaid" && due.isOverdue;

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            Resident Portal
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-[1.75rem]">
            Welcome home, {user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-0.5 text-sm text-navy-500">
            Track your monthly rent, assigned unit details, and maintenance updates.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/tenant/maintenance">
            <Button variant="outline" size="sm">
              <Plus className="h-3.5 w-3.5" /> Request Maintenance
            </Button>
          </Link>
          <Link to="/tenant/payments?pay=1">
            <Button variant="primary" size="sm">
              <CreditCard className="h-3.5 w-3.5" /> Submit Rent
            </Button>
          </Link>
        </div>
      </div>

      {query.isLoading ? (
        <Skeleton className="h-48 w-full rounded-3xl" />
      ) : !data.unit ? (
        <Card>
          <EmptyState
            icon={Home}
            title="No unit assigned yet"
            description="Your account is approved. Once an administrator assigns your unit, your rent schedule and unit overview will appear here."
          />
        </Card>
      ) : (
        <section
          className={cn(
            "relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 text-white shadow-elevated sm:p-8",
            overdue ? "border-rose-500/40 from-navy-950 via-rose-950 to-navy-900" : style.banner,
          )}
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1",
                    overdue ? "bg-rose-500/20 text-rose-200 ring-rose-400/30" : style.pill,
                  )}
                >
                  <style.icon className="h-3.5 w-3.5" />
                  {overdue ? "Overdue Rent" : style.label}
                </span>
                <span className="text-xs text-navy-300">
                  Billing month · {formatMonth(data.currentMonth)}
                </span>
              </div>

              <p className="tabular mt-3 font-display text-4xl font-extrabold tracking-tight">
                {due.status === "unpaid"
                  ? formatMoney(due.amountDue)
                  : formatMoney(data.unit.rentAmount)}
              </p>
              <p className="mt-2 max-w-xl text-sm text-navy-200">{due.message}</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-navy-300">
                <CalendarClock className="h-3.5 w-3.5 text-brand-300" /> Due date:{" "}
                <span className="font-semibold text-white">{formatDate(due.dueDate)}</span>
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-md sm:min-w-[15rem]">
              <div className="flex items-center justify-between text-xs text-navy-300">
                <span>Assigned Unit</span>
                <span className="font-bold text-white">Unit {data.unit.unitNumber}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-navy-300">
                <span>Floor</span>
                <span className="font-semibold text-white">{data.unit.floor || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-navy-300">
                <span>Monthly Rent</span>
                <span className="tabular font-semibold text-white">
                  {formatMoney(data.unit.rentAmount)}
                </span>
              </div>
              {due.status === "unpaid" && (
                <Link to="/tenant/payments?pay=1" className="mt-1">
                  <Button variant="primary" size="md" className="w-full">
                    <Wallet className="h-4 w-4" /> Pay {formatMonth(data.currentMonth)} Rent
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* KPI summary row */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link to="/tenant/unit" className="block">
          <StatCard
            label="Assigned Unit"
            value={data?.unit ? `Unit ${data.unit.unitNumber}` : "Unassigned"}
            icon={Home}
            tone="brand"
            interactive
            loading={query.isLoading}
            hint={data?.unit?.floor ? `Floor ${data.unit.floor}` : "View unit specifications"}
          />
        </Link>
        <Link to="/tenant/payments" className="block">
          <StatCard
            label="Monthly Rent"
            value={data?.unit ? formatMoney(data.unit.rentAmount) : "—"}
            icon={Wallet}
            tone="emerald"
            interactive
            loading={query.isLoading}
            hint={data?.unit ? `Due on day ${data.unit.rentDueDay} of every month` : "No active lease"}
          />
        </Link>
        <Link to="/tenant/maintenance" className="block">
          <StatCard
            label="Open Maintenance"
            value={data?.pendingMaintenanceCount ?? 0}
            icon={Wrench}
            tone="accent"
            interactive
            loading={query.isLoading}
            hint="Active requests for your unit"
          />
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card
          title="Recent Rent Payments"
          subtitle="Your latest payment submissions and verification status"
          padded={false}
          action={
            <Link to="/tenant/payments" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              View history
            </Link>
          }
        >
          {query.isLoading ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data.recentPayments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No payments submitted yet"
              description="Your rent submissions and downloadable receipts will appear here."
            />
          ) : (
            <ul className="divide-y divide-navy-100">
              {data.recentPayments.map((payment) => (
                <li
                  key={payment._id}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-navy-50/60"
                >
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{formatMonth(payment.month)}</p>
                    <p className="text-xs text-navy-500">
                      {payment.paymentMethod} · {formatDate(payment.paidAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="tabular text-sm font-bold text-navy-900">{formatMoney(payment.amount)}</p>
                    <Badge status={payment.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Community Notices"
          subtitle="Latest announcements from management"
          padded={false}
          action={
            <Link to="/notices" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Notice board
            </Link>
          }
        >
          {query.isLoading ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data.recentNotices.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No notices posted"
              description="Building announcements from your property manager will appear here."
            />
          ) : (
            <ul className="divide-y divide-navy-100">
              {data.recentNotices.map((notice) => (
                <li key={notice._id}>
                  <Link
                    to={`/notices/${notice._id}`}
                    className="group flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-navy-50/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy-900 group-hover:text-brand-600">
                        {notice.title}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-navy-500">{notice.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-navy-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Recent Maintenance Activity"
          subtitle="Status updates on your reported unit issues"
          padded={false}
          className="lg:col-span-2"
          action={
            <Link to="/tenant/maintenance" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              All requests
            </Link>
          }
        >
          {query.isLoading ? (
            <div className="space-y-3 p-5">
              {[0, 1].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data?.recentMaintenance?.length ? (
            <EmptyState
              icon={Sparkles}
              title="No maintenance requests"
              description="Need a repair? Submit a maintenance request and track its progress here."
            />
          ) : (
            <ul className="divide-y divide-navy-100">
              {data.recentMaintenance.map((request) => (
                <li
                  key={request._id}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-navy-50/60"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold capitalize text-navy-900">{request.category}</p>
                    <p className="truncate text-xs text-navy-500">{request.description}</p>
                  </div>
                  <Badge status={request.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
