import React from "react";
import { Link } from "react-router-dom";
import { BellRing } from "lucide-react";
import { Card, CardHeader } from "@/components/common/Layout.jsx";
import { Badge } from "@/components/common/Badge.jsx";
import { Button } from "@/components/common/Button.jsx";
import {
  formatCurrency,
  formatDate,
  formatMonthLabel,
  getInitials,
} from "@/utils/helpers.js";

// Tenant Dossier & Rent Compliance Table
export function ComplianceTable({
  currentMonth,
  complianceRows = [],
  showingSettled = false,
  remindingId = null,
  handleRemindSingle,
}) {
  return (
    <Card className="lg:col-span-2" padding="p-6">
      <CardHeader
        title="Tenant Dossier & Rent Compliance"
        subtitle={
          showingSettled
            ? `All Occupied Units Settled for ${formatMonthLabel(currentMonth)}`
            : `Unpaid / Overdue Tenants for ${formatMonthLabel(currentMonth)}`
        }
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
            {complianceRows.length > 0 ? (
              complianceRows.slice(0, 6).map((item) => (
                <tr key={item.unitId} className="hover:bg-[#FAF7F2] dark:hover:bg-[#161B26]">
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#141413] text-xs font-bold text-[#D4AF37]">
                        {getInitials(item.tenant?.fullName || "RN")}
                      </div>
                      <div>
                        <p className="font-semibold text-[#141413] dark:text-[#F5F0E6]">
                          {item.tenant?.fullName || "Resident"}
                        </p>
                        <p className="text-xs text-[#7A7267] dark:text-[#9A9488]">
                          {item.tenant?.phone || item.tenant?.email || "No direct phone"}
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
                    {item.paymentStatus === "paid" ? (
                      <span className="text-xs text-[#7A7267] dark:text-[#9A9488]">
                        {formatDate(item.paidAt)}
                      </span>
                    ) : (
                      <Button
                        variant="secondary"
                        size="xs"
                        leftIcon={BellRing}
                        disabled={!item.tenant?._id}
                        isLoading={remindingId === item.tenant?._id}
                        onClick={() => handleRemindSingle(item.tenant?._id)}
                      >
                        Remind {item.reminderCount > 0 ? `(${item.reminderCount})` : ""}
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-[#7A7267]">
                  No occupied units recorded for {formatMonthLabel(currentMonth)}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default ComplianceTable;
