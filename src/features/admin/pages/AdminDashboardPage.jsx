import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  DoorOpen,
  Megaphone,
  Plus,
  Sparkles,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import StatCard from "../../../components/ui/StatCard.jsx";
import RevenueChart from "../../../components/ui/RevenueChart.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import Button from "../../../components/ui/Button.jsx";
import { Avatar, Card } from "../../../components/ui/Layout.jsx";
import { Skeleton } from "../../../components/ui/Skeleton.jsx";
import { EmptyState, ErrorState } from "../../../components/ui/States.jsx";
import { adminService } from "../../../services/dashboardService.js";
import { paymentService } from "../../../services/paymentService.js";
import { maintenanceService } from "../../../services/maintenanceService.js";
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
  const pendingTenants = useQuery({
    queryKey: ["admin", "pending-users"],
    queryFn: adminService.getPending,
  });
  const openMaintenance = useQuery({
    queryKey: ["maintenance", "dashboard-open"],
    queryFn: () => maintenanceService.list({ status: "pending" }),
  });

  const data = stats.data?.stats;
  const occupancy = data?.totalUnits ? Math.round((data.occupiedUnits / data.totalUnits) * 100) : 0;

  return (
    <>
      {/* Executive Welcome Hero */}
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-navy-800/80 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 p-6 text-white shadow-elevated sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-brand-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {stats.data?.month ? `Billing cycle · ${formatMonth(stats.data.month)}` : "Executive Summary"}
              </span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-navy-300">
              {data
                ? `${data.pendingApprovals} tenant registration${data.pendingApprovals === 1 ? "" : "s"} awaiting review · ${data.overdueTenantsCount} overdue rent account${data.overdueTenantsCount === 1 ? "" : "s"} · ${data.pendingMaintenanceCount} open maintenance ticket${data.pendingMaintenanceCount === 1 ? "" : "s"}.`
                : "Synchronizing live portfolio telemetry…"}
            </p>

            {/* Quick actions */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Link to="/admin/units">
                <Button size="sm" variant="primary">
                  <Plus className="h-3.5 w-3.5" /> Manage Units
                </Button>
              </Link>
              <Link to="/admin/payments">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/15 bg-white/[0.06] text-white hover:border-white/25 hover:bg-white/10 hover:text-white"
                >
                  Verify Payments
                </Button>
              </Link>
              <Link to="/notices">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/15 bg-white/[0.06] text-white hover:border-white/25 hover:bg-white/10 hover:text-white"
                >
                  <Megaphone className="h-3.5 w-3.5" /> Publish Notice
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-md sm:min-w-[15rem]">
            <p className="text-[11px] font-bold uppercase tracking-widest text-navy-300">
              Verified Revenue · {stats.data?.month ? formatMonth(stats.data.month) : "Current"}
            </p>
            <p className="tabular mt-2 font-display text-3xl font-extrabold tracking-tight text-white">
              {data ? formatMoney(data.thisMonthCollection) : "—"}
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-xs text-navy-300">
              <span>Occupancy rate</span>
              <span className="tabular font-semibold text-emerald-400">{occupancy}%</span>
            </div>
          </div>
        </div>
      </section>

      {stats.isError ? (
        <Card padded={false}>
          <ErrorState error={stats.error} onRetry={stats.refetch} />
        </Card>
      ) : (
        <>
          {/* Primary 4 KPI cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Units"
              value={data?.totalUnits}
              icon={Building2}
              tone="brand"
              loading={stats.isLoading}
              hint={data ? `${data.occupiedUnits} occupied · ${data.vacantUnits} vacant` : undefined}
            />
            <StatCard
              label="Approved Tenants"
              value={data?.totalTenants}
              icon={Users}
              tone="emerald"
              loading={stats.isLoading}
              hint="Active verified resident accounts"
            />
            <StatCard
              label="Monthly Revenue"
              value={data && formatMoney(data.thisMonthCollection)}
              icon={Banknote}
              tone="navy"
              loading={stats.isLoading}
              hint="Verified rent collected this month"
            />
            <StatCard
              label="Overdue Accounts"
              value={data?.overdueTenantsCount}
              icon={AlertTriangle}
              tone="red"
              loading={stats.isLoading}
              hint="Assigned tenants with unpaid rent"
            />
          </div>

          {/* Secondary 4 operational KPI cards */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Link to="/admin/units" className="block">
              <StatCard
                label="Available Units"
                value={data?.vacantUnits}
                icon={DoorOpen}
                tone="emerald"
                interactive
                loading={stats.isLoading}
                hint="Ready for tenant assignment"
              />
            </Link>
            <Link to="/admin/tenants?status=pending" className="block">
              <StatCard
                label="Pending Approvals"
                value={data?.pendingApprovals}
                icon={UserCheck}
                tone="accent"
                interactive
                loading={stats.isLoading}
                hint="New tenant signups to review"
              />
            </Link>
            <Link to="/admin/payments?status=pending" className="block">
              <StatCard
                label="Awaiting Verification"
                value={pendingPayments.data?.total ?? 0}
                icon={CircleDollarSign}
                tone="brand"
                interactive
                loading={pendingPayments.isLoading}
                hint="Submitted payments in queue"
              />
            </Link>
            <Link to="/admin/maintenance" className="block">
              <StatCard
                label="Open Maintenance"
                value={data?.pendingMaintenanceCount}
                icon={Wrench}
                tone="navy"
                interactive
                loading={stats.isLoading}
                hint="Pending repair requests"
              />
            </Link>
          </div>
        </>
      )}

      {/* Analytics Row: Recharts Area Chart + Occupancy Breakdown */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card
          title="Revenue Performance"
          subtitle="Verified rent collections across the last 6 billing months"
          className="xl:col-span-2"
          action={
            <Link
              to="/admin/reports"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Monthly ledger <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {stats.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : data?.revenueTrend?.length ? (
            <RevenueChart data={data.revenueTrend} />
          ) : (
            <EmptyState
              icon={CircleDollarSign}
              title="No verified revenue yet"
              description="Once you verify tenant rent submissions, monthly revenue trends will chart here automatically."
            />
          )}
        </Card>

        <Card title="Occupancy Breakdown" subtitle="Live unit allocation status">
          {stats.isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <div className="flex flex-col justify-between">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="tabular font-display text-4xl font-extrabold text-navy-900">{occupancy}%</p>
                  <p className="mt-0.5 text-xs text-navy-500">Portfolio occupancy rate</p>
                </div>
                <span className="tabular rounded-xl bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 ring-1 ring-brand-500/20">
                  {data?.occupiedUnits ?? 0} / {data?.totalUnits ?? 0} units
                </span>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-navy-100 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-700"
                  style={{ width: `${occupancy}%` }}
                />
              </div>

              <dl className="mt-6 space-y-3 border-t border-navy-100 pt-4 text-xs">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 font-medium text-navy-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-600" /> Occupied units
                  </dt>
                  <dd className="tabular font-bold text-navy-900">{data?.occupiedUnits ?? 0}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 font-medium text-navy-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Vacant units
                  </dt>
                  <dd className="tabular font-bold text-navy-900">{data?.vacantUnits ?? 0}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 font-medium text-navy-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Pending tenant approvals
                  </dt>
                  <dd className="tabular font-bold text-navy-900">{data?.pendingApprovals ?? 0}</dd>
                </div>
              </dl>

              <Link
                to="/admin/units"
                className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-xl border border-navy-200 bg-navy-50/70 py-2.5 text-xs font-semibold text-navy-800 transition hover:bg-navy-100"
              >
                Open unit inventory <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Operational Queues: Payments + Overdue + Approvals + Maintenance */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card
          title="Payments Awaiting Verification"
          subtitle="Latest rent submissions requiring review"
          action={
            <Link to="/admin/payments" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              View all
            </Link>
          }
          padded={false}
        >
          {pendingPayments.isLoading ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : pendingPayments.isError ? (
            <ErrorState error={pendingPayments.error} onRetry={pendingPayments.refetch} />
          ) : pendingPayments.data.payments.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Verification queue is clear"
              description="No pending rent payments are waiting for review."
            />
          ) : (
            <ul className="divide-y divide-navy-100">
              {pendingPayments.data.payments.map((payment) => (
                <li
                  key={payment._id}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-navy-50/60"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={payment.tenant?.name || "Tenant"} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy-900">
                        {payment.tenant?.name || "Removed tenant"}
                      </p>
                      <p className="text-xs text-navy-500">
                        Unit {payment.unit?.unitNumber || "—"} · {formatMonth(payment.month)} ·{" "}
                        {payment.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="tabular text-sm font-bold text-navy-900">{formatMoney(payment.amount)}</p>
                    <p className="text-[11px] text-navy-400">{formatDate(payment.paidAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Overdue Rent This Month"
          subtitle="Active assigned tenants without a submission"
          action={
            <Link to="/admin/reports" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Full report
            </Link>
          }
          padded={false}
        >
          {overdue.isLoading ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : overdue.isError ? (
            <ErrorState error={overdue.error} onRetry={overdue.refetch} />
          ) : overdue.data.overdueTenants.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Zero overdue accounts"
              description="Every active assigned tenant has submitted rent for this month."
            />
          ) : (
            <ul className="divide-y divide-navy-100">
              {overdue.data.overdueTenants.slice(0, 5).map((tenant) => (
                <li
                  key={tenant._id}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-navy-50/60"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={tenant.name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy-900">{tenant.name}</p>
                      <p className="text-xs text-navy-500">
                        Unit {tenant.assignedUnit?.unitNumber || "—"} · {tenant.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="tabular text-sm font-bold text-navy-900">
                      {formatMoney(tenant.assignedUnit?.rentAmount)}
                    </p>
                    <Badge status="overdue" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Pending Tenant Registrations"
          subtitle="Verified signups waiting for admin approval"
          action={
            <Link
              to="/admin/tenants?status=pending"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Review all
            </Link>
          }
          padded={false}
        >
          {pendingTenants.isLoading ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : pendingTenants.isError ? (
            <ErrorState error={pendingTenants.error} onRetry={pendingTenants.refetch} />
          ) : pendingTenants.data.pendingUsers.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title="No pending registrations"
              description="New tenant signups will appear here for approval."
            />
          ) : (
            <ul className="divide-y divide-navy-100">
              {pendingTenants.data.pendingUsers.slice(0, 5).map((person) => (
                <li
                  key={person._id}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-navy-50/60"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={person.name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy-900">{person.name}</p>
                      <p className="truncate text-xs text-navy-500">
                        {person.email} · {person.phone}
                      </p>
                    </div>
                  </div>
                  <Link to="/admin/tenants?status=pending">
                    <Button size="sm" variant="subtle">
                      Review
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Open Maintenance Requests"
          subtitle="Unresolved issues reported by tenants"
          action={
            <Link to="/admin/maintenance" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Manage desk
            </Link>
          }
          padded={false}
        >
          {openMaintenance.isLoading ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : openMaintenance.isError ? (
            <ErrorState error={openMaintenance.error} onRetry={openMaintenance.refetch} />
          ) : openMaintenance.data.maintenanceRequests.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No pending maintenance"
              description="All reported unit issues have been addressed."
            />
          ) : (
            <ul className="divide-y divide-navy-100">
              {openMaintenance.data.maintenanceRequests.slice(0, 5).map((req) => (
                <li
                  key={req._id}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-navy-50/60"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold capitalize text-navy-900">{req.category}</span>
                      <span className="rounded-md bg-navy-100 px-1.5 py-0.5 text-[11px] font-medium text-navy-700">
                        Unit {req.unit?.unitNumber || "—"}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-navy-500">{req.description}</p>
                  </div>
                  <Badge status={req.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
