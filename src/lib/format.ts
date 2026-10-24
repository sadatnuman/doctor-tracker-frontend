import { format } from "date-fns"
import { INTL_LOCALE, type Locale } from "@/i18n/config"
import type { Interval } from "./types"

/** Clinic timezone: appointment times are always shown in Bangladesh time. */
export const CLINIC_TZ = "Asia/Dhaka"

/**
 * Locale-aware formatters. Bangla output uses Bengali digits and month names
 * (Intl "bn-BD"); English uses day-month-year ("24 Oct 2026").
 */
export function createFormatters(locale: Locale) {
  const tag = INTL_LOCALE[locale]
  const number = new Intl.NumberFormat(tag)
  const compact = new Intl.NumberFormat(tag, { notation: "compact", maximumFractionDigits: 1 })
  const money = new Intl.NumberFormat(tag, { maximumFractionDigits: 0 })
  const date = new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", year: "numeric" })
  const utcDate = new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", year: "2-digit", timeZone: "UTC" })
  const clinicDate = new Intl.DateTimeFormat(tag, { weekday: "short", day: "numeric", month: "short", timeZone: CLINIC_TZ })
  const clinicDateLong = new Intl.DateTimeFormat(tag, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: CLINIC_TZ,
  })
  const clinicTime = new Intl.DateTimeFormat(tag, { hour: "numeric", minute: "2-digit", timeZone: CLINIC_TZ })
  const dateTime = new Intl.DateTimeFormat(tag, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: CLINIC_TZ,
  })
  const month = new Intl.DateTimeFormat(tag, { month: "short", timeZone: "UTC" })
  const monthLong = new Intl.DateTimeFormat(tag, { month: "long", year: "numeric", timeZone: "UTC" })
  const dayMonth = new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", timeZone: "UTC" })
  const dayLong = new Intl.DateTimeFormat(tag, { weekday: "long", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })

  return {
    number: (n: number) => number.format(n),
    compact: (n: number) => compact.format(n),
    /** "৳1,200" / "৳১,২০০" */
    money: (n: number) => `৳${money.format(n)}`,
    date: (value: string | Date) => date.format(new Date(value)),
    /** UTC calendar dates from URL filters. */
    utcDate: (value: Date) => utcDate.format(value),
    /** Appointment slots, in clinic time. */
    slotDay: (value: string | Date) => clinicDate.format(new Date(value)),
    slotDayLong: (value: string | Date) => clinicDateLong.format(new Date(value)),
    slotTime: (value: string | Date) => clinicTime.format(new Date(value)),
    dateTime: (value: string | Date) => dateTime.format(new Date(value)),
    /** Wall-clock "HH:mm" from a schedule, shown as "9:30 am" / "৯:৩০ AM". */
    wallTime: (hhmm: string) => {
      const [h, m] = hhmm.split(":").map(Number) as [number, number]
      return new Intl.DateTimeFormat(tag, { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(
        new Date(Date.UTC(2000, 0, 1, h, m))
      )
    },
    /** Axis/tooltip labels for dashboard time buckets (UTC midnights). */
    bucket: (iso: string, interval: Interval, long = false) => {
      const d = new Date(iso)
      if (interval === "month") return (long ? monthLong : month).format(d)
      return (long ? dayLong : dayMonth).format(d)
    },
  }
}

export type Formatters = ReturnType<typeof createFormatters>

/** "{name} added" + { name: "Rafi" } → "Rafi added". */
export function interpolate(template: string, vars: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match))
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
export const todayInputValue = () => format(new Date(), "yyyy-MM-dd")
