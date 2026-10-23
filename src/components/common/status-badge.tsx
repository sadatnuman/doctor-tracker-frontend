import { memo } from "react"
import type { PatientStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Triage colours: one source of truth shared by badges and charts. */
export const STATUS_COLOR: Record<PatientStatus, string> = {
  Active: "var(--active)",
  Critical: "var(--critical)",
  Recovered: "var(--recovered)",
  Discharged: "var(--discharged)",
}

/** Wristband-style tag: tinted band with a solid colour stripe. */
export const StatusBadge = memo(function StatusBadge({ status, className }: { status: PatientStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md border pr-2 pl-1 text-xs font-medium whitespace-nowrap",
        className
      )}
      style={{
        color: `color-mix(in oklab, ${STATUS_COLOR[status]} 80%, var(--foreground))`,
        backgroundColor: `color-mix(in oklab, ${STATUS_COLOR[status]} 10%, transparent)`,
        borderColor: `color-mix(in oklab, ${STATUS_COLOR[status]} 28%, transparent)`,
      }}
    >
      <span aria-hidden className="h-3.5 w-1 rounded-full" style={{ backgroundColor: STATUS_COLOR[status] }} />
      {status}
    </span>
  )
})

export const ConditionTag = memo(function ConditionTag({ condition }: { condition: string }) {
  return (
    <span className="inline-flex h-6 items-center rounded-md bg-secondary px-2 text-xs font-medium whitespace-nowrap text-secondary-foreground">
      {condition}
    </span>
  )
})
