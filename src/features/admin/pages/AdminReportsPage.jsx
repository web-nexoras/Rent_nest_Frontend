import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Banknote, CircleDollarSign, Home, Wallet } from "lucide-react";
import { PageHeader, Avatar } from "../../../components/ui/Layout.jsx";
import StatCard from "../../../components/ui/StatCard.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import DataTable from "../../../components/ui/DataTable.jsx";
import { EmptyState } from "../../../components/ui/States.jsx";
import { paymentService } from "../../../services/paymentService.js";
import { currentMonth, formatMoney, formatMonth } from "../../../lib/utils.js";

export default function AdminReportsPage() {
  const [month, setMonth] = useState(currentMonth());

  const report = useQuery({
    queryKey: ["payments", "report", month],
    queryFn: () => paymentService.monthlyReport({ month }),
    enabled: Boolean(month),
  });
  const overdue = useQuery({
    queryKey: ["payments", "overdue", month],
    queryFn: () => paymentService.overdue({ month }),
    enabled: Boolean(month),
  });

  const totals = report.data?.totals;

  const reportColumns = [
    {
      key: "tenant",
      header: "Tenant",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.tenant.name} size="sm" />
          <div>
            <p className="font-semibold text-navy-900">{row.tenant.name}</p>
            <p className="text-xs text-navy-400">{row.tenant.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "unit",
      header: "Unit",
      render: (row) => <span className="font-semibold text-navy-800">Unit {row.unit?.unitNumber || "—"}</span>,
    },
    { key: "rentDue", header: "Rent Due", render: (row) => <span className="tabular font-medium">{formatMoney(row.rentDue)}</span> },
    { key: "submitted", header: "Submitted", hideOn: "md", render: (row) => <span className="tabular">{formatMoney(row.amountSubmitted)}</span> },
    {
      key: "outstanding",
      header: "Outstanding",
      render: (row) => (
        <span className={row.outstanding ? "font-display font-bold tabular text-rose-600" : "tabular text-navy-400"}>
          {formatMoney(row.outstanding)}
        </span>
      ),
    },
    { key: "status", header: "Status", render: (row) => <Badge status={row.paymentStatus} /> },
  ];

  const overdueColumns = [
    {
      key: "name",
      header: "Tenant",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div>
            <p className="font-semibold text-navy-900">{row.name}</p>
            <p className="text-xs text-navy-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Phone", hideOn: "md" },
    { key: "unit", header: "Unit", render: (row) => <span className="font-semibold text-navy-800">Unit {row.assignedUnit?.unitNumber || "—"}</span> },
    { key: "rent", header: "Rent Due", render: (row) => <span className="font-display font-bold tabular text-rose-600">{formatMoney(row.assignedUnit?.rentAmount)}</span> },
    { key: "status", header: "Status", render: () => <Badge status="overdue" /> },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Financial Analytics"
        title="Revenue & Overdue"
        description="Monthly rent collection statement and delinquent account tracking."
        actions={
          <div className="flex items-center gap-2">
            <label htmlFor="report-month" className="text-xs font-semibold uppercase tracking-wider text-navy-500">
              Statement Month
            </label>
            <input
              id="report-month"
              type="month"
              value={month}
              onChange={(event) => event.target.value && setMonth(event.target.value)}
              className="h-10 rounded-xl border border-navy-200/80 bg-white px-3 text-sm text-navy-900 shadow-2xs focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Collected (Verified)"
          value={totals && formatMoney(totals.collectedAmount)}
          icon={Banknote}
          tone="emerald"
          loading={report.isLoading}
          badge={formatMonth(month)}
        />
        <StatCard
          label="Total Submitted"
          value={totals && formatMoney(totals.submittedAmount)}
          icon={Wallet}
          tone="brand"
          loading={report.isLoading}
          hint={totals ? `${totals.paymentCount} payment${totals.paymentCount === 1 ? "" : "s"} logged` : undefined}
        />
        <StatCard
          label="Outstanding Balance"
          value={totals && formatMoney(totals.outstandingAmount)}
          icon={AlertTriangle}
          tone="rose"
          loading={report.isLoading}
        />
        <StatCard
          label="Active Leases"
          value={totals?.activeUnits}
          icon={Home}
          tone="accent"
          loading={report.isLoading}
        />
      </div>

      <div className="mt-8 space-y-3">
        <div>
          <h2 className="font-display text-lg font-bold text-navy-900">
            Rent Collection Ledger · {formatMonth(month)}
          </h2>
          <p className="text-xs text-navy-400">Per-tenancy breakdown of billed, submitted, and remaining rent.</p>
        </div>
        <DataTable
          columns={reportColumns}
          rows={report.data?.tenants}
          rowKey="tenant"
          loading={report.isLoading}
          error={report.isError ? report.error : null}
          onRetry={report.refetch}
          empty={<EmptyState icon={CircleDollarSign} title="No active tenancies" description="Assign approved tenants to units to see rent status here." />}
        />
      </div>

      <div className="mt-8 space-y-3">
        <div>
          <h2 className="font-display text-lg font-bold text-navy-900">
            Overdue Accounts · {formatMonth(month)}
          </h2>
          <p className="text-xs text-navy-400">Occupied units with no verified or pending payment on file for this period.</p>
        </div>
        <DataTable
          columns={overdueColumns}
          rows={overdue.data?.overdueTenants}
          loading={overdue.isLoading}
          error={overdue.isError ? overdue.error : null}
          onRetry={overdue.refetch}
          empty={<EmptyState icon={CircleDollarSign} title="Zero overdue accounts" description="Every active tenant has submitted rent for this month." />}
        />
      </div>
    </>
  );
}
