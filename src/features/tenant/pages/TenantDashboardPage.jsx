import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, CalendarClock, CheckCircle2, Clock, Home, Wallet, Wrench } from "lucide-react";
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
  paid: { icon: CheckCircle2, box: "from-brand-600 to-brand-500", label: "Paid" },
  pending_verification: { icon: Clock, box: "from-accent-600 to-accent-500", label: "Awaiting verification" },
  unpaid: { icon: AlertCircle, box: "from-navy-800 to-navy-700", label: "Rent due" },
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-navy-900">Hello, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-sm text-navy-400">Here's what's happening with your tenancy.</p>
      </div>

      {query.isLoading ? (
        <Skeleton className="h-44 w-full rounded-3xl" />
      ) : !data.unit ? (
        <Card>
          <EmptyState
            icon={Home}
            title="No unit assigned yet"
            description="Your account is approved. An administrator will assign you a unit shortly — you'll see your rent details here."
          />
        </Card>
      ) : (
        <section
          className={cn(
            "relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-card sm:p-8",
            overdue ? "from-red-600 to-red-500" : style.box,
          )}
        >
          <div className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <style.icon className="h-4 w-4" />
                {overdue ? "Overdue" : style.label} · {formatMonth(data.currentMonth)}
              </div>
              <p className="mt-2 text-4xl font-bold tracking-tight">
                {due.status === "unpaid" ? formatMoney(due.amountDue) : formatMoney(data.unit.rentAmount)}
              </p>
              <p className="mt-2 max-w-md text-sm text-white/85">{due.message}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-white/70">
                <CalendarClock className="h-3.5 w-3.5" /> Due {formatDate(due.dueDate)}
              </p>
            </div>
            {due.status === "unpaid" && (
              <Link to="/tenant/payments?pay=1">
                <Button variant="outline" size="lg" className="border-white/30 bg-white text-navy-900 hover:bg-white/90">
                  <Wallet className="h-4 w-4" /> Pay rent
                </Button>
              </Link>
            )}
          </div>
        </section>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="My unit" value={data?.unit ? `Unit ${data.unit.unitNumber}` : "—"} icon={Home} tone="navy" loading={query.isLoading}
          hint={data?.unit?.floor ? `Floor ${data.unit.floor}` : undefined} />
        <StatCard label="Monthly rent" value={data?.unit ? formatMoney(data.unit.rentAmount) : "—"} icon={Wallet} tone="brand" loading={query.isLoading}
          hint={data?.unit ? `Due on day ${data.unit.rentDueDay}` : undefined} />
        <StatCard label="Open maintenance" value={data?.pendingMaintenanceCount ?? 0} icon={Wrench} tone="accent" loading={query.isLoading} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Recent payments" padded={false}
          action={<Link to="/tenant/payments" className="text-sm font-semibold text-brand-600">View all</Link>}>
          {query.isLoading ? (
            <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : data.recentPayments.length === 0 ? (
            <EmptyState title="No payments yet" description="Payments you submit will be listed here." />
          ) : (
            <ul className="divide-y divide-navy-100">
              {data.recentPayments.map((payment) => (
                <li key={payment._id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{formatMonth(payment.month)}</p>
                    <p className="text-xs text-navy-400">{payment.paymentMethod} · {formatDate(payment.paidAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-navy-900">{formatMoney(payment.amount)}</p>
                    <Badge status={payment.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recent notices" padded={false}
          action={<Link to="/notices" className="text-sm font-semibold text-brand-600">View all</Link>}>
          {query.isLoading ? (
            <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : data.recentNotices.length === 0 ? (
            <EmptyState title="No notices" description="Announcements from your manager appear here." />
          ) : (
            <ul className="divide-y divide-navy-100">
              {data.recentNotices.map((notice) => (
                <li key={notice._id}>
                  <Link to={`/notices/${notice._id}`} className="group block px-5 py-3.5 transition hover:bg-navy-50/50">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-navy-900 group-hover:text-brand-600">{notice.title}</p>
                      <ArrowRight className="h-4 w-4 shrink-0 text-navy-300" />
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-navy-400">{notice.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {data?.recentMaintenance?.length > 0 && (
          <Card title="Maintenance updates" padded={false} className="lg:col-span-2"
            action={<Link to="/tenant/maintenance" className="text-sm font-semibold text-brand-600">View all</Link>}>
            <ul className="divide-y divide-navy-100">
              {data.recentMaintenance.map((request) => (
                <li key={request._id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold capitalize text-navy-900">{request.category}</p>
                    <p className="truncate text-xs text-navy-400">{request.description}</p>
                  </div>
                  <Badge status={request.status} />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}
