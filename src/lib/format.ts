import { format, formatDistanceToNowStrict } from "date-fns"
import type { Interval } from "./types"

const number = new Intl.NumberFormat("en-US")
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })

export const formatNumber = (n: number) => number.format(n)
export const formatCompact = (n: number) => compact.format(n)

export const formatDate = (value: string | Date) => format(new Date(value), "d MMM yyyy")
export const formatShortDate = (value: string | Date) => format(new Date(value), "d MMM")
export const formatRelative = (value: string | Date) => formatDistanceToNowStrict(new Date(value), { addSuffix: true })

/** Axis/tooltip labels for time buckets (bucket dates are UTC midnights). */
export function formatBucket(iso: string, interval: Interval, long = false) {
  const d = new Date(iso)
  const utc = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  if (interval === "month") return format(utc, long ? "MMMM yyyy" : "MMM")
  if (interval === "week") return long ? `Week of ${format(utc, "d MMM yyyy")}` : format(utc, "d MMM")
  return format(utc, long ? "EEEE, d MMM yyyy" : "d MMM")
}

export function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

/**
 * URL date filters are UTC midnights (nuqs `parseAsIsoDate`). These helpers convert
 * between those and the local dates shown in calendars, so no day shifts by timezone.
 */
export const toDateParam = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : undefined)
export const localToUtcDate = (d: Date) => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
export const utcToLocalDate = (d: Date) => new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
export const formatUtcDate = (d: Date, pattern = "d MMM yyyy") => format(utcToLocalDate(d), pattern)
export const todayInputValue = () => format(new Date(), "yyyy-MM-dd")
