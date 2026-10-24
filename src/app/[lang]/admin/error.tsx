"use client"

import { ErrorState } from "@/components/common/states"

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-xl border bg-card">
      <ErrorState error={error} onRetry={reset} />
    </div>
  )
}
