import { ChevronLeft, ChevronRight, SearchX } from "lucide-react"
import Link from "next/link"
import { localePath, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n/dictionaries/en"
import { createFormatters, interpolate } from "@/lib/format"
import { getPublicDoctors, type DirectoryQuery } from "@/lib/server-api"
import { DoctorCard } from "./doctor-card"

export type DirectorySearchParams = Record<string, string | string[] | undefined>

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined
const SORTS = new Set(["name", "consultationFee", "-consultationFee"])

export function toDirectoryQuery(sp: DirectorySearchParams, specialization?: string): DirectoryQuery {
  const sort = one(sp.sort)
  return {
    page: Math.max(1, Number(one(sp.page)) || 1),
    limit: 12,
    search: one(sp.search)?.slice(0, 100),
    specialization: specialization ?? one(sp.specialization),
    hospital: one(sp.hospital),
    sort: sort && SORTS.has(sort) ? (sort as DirectoryQuery["sort"]) : "name",
  }
}

/** Server-rendered result grid with crawlable pagination links. */
export async function DoctorDirectory({
  locale,
  d,
  query,
  basePath,
  searchParams,
}: {
  locale: Locale
  d: Dictionary
  query: DirectoryQuery
  basePath: string
  searchParams: DirectorySearchParams
}) {
  const result = await getPublicDoctors(query)
  const f = createFormatters(locale)

  if (!result) {
    return (
      <div className="mt-8 rounded-xl border bg-card p-8 text-center">
        <p className="font-heading font-semibold">{d.directory.unavailable}</p>
        <p className="mt-1 text-sm text-muted-foreground">{d.directory.unavailableBody}</p>
      </div>
    )
  }

  if (result.data.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center rounded-xl border bg-card px-6 py-14 text-center">
        <span className="mb-4 grid size-11 place-items-center rounded-full bg-accent text-accent-foreground">
          <SearchX className="size-5" />
        </span>
        <p className="font-heading font-semibold">{d.directory.empty}</p>
        <p className="mt-1 text-sm text-muted-foreground">{d.directory.emptyBody}</p>
        <Link href={localePath(locale, basePath)} className="mt-5 text-sm font-medium text-primary hover:underline">
          {d.common.clearFilters}
        </Link>
      </div>
    )
  }

  const { page, totalPages, total } = result.meta
  const pageHref = (p: number) => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) if (typeof v === "string" && v && k !== "page") params.set(k, v)
    if (p > 1) params.set("page", String(p))
    return `${localePath(locale, basePath)}${params.size ? `?${params}` : ""}`
  }

  return (
    <>
      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {interpolate(d.common.showing, {
          range: `${f.number((page - 1) * 12 + 1)}–${f.number(Math.min(page * 12, total))}`,
          total: f.number(total),
          noun: d.nouns.doctors,
        })}
      </p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.data.map((doctor) => (
          <li key={doctor.id}>
            <DoctorCard doctor={doctor} locale={locale} d={d} headingLevel={2} />
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <nav aria-label={d.common.pagination} className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={pageHref(page - 1)} rel="prev" className="inline-flex h-9 items-center gap-1 rounded-md border bg-card px-3 text-sm hover:bg-muted">
              <ChevronLeft className="size-4" />
              {d.common.previousPage}
            </Link>
          )}
          <span className="px-3 text-sm text-muted-foreground tabular">
            {interpolate(d.common.page, { page: f.number(page), pages: f.number(totalPages) })}
          </span>
          {page < totalPages && (
            <Link href={pageHref(page + 1)} rel="next" className="inline-flex h-9 items-center gap-1 rounded-md border bg-card px-3 text-sm hover:bg-muted">
              {d.common.nextPage}
              <ChevronRight className="size-4" />
            </Link>
          )}
        </nav>
      )}
    </>
  )
}
