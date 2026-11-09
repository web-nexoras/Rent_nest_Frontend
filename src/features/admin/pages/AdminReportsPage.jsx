import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Banknote, CircleDollarSign, Home, Wallet } from "lucide-react";
import { PageHeader, Card } from "../../../components/ui/Layout.jsx";
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
        <div>
          <p className="font-semibold text-navy-900">{row.tenant.name}</p>
          <p className="text-xs text-navy-400">{row.tenant.email}</p>
        </div>
      ),
    },
    { key: "unit", header: "Unit", render: (row) => `Unit ${row.unit?.unitNumber || "—"}` },
    { key: "rentDue", header: "Rent due", render: (row) => formatMoney(row.rentDue) },
    { key: "submitted", header: "Submitted", hideOn: "md", render: (row) => formatMoney(row.amountSubmitted) },
    {
      key: "outstanding",
      header: "Outstanding",
      render: (row) => (
        <span className={row.outstanding ? "font-semibold text-red-500" : "text-navy-400"}>
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
        <div>
          <p className="font-semibold text-navy-900">{row.name}</p>
          <p className="text-xs text-navy-400">{row.email}</p>
        </div>
      ),
    },
    { key: "phone", header: "Phone", hideOn: "md" },
    { key: "unit", header: "Unit", render: (row) => `Unit ${row.assignedUnit?.unitNumber || "—"}` },
    { key: "rent", header: "Rent", render: (row) => formatMoney(row.assignedUnit?.rentAmount) },
    { key: "status", header: "Status", render: () => <Badge status="overdue" /> },
  ];

  return (
    <>
      <PageHeader
        title="Revenue & overdue"
        description="Monthly collection report and tenants who haven't submitted rent."
        actions={
          <div className="flex items-center gap-2">
            <label htmlFor="report-month" className="text-sm text-navy-400">Month</label>
            <input
              id="report-month"
              type="month"
              value={month}
              onChange={(event) => event.target.value && setMonth(event.target.value)}
              className="h-10 rounded-xl border border-navy-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Collected (verified)" value={totals && formatMoney(totals.collectedAmount)} icon={Banknote} tone="brand" loading={report.isLoading} />
        <StatCard label="Submitted" value={totals && formatMoney(totals.submittedAmount)} icon={Wallet} tone="navy" loading={report.isLoading}
          hint={totals ? `${totals.paymentCount} payment${totals.paymentCount === 1 ? "" : "s"}` : undefined} />
        <StatCard label="Outstanding" value={totals && formatMoney(totals.outstandingAmount)} icon={AlertTriangle} tone="red" loading={report.isLoading} />
        <StatCard label="Active units" value={totals?.activeUnits} icon={Home} tone="accent" loading={report.isLoading} />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-navy-900">
        Rent status · {formatMonth(month)}
      </h2>
      <DataTable
        columns={reportColumns}
        rows={report.data?.tenants}
        rowKey="tenant"
        loading={report.isLoading}
        error={report.isError ? report.error : null}
        onRetry={report.refetch}
        empty={<EmptyState icon={CircleDollarSign} title="No active tenancies" description="Assign approved tenants to units to see rent status here." />}
      />

      <h2 className="mb-3 mt-8 text-lg font-semibold text-navy-900">
        Overdue tenants · {formatMonth(month)}
      </h2>
      <DataTable
        columns={overdueColumns}
        rows={overdue.data?.overdueTenants}
        loading={overdue.isLoading}
        error={overdue.isError ? overdue.error : null}
        onRetry={overdue.refetch}
        empty={<EmptyState icon={CircleDollarSign} title="Nobody is overdue" description="Every active tenant has submitted rent for this month." />}
      />
    </>
  );
}
