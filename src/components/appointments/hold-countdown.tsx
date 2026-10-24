"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useI18n } from "@/i18n/client"
import { queryKeys } from "@/lib/query-keys"
import { cn } from "@/lib/utils"

/**
 * mm:ss until an unpaid hold lapses. Uses the server's clock (offset from `serverTime`)
 * so a wrong device clock can't show extra time; at zero it re-fetches the booking,
 * which the API has marked expired.
 */
export function HoldCountdown({
  appointmentId,
  expiresAt,
  serverTime,
  className,
}: {
  appointmentId: string
  expiresAt: string
  serverTime?: string
  className?: string
}) {
  const { f } = useI18n()
  const queryClient = useQueryClient()
  // Clock skew captured once, when the booking was loaded.
  const [skew] = useState(() => (serverTime ? new Date(serverTime).getTime() - Date.now() : 0))
  const deadline = new Date(expiresAt).getTime()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const remaining = Math.max(0, Math.round((deadline - (now + skew)) / 1000))
  useEffect(() => {
    if (remaining === 0) queryClient.invalidateQueries({ queryKey: queryKeys.appointments.detail(appointmentId) })
  }, [remaining, appointmentId, queryClient])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  return (
    <span className={cn("font-heading font-semibold tabular", remaining <= 60 && "text-critical", className)} role="timer" aria-live="off">
      {f.number(minutes)}:{f.number(Math.floor(seconds / 10))}
      {f.number(seconds % 10)}
    </span>
  )
}
