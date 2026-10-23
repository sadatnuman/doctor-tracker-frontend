"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatNumber } from "@/lib/format"
import { PAGE_SIZES } from "@/lib/search-params"
import type { PaginationMeta } from "@/lib/types"

interface PaginationProps {
  meta: PaginationMeta
  noun: [singular: string, plural: string]
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export const Pagination = memo(function Pagination({ meta, noun, onPageChange, onLimitChange }: PaginationProps) {
  const { page, limit, total, totalPages } = meta
  const start = total === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (
    <nav aria-label="Pagination" className="flex flex-col-reverse gap-3 px-1 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground tabular" aria-live="polite">
        {total === 0 ? (
          `No ${noun[1]}`
        ) : (
          <>
            Showing <span className="font-medium text-foreground">{formatNumber(start)}–{formatNumber(end)}</span> of{" "}
            <span className="font-medium text-foreground">{formatNumber(total)}</span> {total === 1 ? noun[0] : noun[1]}
          </>
        )}
      </p>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden sm:inline">Rows</span>
          <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
            <SelectTrigger size="sm" className="w-[4.5rem]" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" className="hidden sm:inline-flex" disabled={page <= 1} onClick={() => onPageChange(1)} aria-label="First page">
            <ChevronsLeft />
          </Button>
          <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
            <ChevronLeft />
          </Button>
          <span className="min-w-[5.5rem] text-center text-sm tabular">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="icon-sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
            <ChevronRight />
          </Button>
          <Button variant="outline" size="icon-sm" className="hidden sm:inline-flex" disabled={page >= totalPages} onClick={() => onPageChange(totalPages)} aria-label="Last page">
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </nav>
  )
})
