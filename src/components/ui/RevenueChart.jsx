import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "../../lib/utils.js";

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatMonthTag(monthStr) {
  if (!monthStr || !monthStr.includes("-")) return monthStr || "";
  const [year, m] = monthStr.split("-");
  const idx = parseInt(m, 10) - 1;
  return `${MONTH_SHORT[idx] || m} '${String(year).slice(-2)}`;
}

export function RevenueChart({ data = [] }) {
  const chartData = (data || []).map((item) => ({
    month: formatMonthTag(item.month || item._id),
    collected: Number(item.collected ?? item.paidAmount ?? item.total ?? 0),
    pending: Number(item.pending ?? item.pendingAmount ?? 0),
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-[#E5DEC9] dark:border-[#252C3D] text-xs text-[#7A7267] dark:text-[#9A9488]">
        Revenue analytics will appear as rent payments are verified.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="goldCollectedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C59B27" stopOpacity={0.38} />
              <stop offset="95%" stopColor="#C59B27" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD1" opacity={0.45} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#8C8479" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#8C8479" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#121212",
              borderRadius: "14px",
              border: "1px solid #C59B27",
              color: "#FAF7F2",
              fontSize: "12px",
            }}
            formatter={(val) => [formatCurrency(val), "Collected Rent"]}
          />
          <Area
            type="monotone"
            dataKey="collected"
            stroke="#C59B27"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#goldCollectedGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RevenueChart;
