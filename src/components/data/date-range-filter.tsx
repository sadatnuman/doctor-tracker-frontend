"use client"

import { subDays, startOfYear } from "date-fns"
import { CalendarDays, X } from "lucide-react"
import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatUtcDate, localToUtcDate, utcToLocalDate } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface UtcRange {
  from: Date | null
  to: Date | null
}

interface DateRangeFilterProps {
  label: string
  value: UtcRange
  onChange: (range: UtcRange) => void
  className?: string
}

const PRESETS = [
  { label: "Last 7 days", from: () => subDays(new Date(), 6) },
  { label: "Last 30 days", from: () => subDays(new Date(), 29) },
  { label: "Last 90 days", from: () => subDays(new Date(), 89) },
  { label: "This year", from: () => startOfYear(new Date()) },
]

export function DateRangeFilter({ label, value, onChange, className }: DateRangeFilterProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const selected: DateRange | undefined = value.from
    ? { from: utcToLocalDate(value.from), to: value.to ? utcToLocalDate(value.to) : undefined }
    : undefined

  const apply = (range: DateRange | undefined) =>
    onChange({
      from: range?.from ? localToUtcDate(range.from) : null,
      to: range?.to ? localToUtcDate(range.to) : null,
    })

  const summary = value.from
    ? value.to && value.to.getTime() !== value.from.getTime()
      ? `${formatUtcDate(value.from, "d MMM yy")} – ${formatUtcDate(value.to, "d MMM yy")}`
      : `From ${formatUtcDate(value.from, "d MMM yy")}`
    : label

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("h-9 w-full justify-start bg-card font-normal", value.from ? "pr-8" : "text-muted-foreground")}
          >
            <CalendarDays />
            <span className="truncate">{summary}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col sm:flex-row">
            <div className="flex flex-wrap gap-1 border-b p-2 sm:w-36 sm:flex-col sm:border-r sm:border-b-0">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    apply({ from: preset.from(), to: new Date() })
                    setOpen(false)
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <Calendar
              mode="range"
              selected={selected}
              onSelect={apply}
              numberOfMonths={isMobile ? 1 : 2}
              defaultMonth={selected?.from ?? subDays(new Date(), 30)}
              disabled={{ after: new Date() }}
            />
          </div>
        </PopoverContent>
      </Popover>
      {value.from && (
        <button
          type="button"
          onClick={() => onChange({ from: null, to: null })}
          className="absolute top-1/2 right-2 grid size-5 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={`Clear ${label.toLowerCase()}`}
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
