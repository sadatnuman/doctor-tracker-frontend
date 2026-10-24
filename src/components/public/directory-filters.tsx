"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { FilterSelect } from "@/components/data/filter-select"
import { SearchInput } from "@/components/data/search-input"
import { useI18n } from "@/i18n/client"
import { cn } from "@/lib/utils"

interface DirectoryFiltersProps {
  specializations: string[]
  hospitals: string[]
  /** Base path the filters apply to (directory or a specialty page). */
  basePath: string
  /** Specialty pages fix the specialty, so its filter is hidden. */
  fixedSpecialty?: boolean
}

/**
 * Filters for the server-rendered directory: each change updates the URL and the
 * server re-renders the list, so every filtered view is a real, shareable page.
 */
export function DirectoryFilters({ specializations, hospitals, basePath, fixedSpecialty }: DirectoryFiltersProps) {
  const { d } = useI18n()
  const router = useRouter()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete("page")
    startTransition(() => router.push(`${basePath}${next.size ? `?${next}` : ""}`, { scroll: false }))
  }

  const sorts = [
    { value: "name", label: d.directory.sortName },
    { value: "consultationFee", label: d.directory.sortFeeLow },
    { value: "-consultationFee", label: d.directory.sortFeeHigh },
  ]

  return (
    <div className={cn("grid gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center", pending && "opacity-70")} aria-busy={pending}>
      <div className="sm:col-span-2 lg:w-72">
        <SearchInput value={params.get("search") ?? ""} onChange={(v) => set("search", v)} placeholder={d.directory.searchPlaceholder} />
      </div>
      {!fixedSpecialty && (
        <FilterSelect
          ariaLabel={d.doctorsAdmin.specialization}
          allLabel={d.directory.allSpecialties}
          options={specializations}
          getLabel={(s) => d.enums.specialization[s] ?? s}
          value={params.get("specialization")}
          onChange={(v) => set("specialization", v)}
          className="lg:w-52"
        />
      )}
      <FilterSelect
        ariaLabel={d.doctorsAdmin.hospital}
        allLabel={d.directory.allHospitals}
        options={hospitals}
        value={params.get("hospital")}
        onChange={(v) => set("hospital", v)}
        className="lg:w-60"
      />
      <FilterSelect
        ariaLabel={d.common.sortBy}
        allLabel={d.directory.sortName}
        options={sorts.slice(1).map((s) => s.value)}
        getLabel={(v) => sorts.find((s) => s.value === v)?.label ?? v}
        value={params.get("sort")}
        onChange={(v) => set("sort", v)}
        className="lg:ml-auto lg:w-48"
      />
    </div>
  )
}
