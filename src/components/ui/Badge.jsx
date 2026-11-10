import React from "react";
import { cn } from "../../lib/utils.js";

const toneStyles = {
  success:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-500/30",
  emerald:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-500/30",
  warning:
    "bg-[#FBF3DC] text-[#8F6B14] ring-[#C59B27]/30 dark:bg-amber-950/50 dark:text-[#E2BE5C] dark:ring-[#D4AF37]/30",
  amber:
    "bg-[#FBF3DC] text-[#8F6B14] ring-[#C59B27]/30 dark:bg-amber-950/50 dark:text-[#E2BE5C] dark:ring-[#D4AF37]/30",
  danger:
    "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-500/30",
  rose:
    "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-500/30",
  info:
    "bg-[#F6F2E9] text-[#4A4338] ring-[#D8CCB8] dark:bg-[#1C2230] dark:text-[#D4AF37] dark:ring-[#C59B27]/30",
  brand:
    "bg-[#F6F2E9] text-[#4A4338] ring-[#D8CCB8] dark:bg-[#1C2230] dark:text-[#D4AF37] dark:ring-[#C59B27]/30",
  purple:
    "bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950/50 dark:text-purple-300 dark:ring-purple-500/30",
  neutral:
    "bg-[#F4EFE4] text-[#5C5549] ring-[#E0D6C3] dark:bg-[#1A202E] dark:text-[#B8B2A6] dark:ring-[#2A3246]",
};

const dotStyles = {
  success: "bg-emerald-500",
  emerald: "bg-emerald-500",
  warning: "bg-[#C59B27]",
  amber: "bg-[#C59B27]",
  danger: "bg-rose-500",
  rose: "bg-rose-500",
  info: "bg-[#C59B27]",
  brand: "bg-[#C59B27]",
  purple: "bg-purple-500",
  neutral: "bg-[#8C8479]",
};

const statusMap = {
  paid: { tone: "success", label: "Paid" },
  verified: { tone: "success", label: "Verified" },
  approved: { tone: "success", label: "Approved" },
  occupied: { tone: "info", label: "Occupied" },
  vacant: { tone: "success", label: "Vacant" },
  maintenance: { tone: "warning", label: "Maintenance" },
  pending: { tone: "warning", label: "Pending" },
  pending_verification: { tone: "warning", label: "Pending Verification" },
  due: { tone: "warning", label: "Due" },
  due_alert: { tone: "warning", label: "Due Alert" },
  unpaid: { tone: "warning", label: "Unpaid" },
  overdue: { tone: "danger", label: "Overdue" },
  failed: { tone: "danger", label: "Failed" },
  open: { tone: "warning", label: "Open" },
  "in-progress": { tone: "info", label: "In Progress" },
  in_progress: { tone: "info", label: "In Progress" },
  resolved: { tone: "success", label: "Resolved" },
  rejected: { tone: "danger", label: "Rejected" },
  active: { tone: "success", label: "Active" },
  unverified: { tone: "warning", label: "Unverified" },
};

export function Badge({ status, tone, children, dot = true, className }) {
  const normalized = status ? String(status).toLowerCase() : null;
  const mapped = normalized ? statusMap[normalized] : null;
  const resolvedTone = tone || mapped?.tone || "neutral";
  const label = children ?? mapped?.label ?? status;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold ring-1 ring-inset capitalize",
        toneStyles[resolvedTone] || toneStyles.neutral,
        className
      )}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", dotStyles[resolvedTone] || dotStyles.neutral)}
        />
      )}
      {label}
    </span>
  );
}

export default Badge;
