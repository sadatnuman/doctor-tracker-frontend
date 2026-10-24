"use client"

import { memo } from "react"
import { useI18n } from "@/i18n/client"
import type { AppointmentStatus, PatientStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Triage colours: one source of truth shared by badges and charts. */
export const STATUS_COLOR: Record<PatientStatus, string> = {
  Active: "var(--active)",
  Critical: "var(--critical)",
  Recovered: "var(--recovered)",
  Discharged: "var(--discharged)",
}

/** Booking states reuse the same semantic palette; "awaiting payment" gets the warning hue. */
export const APPOINTMENT_COLOR: Record<AppointmentStatus, string> = {
  pending_payment: "var(--pending)",
  confirmed: "var(--active)",
  completed: "var(--recovered)",
  cancelled: "var(--discharged)",
  expired: "var(--discharged)",
}

/** Wristband-style tag: tinted band with a solid colour stripe, always with a text label. */
function Band({ color, label, className }: { color: string; label: string; className?: string }) {
  return (
    <span
      className={cn("inline-flex h-6 items-center gap-1.5 rounded-md border pr-2 pl-1 text-xs font-medium whitespace-nowrap", className)}
      style={{
        color: `color-mix(in oklab, ${color} 80%, var(--foreground))`,
        backgroundColor: `color-mix(in oklab, ${color} 10%, transparent)`,
        borderColor: `color-mix(in oklab, ${color} 28%, transparent)`,
      }}
    >
      <span aria-hidden className="h-3.5 w-1 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

export const StatusBadge = memo(function StatusBadge({ status, className }: { status: PatientStatus; className?: string }) {
  const { d } = useI18n()
  return <Band color={STATUS_COLOR[status]} label={d.enums.status[status]} className={className} />
})

export const AppointmentStatusBadge = memo(function AppointmentStatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus
  className?: string
}) {
  const { d } = useI18n()
  return <Band color={APPOINTMENT_COLOR[status]} label={d.appointment.status[status]} className={className} />
})

export const ConditionTag = memo(function ConditionTag({ condition }: { condition: string }) {
  const { d } = useI18n()
  return (
    <span className="inline-flex h-6 items-center rounded-md bg-secondary px-2 text-xs font-medium whitespace-nowrap text-secondary-foreground">
      {d.enums.condition[condition as keyof typeof d.enums.condition] ?? condition}
    </span>
  )
})
