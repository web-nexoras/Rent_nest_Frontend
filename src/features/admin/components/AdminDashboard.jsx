import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BellRing,
  Building2,
  DollarSign,
  Plus,
  Sparkles,
  Wrench,
} from "lucide-react";
import { getAdminDashboard } from "@/features/admin/api/adminApi.js";
import { getUnitStatusMatrix, seedBuilding } from "@/features/units/api/unitApi.js";
import { remindAllTenants, remindTenant } from "@/features/payments/api/paymentApi.js";
import { useToast } from "@/components/feedback/ToastContext.jsx";
import { PageHeader, Card, CardHeader, Skeleton } from "@/components/common/Layout.jsx";
import { StatCard } from "@/components/common/StatCard.jsx";
import { RevenueChart } from "@/components/common/RevenueChart.jsx";
import { FinancialCard } from "@/features/admin/components/FinancialCard.jsx";
import { ShowcaseWings } from "@/features/admin/components/ShowcaseWings.jsx";
import { ComplianceTable } from "@/features/admin/components/ComplianceTable.jsx";
import { FloorMatrix } from "@/features/admin/components/FloorMatrix.jsx";
import { PendingApprovalBanner } from "@/features/admin/components/PendingApprovalBanner.jsx";
import {
  formatCurrency,
  formatMonthLabel,
  getErrorMessage,
  parseFloor,
} from "@/utils/helpers.js";

