import { getErrorMessage as extractAxiosError } from "@/lib/apiClient.js";

/** Join class names, ignoring falsy values. */
export const cn = (...classes) => classes.filter(Boolean).join(" ");

const currency = new Intl.NumberFormat("en-BD", {
  maximumFractionDigits: 0,
});

/** Format BDT currency */
export const formatMoney = (value) => `৳${currency.format(Number(value) || 0)}`;
export const formatCurrency = formatMoney;

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
export const formatMonthLabel = formatMonth;

/** Current month in YYYY-MM format */
export const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};
export const getCurrentMonthString = currentMonth;

/**
 * Parse the many floor shapes the backend can return:
 *  - "A (Floor 1)"  → { code: "A", level: 1 }
 *  - "3"            → { code: "C", level: 3 }
 *  - unit "A-101"   → { code: "A", level: 1 } (fallback)
 */
export const parseFloor = (floor, unitNumber = "") => {
  const raw = String(floor ?? "").trim();
  const named = raw.match(/^([A-Za-z])\s*\(?\s*floor\s*(\d+)\)?$/i);

  if (named) {
    return { code: named[1].toUpperCase(), level: Number(named[2]) };
  }

  if (/^\d+$/.test(raw)) {
    const level = Number(raw);
    return {
      code: level >= 1 && level <= 26 ? String.fromCharCode(64 + level) : "",
      level,
    };
  }

  const fromUnitNumber = String(unitNumber || "").match(/^([A-Za-z])-(\d+)/);
  if (fromUnitNumber) {
    return {
      code: fromUnitNumber[1].toUpperCase(),
      level: Number(fromUnitNumber[2].charAt(0)),
    };
  }

  if (raw) return { code: raw.charAt(0).toUpperCase(), level: 0 };
  return { code: "", level: 0 };
};

/** Human readable floor label without duplicating the word "Floor". */
export const formatFloor = (floor, unitNumber = "") => {
  const { code, level } = parseFloor(floor, unitNumber);

  if (!code) return "—";
  if (level > 0) return `Floor ${code} (Level ${level})`;
  return `Floor ${code}`;
};

export const initials = (name = "") =>
  String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "RN";
export const getInitials = initials;

export const getErrorMessage = extractAxiosError;

/** Convert an object into FormData, skipping empty values. */
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
