/** Join class names, ignoring falsy values. */
export const cn = (...classes) => classes.filter(Boolean).join(" ");

const currency = new Intl.NumberFormat("en-BD", {
  maximumFractionDigits: 0,
});

/** Money is stored as plain numbers; the backend payment methods are Bangladeshi (BDT). */
export const formatMoney = (value) => `৳${currency.format(Number(value) || 0)}`;

export const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** "2026-11" -> "Nov 2026" */
export const formatMonth = (value) => {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return value || "—";
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
};

/** Current month in the backend's YYYY-MM format. */
export const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";

/** Convert an object into FormData, skipping empty values. Arrays/Files are appended per item. */
export const toFormData = (values, fileFields = {}) => {
  const form = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    form.append(key, value);
  });
  Object.entries(fileFields).forEach(([key, files]) => {
    (files || []).forEach((file) => form.append(key, file));
  });
  return form;
};
