import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, UserCheck } from "lucide-react";

// Interactive notification banner for pending resident applications
export function PendingApprovalBanner({ pendingCount = 0 }) {
  if (pendingCount <= 0) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-[#C59B27]/10 to-transparent p-4 text-xs">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C59B27]/20 text-[#D4AF37] ring-1 ring-[#D4AF37]/30">
          <UserCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold text-[#141413] dark:text-[#F5F0E6]">
            {pendingCount} Resident Application{pendingCount > 1 ? "s" : ""} Awaiting Review
          </p>
          <p className="text-[#6E675F] dark:text-[#9A9488]">
            New tenant accounts are pending admin verification before they can access their portal.
          </p>
        </div>
      </div>

      <Link
        to="/admin/tenants?status=pending"
        className="inline-flex items-center justify-center gap-1.5 self-start sm:self-auto rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D4AF37] px-4 py-2 font-semibold text-[#141413] shadow-xs hover:brightness-105 transition-all"
      >
        <span>Review Applications</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export default PendingApprovalBanner;
