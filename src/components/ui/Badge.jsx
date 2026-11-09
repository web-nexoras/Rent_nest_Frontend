import { cn } from "../../lib/utils.js";

const TONES = {
  green: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
  dot_green: "bg-emerald-500",
  yellow: "bg-amber-500/10 text-amber-700 ring-amber-500/25",
  dot_yellow: "bg-amber-500",
  red: "bg-rose-500/10 text-rose-700 ring-rose-500/20",
  dot_red: "bg-rose-500",
  blue: "bg-brand-500/10 text-brand-700 ring-brand-500/20",
  dot_blue: "bg-brand-500",
  gray: "bg-navy-500/10 text-navy-600 ring-navy-500/15",
  dot_gray: "bg-navy-400",
};

// Maps every status string the backend uses to a colour.
const STATUS_TONE = {
  approved: "green",
  verified: "green",
  resolved: "green",
  paid: "green",
  occupied: "blue",
  active: "green",
  pending: "yellow",
  pending_verification: "yellow",
  "in-progress": "blue",
  vacant: "gray",
  unpaid: "red",
  rejected: "red",
  inactive: "red",
  overdue: "red",
};

const LABEL = {
  pending_verification: "Awaiting verification",
  "in-progress": "In progress",
};

export default function Badge({ tone, status, dot = true, children, className }) {
  const resolved = tone || STATUS_TONE[status] || "gray";
  const text = children || LABEL[status] || status;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset",
        TONES[resolved],
        className,
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", TONES[`dot_${resolved}`])} />}
      {text}
    </span>
  );
}
