"use client"

import { useIsFetching } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

/**
 * The API runs on a free tier that sleeps when idle, so the first request can take
 * ~30–60s. If any request is still pending after 4s, explain the wait instead of
 * leaving people staring at skeletons.
 */
export function ServerWakeNotice() {
  const fetching = useIsFetching() > 0
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    if (!fetching) return
    const id = setTimeout(() => setSlow(true), 4000)
    return () => {
      clearTimeout(id)
      setSlow(false)
    }
  }, [fetching])

  if (!slow) return null

  return (
    <p role="status" className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
      <Loader2 className="size-3.5 animate-spin text-primary" />
      <span>
        Waking the server<span className="hidden sm:inline"> — the first load after a quiet spell can take up to a minute</span>
      </span>
    </p>
  )
}
