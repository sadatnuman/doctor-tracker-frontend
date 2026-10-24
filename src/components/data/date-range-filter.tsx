"use client"

import { subDays, startOfYear } from "date-fns"
import { CalendarDays, X } from "lucide-react"
import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useIsMobile } from "@/hooks/use-mobile"
import { localToUtcDate, utcToLocalDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useI18n } from "@/i18n/client"

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
  { days: 7, from: () => subDays(new Date(), 6) },
  { days: 30, from: () => subDays(new Date(), 29) },
  { days: 90, from: () => subDays(new Date(), 89) },
  { days: 0, from: () => startOfYear(new Date()) },
]

export function DateRangeFilter({ label, value, onChange, className }: DateRangeFilterProps) {
  const isMobile = useIsMobile()
  const { d, tr, f } = useI18n()
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
      ? `${f.utcDate(value.from)} – ${f.utcDate(value.to)}`
      : tr(d.dates.from, { date: f.utcDate(value.from) })
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
                  key={preset.days}
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    apply({ from: preset.from(), to: new Date() })
                    setOpen(false)
                  }}
                >
                  {preset.days ? tr(d.dates.lastDays, { n: f.number(preset.days) }) : d.dates.thisYear}
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
          aria-label={tr(d.common.clearField, { label })}
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
