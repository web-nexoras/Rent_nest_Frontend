import { cn } from "../../lib/utils.js";

const TONES = {
  green: "bg-brand-50 text-brand-700 ring-brand-200",
  yellow: "bg-accent-100 text-accent-600 ring-accent-300",
  red: "bg-red-50 text-red-600 ring-red-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  gray: "bg-navy-50 text-navy-600 ring-navy-200",
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

export default function Badge({ tone, status, children, className }) {
  const resolved = tone || STATUS_TONE[status] || "gray";
  const text = children || LABEL[status] || status;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset",
        TONES[resolved],
        className,
      )}
    >
      {text}
    </span>
  );
}
