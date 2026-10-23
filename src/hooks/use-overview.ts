"use client"

import { useQuery } from "@tanstack/react-query"
import { subDays, subMonths, startOfMonth } from "date-fns"
import { useMemo } from "react"
import { api } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import type { RangePreset } from "@/lib/search-params"
import type { Overview } from "@/lib/types"

function presetToRange(preset: RangePreset) {
  const now = new Date()
  switch (preset) {
    case "7d":
      return { from: subDays(now, 6), interval: "day" as const }
    case "30d":
      return { from: subDays(now, 29), interval: "day" as const }
    case "90d":
      return { from: subDays(now, 89), interval: "week" as const }
    case "12m":
      return { from: startOfMonth(subMonths(now, 11)), interval: "month" as const }
    case "all":
      return { from: new Date(2000, 0, 1), interval: "month" as const }
  }
}

export function useOverview(preset: RangePreset) {
  // Day-granular `from` keeps the query key stable for the whole day (cache-friendly).
  const params = useMemo(() => {
    const { from, interval } = presetToRange(preset)
    const fromDay = new Date(Date.UTC(from.getFullYear(), from.getMonth(), from.getDate()))
    return { from: preset === "all" ? undefined : fromDay.toISOString().slice(0, 10), interval }
  }, [preset])

  return useQuery({
    queryKey: queryKeys.overview(params),
    queryFn: ({ signal }) => api.get<{ data: Overview }>("/stats/overview", params, signal).then((r) => r.data),
    placeholderData: (previous) => previous,
    staleTime: 60_000,
  })
}
