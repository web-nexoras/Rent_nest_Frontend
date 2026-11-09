import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Building2,
  CircleDollarSign,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import StatCard from "../../../components/ui/StatCard.jsx";
import RevenueChart from "../../../components/ui/RevenueChart.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import { Card, PageHeader } from "../../../components/ui/Layout.jsx";
import { Skeleton } from "../../../components/ui/Skeleton.jsx";
import { EmptyState, ErrorState } from "../../../components/ui/States.jsx";
import { adminService } from "../../../services/dashboardService.js";
import { paymentService } from "../../../services/paymentService.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import { formatDate, formatMoney, formatMonth } from "../../../lib/utils.js";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const stats = useQuery({ queryKey: ["admin", "stats"], queryFn: adminService.getStats });
  const pendingPayments = useQuery({
    queryKey: ["payments", "dashboard-pending"],
    queryFn: () => paymentService.list({ status: "pending", limit: 5 }),
  });
  const overdue = useQuery({
    queryKey: ["payments", "dashboard-overdue"],
    queryFn: () => paymentService.overdue(),
  });

  const data = stats.data?.stats;
  const occupancy = data?.totalUnits ? Math.round((data.occupiedUnits / data.totalUnits) * 100) : 0;

  return (
    <>
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 p-6 text-white shadow-card sm:p-8">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-accent-500/15 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-navy-300">{stats.data?.month ? formatMonth(stats.data.month) : "This month"}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Good to see you, {user?.name?.split(" ")[0]}
            </h1>
            <p className="mt-2 max-w-md text-sm text-navy-300">
              {data
                ? `${data.pendingApprovals} tenant${data.pendingApprovals === 1 ? "" : "s"} awaiting approval · ${data.overdueTenantsCount} overdue · ${data.pendingMaintenanceCount} open maintenance request${data.pendingMaintenanceCount === 1 ? "" : "s"}.`
                : "Loading your portfolio summary…"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-navy-300">Collected this month</p>
            <p className="mt-1 text-3xl font-bold text-accent-500">
              {data ? formatMoney(data.thisMonthCollection) : "—"}
            </p>
          </div>
        </div>
      </section>

      {stats.isError ? (
        <Card padded={false}>
          <ErrorState error={stats.error} onRetry={stats.refetch} />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total units" value={data?.totalUnits} icon={Building2} tone="navy" loading={stats.isLoading}
              hint={data ? `${data.vacantUnits} vacant` : undefined} />
            <StatCard label="Approved tenants" value={data?.totalTenants} icon={Users} tone="brand" loading={stats.isLoading} />
            <StatCard label="Monthly revenue" value={data && formatMoney(data.thisMonthCollection)} icon={Banknote} tone="accent" loading={stats.isLoading}
              hint="Verified payments this month" />
            <StatCard label="Overdue tenants" value={data?.overdueTenantsCount} icon={AlertTriangle} tone="red" loading={stats.isLoading}
              hint="No payment submitted this month" />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Link to="/admin/tenants?status=pending" className="block">
              <StatCard label="Pending approvals" value={data?.pendingApprovals} icon={UserCheck} tone="accent" loading={stats.isLoading}
                hint="Review new tenant registrations" />
            </Link>
            <Link to="/admin/maintenance" className="block">
              <StatCard label="Open maintenance" value={data?.pendingMaintenanceCount} icon={Wrench} tone="navy" loading={stats.isLoading}
                hint="Requests waiting to be handled" />
            </Link>
          </div>
        </>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <Card title="Revenue trend" className="xl:col-span-2"
          action={<span className="text-xs text-navy-400">Verified payments · last 6 months</span>}>
          {stats.isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : data?.revenueTrend?.length ? (
            <RevenueChart data={data.revenueTrend} />
          ) : (
            <EmptyState icon={CircleDollarSign} title="No verified payments yet"
              description="Revenue will appear here once you verify tenant payments." />
          )}
        </Card>

        <Card title="Occupancy overview">
          {stats.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-bold text-navy-900">{occupancy}%</p>
                <p className="text-sm text-navy-400">
                  {data?.occupiedUnits ?? 0} of {data?.totalUnits ?? 0} units
                </p>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-navy-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-300 transition-all duration-1000"
                  style={{ width: `${occupancy}%` }}
                />
              </div>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-navy-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-500" /> Occupied
                  </dt>
                  <dd className="font-semibold text-navy-900">{data?.occupiedUnits ?? 0}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-navy-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-navy-200" /> Vacant
                  </dt>
                  <dd className="font-semibold text-navy-900">{data?.vacantUnits ?? 0}</dd>
                </div>
              </dl>
              <Link to="/admin/units" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                Manage units <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Payments awaiting verification"
          action={<Link to="/admin/payments" className="text-sm font-semibold text-brand-600">View all</Link>}
          padded={false}>
          {pendingPayments.isLoading ? (
            <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : pendingPayments.isError ? (
            <ErrorState error={pendingPayments.error} onRetry={pendingPayments.refetch} />
          ) : pendingPayments.data.payments.length === 0 ? (
            <EmptyState title="All caught up" description="No payments are waiting for verification." />
          ) : (
            <ul className="divide-y divide-navy-100">
              {pendingPayments.data.payments.map((payment) => (
                <li key={payment._id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy-900">{payment.tenant?.name || "Removed tenant"}</p>
                    <p className="text-xs text-navy-400">
                      Unit {payment.unit?.unitNumber || "—"} · {formatMonth(payment.month)} · {payment.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-navy-900">{formatMoney(payment.amount)}</p>
                    <p className="text-xs text-navy-400">{formatDate(payment.paidAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Overdue this month"
          action={<Link to="/admin/reports" className="text-sm font-semibold text-brand-600">Full report</Link>}
          padded={false}>
          {overdue.isLoading ? (
            <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : overdue.isError ? (
            <ErrorState error={overdue.error} onRetry={overdue.refetch} />
          ) : overdue.data.overdueTenants.length === 0 ? (
            <EmptyState title="No overdue tenants" description="Everyone has submitted rent for this month." />
          ) : (
            <ul className="divide-y divide-navy-100">
              {overdue.data.overdueTenants.slice(0, 5).map((tenant) => (
                <li key={tenant._id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy-900">{tenant.name}</p>
                    <p className="text-xs text-navy-400">
                      Unit {tenant.assignedUnit?.unitNumber || "—"} · {tenant.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-navy-900">{formatMoney(tenant.assignedUnit?.rentAmount)}</p>
                    <Badge status="overdue" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
