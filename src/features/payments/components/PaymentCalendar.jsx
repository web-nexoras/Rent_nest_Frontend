import React from "react";
import { Calendar } from "lucide-react";
import { Card, CardHeader } from "@/components/common/Layout.jsx";

// 12-Month Rent Compliance Calendar Grid
export function PaymentCalendar({ calendarMonths = [], onSelectMonth }) {
  return (
    <Card padding="p-6">
      <CardHeader
        icon={Calendar}
        title={`${new Date().getFullYear()} Rent Compliance Calendar`}
        subtitle="Due window: 1st–10th of each month · Overdue after the 10th"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {calendarMonths.map((item) => {
          const styles =
            item.state === "paid"
              ? "border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200"
              : item.state === "pending"
              ? "border-sky-300 dark:border-sky-500/40 bg-sky-50/70 dark:bg-sky-950/30 text-sky-900 dark:text-sky-200"
              : item.state === "overdue"
              ? "border-rose-300 dark:border-rose-500/40 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200"
              : item.state === "due"
              ? "border-[#D4AF37] bg-[#FBF3DC] dark:bg-amber-950/40 text-[#7A590E] dark:text-[#E2BE5C]"
              : "border-[#EAE1D0] dark:border-[#1E2433] bg-[#FAF7F2] dark:bg-[#0E1117] text-[#7A7267]";

          return (
            <div
              key={item.key}
              onClick={() => onSelectMonth && onSelectMonth(item.key)}
              className={`cursor-pointer rounded-2xl border p-3 transition-transform hover:-translate-y-0.5 ${styles}`}
            >
              <p className="text-xs font-bold">{item.label}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider">
                {item.state}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default PaymentCalendar;
