"use client"

import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"

interface FilterBarProps {
  search: React.ReactNode
  /** Filter controls; inline on desktop, in a bottom sheet on mobile. */
  filters: React.ReactNode
  activeCount: number
  onClear: () => void
  trailing?: React.ReactNode
}

export function FilterBar({ search, filters, activeCount, onClear, trailing }: FilterBarProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">{search}</div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-9 bg-card" aria-label={`Filters${activeCount ? `, ${activeCount} active` : ""}`}>
              <SlidersHorizontal />
              {activeCount > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-primary text-[0.7rem] font-semibold text-primary-foreground">
                  {activeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85dvh] rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Results update as you choose.</SheetDescription>
            </SheetHeader>
            <div className="grid gap-3 overflow-y-auto px-4">{filters}</div>
            <SheetFooter className="flex-row">
              {activeCount > 0 && (
                <Button variant="outline" className="flex-1" onClick={onClear}>
                  Clear all
                </Button>
              )}
              {trailing}
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-full max-w-xs min-w-56 flex-1">{search}</div>
      {filters}
      {activeCount > 0 && (
        <Button variant="ghost" className="h-9 text-muted-foreground" onClick={onClear}>
          <X />
          Clear filters
        </Button>
      )}
      {trailing && <div className="ml-auto">{trailing}</div>}
    </div>
  )
}
