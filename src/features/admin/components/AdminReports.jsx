import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Banknote,
  BellRing,
  CircleDollarSign,
  Home,
  Wallet,
} from "lucide-react";
import { PageHeader, Avatar } from "@/components/common/Layout.jsx";
import StatCard from "@/components/common/StatCard.jsx";
import Badge from "@/components/common/Badge.jsx";
import Button from "@/components/common/Button.jsx";
import DataTable from "@/components/common/DataTable.jsx";
import { EmptyState } from "@/components/feedback/States.jsx";
import {
  getMonthlyPaymentReport,
  getOverduePayments,
  remindTenant,
} from "@/features/payments/api/paymentApi.js";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { listUnits } from "@/features/units/api/unitApi.js";
import { currentMonth, formatMoney, formatMonth } from "@/utils/helpers.js";

const OVERDUE_STAGES = {
  overdue_past_10th: { tone: "danger", label: "Overdue (Past 10th)" },
  past_due_day: { tone: "warning", label: "Past Due Day" },
  due_before_10th: { tone: "warning", label: "Due (Before 10th)" },
};

export default function AdminReports() {
  const [month, setMonth] = useState(currentMonth());

  const occupiedUnits = useQuery({
    queryKey: ["units", "report-collection-start"],
    queryFn: () => listUnits({ status: "occupied", limit: 50 }),
    refetchOnMount: "always",
  });
  const collectionStartMonth = (occupiedUnits.data?.units || [])
    .map((unit) => unit.assignedMonth)
    .filter((value) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value || ""))
    .sort()[0] || null;
  const beforeCollectionStart = Boolean(collectionStartMonth && month < collectionStartMonth);

  const report = useQuery({
    queryKey: ["payments", "report", month],
    queryFn: () => getMonthlyPaymentReport({ month }),
    enabled: Boolean(month) && !occupiedUnits.isFetching && !beforeCollectionStart,
    refetchOnMount: "always",
  });
  const overdue = useQuery({
    queryKey: ["payments", "overdue", month],
    queryFn: () => getOverduePayments({ month }),
    enabled: Boolean(month) && !occupiedUnits.isFetching && !beforeCollectionStart,
    refetchOnMount: "always",
  });

  const remind = useApiMutation(
    ({ tenantId, reminderMonth }) =>
      remindTenant(tenantId, { month: reminderMonth }),
    {
      invalidate: [
        ["payments", "overdue"],
        ["payments", "report"],
      ],
    }
  );

  const totals = beforeCollectionStart
    ? { collectedAmount: 0, submittedAmount: 0, outstandingAmount: 0, activeUnits: 0, paymentCount: 0 }
    : occupiedUnits.isFetching || report.isFetching
      ? undefined
      : report.data?.totals;
  const statementRows = beforeCollectionStart ? [] : report.data?.tenants;
  const overdueRows = beforeCollectionStart ? [] : overdue.data?.overdueTenants;
  const beforeStartMessage = collectionStartMonth
    ? `Rent collection started in ${formatMonth(collectionStartMonth)}. This earlier month has no statement.`
    : "There was no rent collection for this month.";

  const reportColumns = [
    {
      key: "tenant",
      header: "Tenant",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.tenant?.name || row.tenant?.fullName || "Resident"} size="sm" />
          <div>
            <p className="font-semibold text-navy-900">{row.tenant?.name || row.tenant?.fullName || "—"}</p>
            <p className="text-xs text-navy-400">{row.tenant?.email || "—"}</p>
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
    {
      key: "stage",
      header: "Stage",
      render: (row) => {
        const stage = OVERDUE_STAGES[row.overdueStage] || OVERDUE_STAGES.due_before_10th;
        return <Badge tone={stage.tone}>{stage.label}</Badge>;
      },
    },
    {
      key: "reminders",
      header: "Reminded",
      hideOn: "md",
      render: (row) => (
        <span className="text-xs text-navy-500">
          {row.reminderCount > 0 ? `${row.reminderCount}×` : "—"}
        </span>
      ),
    },
    {
      key: "action",
      header: "",
      align: "right",
      render: (row) => (
        <Button
          variant="secondary"
          size="xs"
          leftIcon={BellRing}
          isLoading={remind.isPending && remind.variables?.tenantId === row._id}
          onClick={() => remind.mutate({ tenantId: row._id, reminderMonth: month })}
        >
          Remind
        </Button>
      ),
    },
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
              className="h-10 rounded-xl border border-navy-200/80 bg-white dark:bg-[#131722] px-3 text-sm text-navy-900 shadow-2xs focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Collected (Verified)"
          value={totals ? formatMoney(totals.collectedAmount) : "—"}
          icon={Banknote}
          tone="emerald"
          badge={formatMonth(month)}
          to={`/admin/payments?status=verified&month=${month}`}
        />
        <StatCard
          label="Total Submitted"
          value={totals ? formatMoney(totals.submittedAmount) : "—"}
          icon={Wallet}
          tone="brand"
          hint={totals ? `${totals.paymentCount} payment${totals.paymentCount === 1 ? "" : "s"} logged` : undefined}
          to={`/admin/payments?month=${month}`}
        />
        <StatCard
          label="Outstanding Balance"
          value={totals ? formatMoney(totals.outstandingAmount) : "—"}
          icon={AlertTriangle}
          tone="rose"
          to="/admin/reports#overdue-accounts"
          onClick={() =>
            document
              .getElementById("overdue-accounts")
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        />
        <StatCard
          label="Active Leases"
          value={totals?.activeUnits ?? "—"}
          icon={Home}
          tone="accent"
          to="/admin/units?status=occupied"
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
          rowKey="tenant"
          rows={statementRows}
          loading={occupiedUnits.isFetching || report.isFetching}
          error={!beforeCollectionStart && report.isError ? report.error : null}
          onRetry={report.refetch}
          empty={beforeCollectionStart
            ? <EmptyState icon={CircleDollarSign} title="No collection for this month" description={beforeStartMessage} />
            : <EmptyState icon={CircleDollarSign} title="No active tenancies" description="Assign approved tenants to units to see rent status here." />}
        />
      </div>

      <div id="overdue-accounts" className="mt-8 space-y-3">
        <div>
          <h2 className="font-display text-lg font-bold text-navy-900">
            Overdue Accounts · {formatMonth(month)}
          </h2>
          <p className="text-xs text-navy-400">Occupied units with no verified or pending payment on file for this period.</p>
        </div>
        <DataTable
          columns={overdueColumns}
          rows={overdueRows}
          loading={occupiedUnits.isFetching || overdue.isFetching}
          error={!beforeCollectionStart && overdue.isError ? overdue.error : null}
          onRetry={overdue.refetch}
          empty={beforeCollectionStart
            ? <EmptyState icon={CircleDollarSign} title="Zero overdue accounts" description={beforeStartMessage} />
            : <EmptyState icon={CircleDollarSign} title="Zero overdue accounts" description="Every active tenant has submitted rent for this month." />}
        />
      </div>
    </>
  );
}
