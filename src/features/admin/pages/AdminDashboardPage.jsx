import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  BellRing,
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  DollarSign,
  Layers,
  Plus,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { dashboardService } from "../../../services/dashboardService";
import { unitService } from "../../../services/unitService";
import { paymentService } from "../../../services/paymentService";
import { useToast } from "../../../components/ui/Toast";
import { PageHeader, Card, CardHeader, Skeleton } from "../../../components/ui/Layout";
import { StatCard } from "../../../components/ui/StatCard";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { RevenueChart } from "../../../components/ui/RevenueChart";
import {
  formatCurrency,
  formatDate,
  formatMonthLabel,
  getErrorMessage,
  getInitials,
} from "../../../lib/utils";

// Luxury Dossier Admin Dashboard with 48-Unit Matrix & Dark Obsidian Financial Card
export default function AdminDashboardPage() {
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
        dashboardService.getAdminDashboard(),
        unitService.statusMatrix().catch(() => null),
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
      const res = await unitService.seedBuilding();
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
      const res = await paymentService.remindAll({ month: data?.currentMonth });
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
      const res = await paymentService.remindTenant(tenantId, {
        month: data?.currentMonth,
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
        <Skeleton className="h-12 w-72" />
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
  const currentMonth = data?.month || data?.currentMonth;
  const isPastOverdue = data?.isPast10th ?? data?.isPastOverdueCutoff ?? (new Date().getDate() > 10);
  const daysUntilCutoff = Math.max(0, 10 - (data?.dayOfMonth || new Date().getDate()));
  const matrixSummary = matrix?.summary || {};
  const totalUnitsCount = stats.totalUnits ?? matrixSummary.totalUnits ?? 0;
  const occupiedCount = stats.occupiedUnits ?? matrixSummary.occupiedUnits ?? 0;
  const vacantCount = stats.vacantUnits ?? matrixSummary.vacantUnits ?? 0;
  const occupancyRate = totalUnitsCount > 0 ? Math.round((occupiedCount / totalUnitsCount) * 100) : 0;

  const monthlyCollected = stats.thisMonthCollection ?? matrixSummary.collectedRevenue ?? 0;
  const expectedMonthlyRent = stats.expectedMonthlyRevenue ?? matrixSummary.expectedRevenue ?? 0;
  const collectionRate = expectedMonthlyRent > 0 ? Math.round((monthlyCollected / expectedMonthlyRent) * 100) : 0;
  const pendingPaymentCount = stats.pendingPaymentCount ?? 0;
  const unpaidCount = stats.unpaidUnitsCount ?? matrixSummary.unpaidUnits ?? 0;
  const pendingMaintenanceCount = stats.pendingMaintenanceCount ?? 0;
  const recentPayments = data?.recentPayments || [];

  const overdueTenants = (matrix?.units || [])
    .filter((u) => u.occupancyStatus === "occupied" && (u.isOverdue || u.paymentStatus === "overdue" || u.paymentStatus === "due" || u.paymentStatus === "due_alert"))
    .map((u) => ({
      unitId: u._id,
      unitNumber: u.unitNumber,
      rentAmount: u.rentAmount,
      paymentStatus: u.paymentStatus,
      reminderCount: u.reminder?.reminderCount || 0,
      tenant: u.assignedTenant ? {
        _id: u.assignedTenant._id,
        fullName: u.assignedTenant.name || u.assignedTenant.fullName,
        email: u.assignedTenant.email,
        phone: u.assignedTenant.phone,
      } : null,
    }));

  const rawUnits = matrix?.units || [];
  const floorsMap = new Map();
  rawUnits.forEach((u) => {
    const fNum = u.floor || "1";
    if (!floorsMap.has(fNum)) {
      floorsMap.set(fNum, []);
    }
    floorsMap.get(fNum).push(u);
  });
  const floors = Array.from(floorsMap.entries())
    .map(([floor, fUnits]) => ({
      floor,
      floorCode: String.fromCharCode(64 + (parseInt(floor, 10) || 1)),
      units: fUnits.map((u) => ({
        ...u,
        tenant: u.assignedTenant ? {
          ...u.assignedTenant,
          fullName: u.assignedTenant.name || u.assignedTenant.fullName,
        } : null,
        currentMonthPaymentStatus: u.paymentStatus,
      })),
    }))
    .sort((a, b) => parseInt(a.floor, 10) - parseInt(b.floor, 10));

  return (
    <div className="space-y-7">
      <PageHeader
        title="Premium Luxury Dossier"
        description={`Tower Vault Overview · ${formatMonthLabel(currentMonth)} · ${
          isPastOverdue
            ? "Past 10th-of-month overdue cutoff"
            : `${daysUntilCutoff} day(s) until 10th overdue cutoff`
        }`}
        badge={
          <Badge tone={isPastOverdue ? "danger" : "warning"}>
            {isPastOverdue ? "Overdue Window Active" : "Due Window (1st–10th)"}
          </Badge>
        }
        actions={
          <>
            {totalUnitsCount < 48 && (
              <Button
                variant="gold"
                size="sm"
                leftIcon={Sparkles}
                isLoading={seeding}
                onClick={handleSeedBuilding}
              >
                Initialize 48 Units (A–L)
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              leftIcon={BellRing}
              isLoading={remindingAll}
              onClick={handleRemindAll}
            >
              Remind Unpaid ({overdueTenants.length})
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={Plus}
              onClick={() => navigate("/admin/tenants")}
            >
              Onboard Resident
            </Button>
          </>
        }
      />

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

      {/* Architectural Property Showcase Cards (Matching Reference Image) */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {[
          {
            title: "Floors A – D · Podium Suites",
            code: "A-101 to D-404 · 1,350–1,450 Sq.Ft",
            img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80",
            tag: "Executive 3BHK",
          },
          {
            title: "Floors E – H · Skyline Residences",
            code: "E-501 to H-804 · 1,650–1,750 Sq.Ft",
            img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
            tag: "Panoramic 3BHK",
          },
          {
            title: "Floors I – L · Royal Penthouses",
            code: "I-901 to L-1204 · 1,900–2,000 Sq.Ft",
            img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
            tag: "4BHK Sky Villa",
          },
        ].map((wing) => (
          <div
            key={wing.title}
            onClick={() => navigate("/admin/units")}
            className="surface-card-hover cursor-pointer overflow-hidden p-3"
          >
            <div className="relative h-44 w-full overflow-hidden rounded-xl">
              <img
                src={wing.img}
                alt={wing.title}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-[#121212]/85 px-3 py-1 text-[11px] font-semibold text-[#D4AF37] backdrop-blur-xs">
                {wing.tag}
              </span>
            </div>
            <div className="px-1 pt-3 pb-1 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-[#141413] dark:text-[#F5F0E6]">
                  {wing.title}
                </h3>
                <p className="text-xs text-[#7A7267] dark:text-[#9A9488]">{wing.code}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-[#C59B27]" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Split: Tenant Dossier Table (Left 2/3) + Signature Dark Obsidian Financial Card (Right 1/3) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2/3: Tenant Dossier & Current Month Rent Compliance */}
        <Card className="lg:col-span-2" padding="p-6">
          <CardHeader
            title="Tenant Dossier & Rent Compliance"
            subtitle={`Unpaid / Overdue & Recent Settlements for ${formatMonthLabel(
              currentMonth
            )}`}
            action={
              <Link
                to="/admin/tenants"
                className="text-xs font-semibold text-[#9A7418] dark:text-[#D4AF37] hover:underline"
              >
                View All Residents →
              </Link>
            }
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAE1D0] dark:border-[#1E2433] text-[11px] font-semibold uppercase tracking-wider text-[#7A7267] dark:text-[#9A9488]">
                  <th className="pb-3 pr-3">Resident</th>
                  <th className="pb-3 px-3">Suite</th>
                  <th className="pb-3 px-3">Rent</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 pl-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE0] dark:divide-[#1C2230] text-sm">
                {overdueTenants.length > 0 ? (
                  overdueTenants.slice(0, 6).map((item) => (
                    <tr key={item.unitId} className="hover:bg-[#FAF7F2] dark:hover:bg-[#161B26]">
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#141413] text-xs font-bold text-[#D4AF37]">
                            {getInitials(item.tenant?.fullName || "RN")}
                          </div>
                          <div>
                            <p className="font-semibold text-[#141413] dark:text-[#F5F0E6]">
                              {item.tenant?.fullName}
                            </p>
                            <p className="text-xs text-[#7A7267] dark:text-[#9A9488]">
                              {item.tenant?.phone || item.tenant?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-[#141413] dark:text-[#D4AF37]">
                        {item.unitNumber}
                      </td>
                      <td className="py-3.5 px-3 font-medium">
                        {formatCurrency(item.rentAmount)}
                      </td>
                      <td className="py-3.5 px-3">
                        <Badge status={item.paymentStatus} />
                      </td>
                      <td className="py-3.5 pl-3 text-right">
                        <Button
                          variant="secondary"
                          size="xs"
                          leftIcon={BellRing}
                          isLoading={remindingId === item.tenant?._id}
                          onClick={() => handleRemindSingle(item.tenant?._id)}
                        >
                          Remind {item.reminderCount > 0 ? `(${item.reminderCount})` : ""}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : recentPayments.length > 0 ? (
                  recentPayments.slice(0, 5).map((p) => (
                    <tr key={p._id} className="hover:bg-[#FAF7F2] dark:hover:bg-[#161B26]">
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#141413] text-xs font-bold text-[#D4AF37]">
                            {getInitials(p.tenant?.fullName || "RN")}
                          </div>
                          <div>
                            <p className="font-semibold text-[#141413] dark:text-[#F5F0E6]">
                              {p.tenant?.fullName || "Resident"}
                            </p>
                            <p className="text-xs text-[#7A7267] dark:text-[#9A9488]">
                              {p.invoiceNumber}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold">
                        {p.unit?.unitNumber || "—"}
                      </td>
                      <td className="py-3.5 px-3 font-medium">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3.5 px-3">
                        <Badge status={p.status} />
                      </td>
                      <td className="py-3.5 pl-3 text-right text-xs text-[#7A7267]">
                        {formatDate(p.paidAt || p.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-[#7A7267]">
                      All occupied units are settled for {formatMonthLabel(currentMonth)}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right 1/3: Signature Dark Obsidian Financial Overview Card (Matching Reference Image) */}
        <div className="obsidian-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium tracking-wide text-[#B8B2A6]">
                Financial Overview
              </span>
              <span className="rounded-full bg-[#C59B27]/20 px-2.5 py-0.5 text-[10px] font-semibold text-[#D4AF37]">
                {formatMonthLabel(currentMonth)}
              </span>
            </div>

            <p className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#D4AF37]">
              {formatCurrency(monthlyCollected)}
            </p>
            <p className="mt-1 text-xs text-[#9A9488]">
              Cumulative verified treasury across all active suites
            </p>

            <div className="mt-6 divide-y divide-[#26231D]">
              <Link
                to="/admin/payments"
                className="flex items-center justify-between py-3.5 group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F1C16] border border-[#C59B27]/40 text-[#D4AF37]">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {formatCurrency(monthlyCollected)}
                    </p>
                    <p className="text-xs text-[#8C8479]">Current Month Collected</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#8C8479] group-hover:translate-x-1 group-hover:text-[#D4AF37] transition-all" />
              </Link>

              <Link
                to="/admin/reports"
                className="flex items-center justify-between py-3.5 group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F1C16] border border-[#C59B27]/40 text-[#D4AF37]">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {formatCurrency(expectedMonthlyRent)}
                    </p>
                    <p className="text-xs text-[#8C8479]">Expected Monthly Rent Roll</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#8C8479] group-hover:translate-x-1 group-hover:text-[#D4AF37] transition-all" />
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#26231D] flex items-center justify-between text-xs">
            <span className="text-[#9A9488]">Collection Efficiency</span>
            <span className="font-bold text-[#D4AF37]">{collectionRate}%</span>
          </div>
        </div>
      </div>

      {/* Live 12-Floor × 4-Unit Building Matrix (A-101 to L-1204) */}
      {floors.length > 0 && (
        <Card padding="p-6">
          <CardHeader
            icon={Layers}
            title="Live 12-Floor Tower Matrix (Floors A – L)"
            subtitle="Real-time occupancy & current-month rent status across all 48 residential flats"
            action={
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-emerald-700 dark:text-emerald-300 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Paid
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBF3DC] dark:bg-amber-950/40 px-2.5 py-1 text-[#8F6B14] dark:text-[#E2BE5C] font-medium">
                  <span className="h-2 w-2 rounded-full bg-[#C59B27]" /> Due
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 text-rose-700 dark:text-rose-300 font-medium">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> Overdue
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F2ECE1] dark:bg-[#1C2230] px-2.5 py-1 text-[#6E675F] dark:text-[#9A9488] font-medium">
                  <span className="h-2 w-2 rounded-full bg-[#8C8479]" /> Vacant
                </span>
              </div>
            }
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {floors.map((f) => (
              <div
                key={f.floor}
                className="rounded-2xl border border-[#EAE1D0] dark:border-[#1E2433] bg-[#FAF7F2]/70 dark:bg-[#0E1117]/70 p-3.5"
              >
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#141413] dark:text-[#D4AF37]">
                    Floor {f.floorCode} (Level {f.floor})
                  </span>
                  <span className="text-[11px] text-[#7A7267] dark:text-[#9A9488]">
                    {f.units.filter((u) => u.status === "occupied").length}/{f.units.length} Occupied
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {f.units.map((u) => {
                    const isOccupied = u.status === "occupied";
                    const pStatus = u.currentMonthPaymentStatus;
                    const pillClass = !isOccupied
                      ? "border-[#E2D9C5] dark:border-[#242B3D] bg-white dark:bg-[#131722] text-[#6E675F] dark:text-[#9A9488]"
                      : pStatus === "paid"
                      ? "border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200"
                      : pStatus === "overdue"
                      ? "border-rose-300 dark:border-rose-500/40 bg-rose-50/90 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200"
                      : "border-[#D4AF37] bg-[#FBF3DC] dark:bg-amber-950/40 text-[#7A590E] dark:text-[#E2BE5C]";

                    return (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => navigate("/admin/units")}
                        title={`${u.unitNumber} · ${
                          u.tenant ? u.tenant.fullName : "Vacant"
                        } · ${formatCurrency(u.rentAmount)}`}
                        className={`rounded-xl border px-2 py-2 text-center transition-transform hover:-translate-y-0.5 ${pillClass}`}
                      >
                        <p className="text-xs font-bold">{u.unitNumber}</p>
                        <p className="mt-0.5 truncate text-[10px] opacity-85">
                          {isOccupied ? u.tenant?.fullName?.split(" ")[0] || "Occupied" : "Vacant"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

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
