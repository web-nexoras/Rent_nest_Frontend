import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney, formatMonth } from "../../lib/utils.js";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-xl border border-navy-200/80 bg-navy-900 px-3.5 py-2.5 text-xs text-white shadow-pop">
      <p className="font-semibold text-navy-200">{formatMonth(label)}</p>
      <p className="tabular mt-1 text-base font-bold text-white">{formatMoney(row.total)}</p>
      <p className="mt-0.5 text-[11px] text-navy-300">
        {row.count} verified payment{row.count === 1 ? "" : "s"}
      </p>
    </div>
  );
}

/** Interactive Recharts area chart for verified monthly revenue. data: [{ month, total, count }] */
export default function RevenueChart({ data = [] }) {
  if (!data.length) return null;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rnRevenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity={0.32} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748B", fontSize: 12 }}
            dy={6}
          />
          <YAxis
            tickFormatter={(v) => (v >= 1000 ? `৳${(v / 1000).toFixed(0)}k` : `৳${v}`)}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748B", fontSize: 12 }}
            width={56}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#6366F1", strokeWidth: 1, strokeDasharray: "4 4" }} />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#4F46E5"
            strokeWidth={2.5}
            fill="url(#rnRevenueFill)"
            activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff", fill: "#4F46E5" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
