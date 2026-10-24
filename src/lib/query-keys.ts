import type { QueryParams } from "./api"

/** Hierarchical keys so a mutation can invalidate a whole family (e.g. every patients list). */
export const queryKeys = {
  me: ["auth", "me"] as const,
  filterOptions: ["meta", "filters"] as const,
  overview: (params: QueryParams) => ["stats", "overview", params] as const,
  stats: ["stats"] as const,

  doctors: {
    all: ["doctors"] as const,
    lists: () => ["doctors", "list"] as const,
    list: (params: QueryParams) => ["doctors", "list", params] as const,
    detail: (id: string) => ["doctors", "detail", id] as const,
    mine: ["doctors", "mine"] as const,
    myOverview: ["doctors", "mine", "overview"] as const,
    options: (search: string) => ["doctors", "options", search] as const,
  },

  patients: {
    all: ["patients"] as const,
    lists: () => ["patients", "list"] as const,
    list: (params: QueryParams) => ["patients", "list", params] as const,
  },

  appointments: {
    all: ["appointments"] as const,
    list: (params: QueryParams) => ["appointments", "list", params] as const,
    detail: (id: string) => ["appointments", "detail", id] as const,
  },

  slots: (doctorId: string, from?: string) => ["slots", doctorId, from ?? "today"] as const,
}