// Luxury Dossier Admin Dashboard composed with clean modular feature components
export default function AdminDashboard() {
  const toast = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [remindingAll, setRemindingAll] = useState(false);
  const [remindingId, setRemindingId] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, matrixRes] = await Promise.all([
        getAdminDashboard(),
        getUnitStatusMatrix().catch(() => null),
      ]);
      setData(dashRes);
      setMatrix(matrixRes);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load dashboard"), "Error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleSeedBuilding = async () => {
    try {
      setSeeding(true);
      const res = await seedBuilding();
      toast.success(
        res?.message || "48 luxury units (A-101 to L-1204) initialized!",
        "Tower Seeded"
      );
      await loadDashboard();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not seed building"), "Seed Error");
    } finally {
      setSeeding(false);
    }
  };

  const handleRemindAll = async () => {
    try {
      setRemindingAll(true);
      const res = await remindAllTenants({ month: data?.month });
      toast.success(
        res?.message || "Overdue & due reminders dispatched to unpaid residents.",
        "Reminders Dispatched"
      );
      await loadDashboard();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not send reminders"), "Error");
    } finally {
      setRemindingAll(false);
    }
  };

  const handleRemindSingle = async (tenantId) => {
    try {
      setRemindingId(tenantId);
      const res = await remindTenant(tenantId, {
        month: data?.month,
      });
      toast.success(res?.message || "Payment reminder sent to tenant.", "Reminder Sent");
      await loadDashboard();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to send reminder"), "Error");
    } finally {
      setRemindingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-2/3" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const currentMonth = data?.month || matrix?.month;
  const isPastOverdue = data?.isPast10th ?? matrix?.isPast10th ?? false;
  const dayOfMonth = data?.dayOfMonth ?? matrix?.dayOfMonth ?? new Date().getDate();
  const daysUntilCutoff = Math.max(0, 10 - dayOfMonth);
  const matrixSummary = matrix?.summary || {};
  const totalUnitsCount = stats.totalUnits ?? matrixSummary.totalUnits ?? 0;
  const occupiedCount = stats.occupiedUnits ?? matrixSummary.occupiedUnits ?? 0;
  const vacantCount = stats.vacantUnits ?? matrixSummary.vacantUnits ?? 0;
  const occupancyRate = totalUnitsCount > 0 ? Math.round((occupiedCount / totalUnitsCount) * 100) : 0;

  const monthlyCollected = stats.thisMonthCollection ?? matrixSummary.collectedRevenue ?? 0;
  const expectedMonthlyRent = stats.expectedMonthlyRevenue ?? matrixSummary.expectedRevenue ?? 0;
  const collectionRate = expectedMonthlyRent > 0 ? Math.round((monthlyCollected / expectedMonthlyRent) * 100) : 0;
  const pendingPaymentCount = stats.pendingPaymentCount ?? matrixSummary.pendingUnits ?? 0;
  const unpaidCount = stats.unpaidUnitsCount ?? matrixSummary.unpaidUnits ?? 0;
  const pendingMaintenanceCount = stats.pendingMaintenanceCount ?? 0;
  const pendingApprovalsCount = stats.pendingApprovals ?? 0;

  const occupiedUnits = (matrix?.units || []).filter(
    (u) => u.occupancyStatus === "occupied"
  );

  const toResident = (unit) => {
    const tenant = unit.assignedTenant || unit.tenant;
    if (!tenant) return null;
    return {
      _id: tenant._id,
      fullName: tenant.fullName || tenant.name || "Resident",
      email: tenant.email,
      phone: tenant.phone,
    };
  };

  const overdueTenants = occupiedUnits
    .filter(
      (u) =>
        u.isOverdue ||
        u.paymentStatus === "overdue" ||
        u.paymentStatus === "due" ||
        u.paymentStatus === "due_alert"
    )
    .map((u) => ({
      unitId: u._id,
      unitNumber: u.unitNumber,
      rentAmount: u.rentAmount,
      paymentStatus: u.paymentStatus,
      reminderCount: u.reminder?.reminderCount || 0,
      tenant: toResident(u),
    }));

  const settledUnits = occupiedUnits
    .filter((u) => u.paymentStatus === "paid")
    .map((u) => ({
      unitId: u._id,
      unitNumber: u.unitNumber,
      rentAmount: u.payment?.amount ?? u.rentAmount,
      paymentStatus: "paid",
      paidAt: u.payment?.paidAt || u.payment?.verifiedAt || null,
      tenant: toResident(u),
    }));

  const showingSettled = overdueTenants.length === 0;
  const complianceRows = showingSettled ? settledUnits : overdueTenants;

  const floorsMap = new Map();
  (matrix?.units || []).forEach((u) => {
    const { code, level } = parseFloor(u.floor, u.unitNumber);
    const key =
      code && level > 0 ? `${level}-${code}` : `raw-${u.floor || "unassigned"}`;
    if (!floorsMap.has(key)) {
      floorsMap.set(key, { key, code, level, floorValue: u.floor, units: [] });
    }
    floorsMap.get(key).units.push({
      ...u,
      tenant: u.tenant || (u.assignedTenant ? {
        ...u.assignedTenant,
        fullName: u.assignedTenant.fullName || u.assignedTenant.name || "",
      } : null),
      currentMonthPaymentStatus: u.paymentStatus,
    });
  });

  const floors = Array.from(floorsMap.values())
    .map((floor) => ({
      ...floor,
      units: [...floor.units].sort((a, b) =>
        String(a.unitNumber).localeCompare(String(b.unitNumber), undefined, {
          numeric: true,
        })
      ),
    }))
    .sort((a, b) => a.level - b.level || a.code.localeCompare(b.code));
  const dashboardAction = "inline-flex min-h-10 w-full min-w-0 items-center justify-center gap-2 rounded-xl px-4 py-2 text-center text-sm font-semibold leading-snug transition sm:w-auto";

  return (
    <div className="space-y-7">
      <PageHeader
        title="Premium Luxury Dossier"
        description={`Tower Vault Overview · ${formatMonthLabel(currentMonth)} · ${
          isPastOverdue
            ? "Past 10th-of-month overdue cutoff"
            : `${daysUntilCutoff} day(s) until 10th overdue cutoff`
        }`}
        actions={
          <>
            {totalUnitsCount < 48 && (
              <button
                type="button"
                className={`${dashboardAction} bg-[#D4AF37] text-[#141413] hover:bg-[#C59B27] disabled:opacity-50`}
                disabled={seeding}
                onClick={handleSeedBuilding}
              >
                Initialize 48 Units (A–L)
              </button>
            )}
            <button
              type="button"
              className={`${dashboardAction} border border-[#E5DEC9] bg-white text-[#141413] hover:bg-[#F6F2E9] disabled:opacity-50 dark:border-[#252C3D] dark:bg-[#131722] dark:text-[#F5F0E6]`}
              disabled={remindingAll}
              onClick={handleRemindAll}
            >
              <BellRing className="h-4 w-4 shrink-0" />
              Remind Unpaid ({overdueTenants.length})
            </button>
            <button
              type="button"
              className={`${dashboardAction} bg-[#141413] text-white hover:bg-[#2A2927] dark:bg-[#D4AF37] dark:text-[#0B0D11]`}
              onClick={() => navigate("/admin/tenants")}
            >
              <Plus className="h-4 w-4 shrink-0" />
              Onboard Resident
            </button>
          </>
        }
      />

      {/* Pending Applications Alert Banner */}
      <PendingApprovalBanner pendingCount={pendingApprovalsCount} />

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tower Suites (A–L)"
          value={`${occupiedCount} / ${totalUnitsCount}`}
          subtext={`${vacantCount} vacant · ${occupancyRate}% occupied`}
          trend={`${occupancyRate}%`}
          icon={Building2}
          tone="indigo"
        />
        <StatCard
          label="Monthly Collected"
          value={formatCurrency(monthlyCollected)}
          subtext={`Expected: ${formatCurrency(expectedMonthlyRent)}`}
          trend={`${collectionRate}%`}
          icon={DollarSign}
          tone="emerald"
        />
        <StatCard
          label="Unpaid / Overdue"
          value={unpaidCount}
          subtext={`Unverified: ${pendingPaymentCount}`}
          trend={isPastOverdue ? "Past 10th" : "Due by 10th"}
          trendDirection={overdueTenants.length > 0 ? "down" : "up"}
          icon={AlertTriangle}
          tone="amber"
        />
        <StatCard
          label="Active Maintenance"
          value={pendingMaintenanceCount}
          subtext="Pending repair tickets"
          icon={Wrench}
          tone="violet"
        />
      </div>

      {/* Architectural Property Showcase Cards */}
      <ShowcaseWings />

      {/* Bottom Split: Tenant Dossier Table (Left 2/3) + Signature Dark Obsidian Financial Card (Right 1/3) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ComplianceTable
          currentMonth={currentMonth}
          complianceRows={complianceRows}
          showingSettled={showingSettled}
          remindingId={remindingId}
          handleRemindSingle={handleRemindSingle}
        />

        <FinancialCard
          currentMonth={currentMonth}
          monthlyCollected={monthlyCollected}
          expectedMonthlyRent={expectedMonthlyRent}
          collectionRate={collectionRate}
        />
      </div>

      {/* Live 12-Floor × 4-Unit Building Matrix (A-101 to L-1204) */}
      <FloorMatrix floors={floors} />

      {/* Revenue Velocity Chart */}
      <Card padding="p-6">
        <CardHeader
          title="Revenue Velocity & Settlement Spread"
          subtitle="Six-month collected vs. pending rent trajectory"
        />
        <RevenueChart data={stats.revenueTrend || []} />
      </Card>
    </div>
  );
}
