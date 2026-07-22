import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from "@constants/config";

/** Formats a number as currency using the farm's configured currency (INR by default). */
export function formatCurrency(amount: number, currency: string = DEFAULT_CURRENCY): string {
  try {
    return new Intl.NumberFormat(DEFAULT_LOCALE, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount ?? 0);
  } catch {
    return `₹${(amount ?? 0).toFixed(0)}`;
  }
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE).format(value ?? 0);
}

/** Safely formats an ISO date string / Date for display. Never throws on bad input. */
export function formatDate(value: string | Date | null | undefined, pattern = "dd MMM yyyy"): string {
  if (!value) return "—";
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return "—";
  return format(date, pattern);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, "dd MMM yyyy, hh:mm a");
}

export function formatRelativeTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return "—";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function todayISODate(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Converts snake_case / kebab-case enum values into readable labels, e.g. "half_day" -> "Half Day". */
export function labelize(value: string): string {
  return value
    .split(/[_-]/)
    .map((part) => capitalize(part))
    .join(" ");
}

/** Time-of-day greeting for dashboard headers ("Good morning, Ramesh"). */
export function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}
