"use client"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatNumber } from "@/lib/format"
import { STATUSES, type PatientStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { STATUS_COLOR } from "./status-badge"

interface StatusBandProps {
  counts: Partial<Record<PatientStatus, number>>
  className?: string
  size?: "sm" | "lg"
}

/**
 * Part-to-whole of patient statuses as one proportional band (2px surface gaps
 * between segments), always paired with a labelled legend so colour is never the only cue.
 */
export function StatusBand({ counts, className, size = "sm" }: StatusBandProps) {
  const total = STATUSES.reduce((sum, s) => sum + (counts[s] ?? 0), 0)
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0)

  return (
    <div className={className}>
      <div
        role="img"
        aria-label={STATUSES.map((s) => `${s} ${counts[s] ?? 0}`).join(", ")}
        className={cn("flex gap-0.5 overflow-hidden rounded-full bg-muted", size === "lg" ? "h-4" : "h-3")}
      >
        {total > 0 &&
          STATUSES.map((status) =>
            counts[status] ? (
              <Tooltip key={status}>
                <TooltipTrigger asChild>
                  <span
                    className="h-full min-w-1 first:rounded-l-full last:rounded-r-full"
                    style={{ flexGrow: counts[status], backgroundColor: STATUS_COLOR[status] }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {status}: {formatNumber(counts[status]!)} ({pct(counts[status]!)}%)
                </TooltipContent>
              </Tooltip>
            ) : null
          )}
      </div>
      <ul className={cn("flex flex-wrap gap-x-5 gap-y-1.5 text-muted-foreground", size === "lg" ? "mt-4 text-sm" : "mt-2.5 text-xs")}>
        {STATUSES.map((status) => (
          <li key={status} className="flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: STATUS_COLOR[status] }} />
            {status}
            <span className="font-medium text-foreground tabular">{formatNumber(counts[status] ?? 0)}</span>
            {size === "lg" && <span className="tabular">({pct(counts[status] ?? 0)}%)</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
