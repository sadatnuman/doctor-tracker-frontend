"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/i18n/client"
import { PAGE_SIZES } from "@/lib/search-params"
import type { PaginationMeta } from "@/lib/types"

interface PaginationProps {
  meta: PaginationMeta
  /** Already-localized plural noun, e.g. "doctors" / "জন ডাক্তার". */
  noun: string
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export const Pagination = memo(function Pagination({ meta, noun, onPageChange, onLimitChange }: PaginationProps) {
  const { d, tr, f } = useI18n()
  const { page, limit, total, totalPages } = meta
  const start = total === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (
    <nav aria-label={d.common.pagination} className="flex flex-col-reverse gap-3 px-1 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground tabular" aria-live="polite">
        {total === 0
          ? tr(d.common.noResults, { noun })
          : tr(d.common.showing, { range: `${f.number(start)}–${f.number(end)}`, total: f.number(total), noun })}
      </p>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden sm:inline">{d.common.rows}</span>
          <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
            <SelectTrigger size="sm" className="w-[4.5rem]" aria-label={d.common.rowsPerPage}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {f.number(size)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" className="hidden sm:inline-flex" disabled={page <= 1} onClick={() => onPageChange(1)} aria-label={d.common.firstPage}>
            <ChevronsLeft />
          </Button>
          <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label={d.common.previousPage}>
            <ChevronLeft />
          </Button>
          <span className="min-w-[5.5rem] text-center text-sm tabular">
            {tr(d.common.page, { page: f.number(page), pages: f.number(totalPages) })}
          </span>
          <Button variant="outline" size="icon-sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label={d.common.nextPage}>
            <ChevronRight />
          </Button>
          <Button variant="outline" size="icon-sm" className="hidden sm:inline-flex" disabled={page >= totalPages} onClick={() => onPageChange(totalPages)} aria-label={d.common.lastPage}>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </nav>
  )
})
