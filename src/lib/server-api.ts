import "server-only"
import { cacheLife, cacheTag } from "next/cache"
import type { FilterOptions, Paginated, PublicDoctor } from "./types"

/**
 * Server-side reads for the public, indexable pages. Results are cached with
 * `'use cache'` so crawlers and visitors get prerendered HTML; a failed call (e.g. the
 * free-tier API waking up) is cached for seconds only, so pages recover on their own.
 */
const API = (process.env.API_URL ?? "http://localhost:4000").replace(/\/+$/, "")

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}/api${path}`, { signal: AbortSignal.timeout(9000) })
    return res.ok ? ((await res.json()) as T) : null
  } catch {
    return null
  }
}

export interface DirectoryQuery {
  page?: number
  limit?: number
  search?: string
  specialization?: string
  hospital?: string
  sort?: "name" | "consultationFee" | "-consultationFee"
}

export async function getPublicDoctors(query: DirectoryQuery = {}) {
  "use cache"
  const qs = new URLSearchParams(
    Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)])
  )
  const data = await getJson<Paginated<PublicDoctor>>(`/public/doctors?${qs}`)
  if (data) cacheLife("minutes")
  else cacheLife("seconds")
  cacheTag("doctors")
  return data
}

export async function getPublicDoctor(id: string) {
  "use cache"
  if (!/^[a-f0-9]{24}$/i.test(id)) {
    cacheLife("max")
    return { status: 404 as const }
  }
  try {
    const res = await fetch(`${API}/api/public/doctors/${id}`, { signal: AbortSignal.timeout(9000) })
    if (res.status === 404 || res.status === 400) {
      cacheLife("minutes")
      return { status: 404 as const }
    }
    if (!res.ok) throw new Error(String(res.status))
    cacheLife("minutes")
    cacheTag("doctors", `doctor-${id}`)
    return { status: 200 as const, doctor: ((await res.json()) as { data: PublicDoctor }).data }
  } catch {
    cacheLife("seconds")
    return { status: 503 as const }
  }
}

export async function getFilterOptions() {
  "use cache"
  const data = await getJson<{ data: FilterOptions }>("/meta/filters")
  if (data) cacheLife("hours")
  else cacheLife("seconds")
  return data?.data ?? null
}

/** Every doctor id, for the sitemap. */
export async function getAllDoctorIds() {
  "use cache"
  const ids: string[] = []
  for (let page = 1; page <= 50; page++) {
    const data = await getJson<Paginated<PublicDoctor>>(`/public/doctors?limit=48&page=${page}`)
    if (!data) break
    ids.push(...data.data.map((d) => d.id))
    if (!data.meta.hasNextPage) break
  }
  if (ids.length) cacheLife("hours")
  else cacheLife("seconds")
  return ids
}
