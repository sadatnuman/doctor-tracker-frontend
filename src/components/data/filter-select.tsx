"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const ALL = "__all__"

interface FilterSelectProps {
  value: string | null
  onChange: (value: string | null) => void
  options: readonly string[]
  allLabel: string
  ariaLabel: string
  className?: string
}

/** Single-value filter with an explicit "All …" option (Radix Select can't hold an empty value). */
export function FilterSelect({ value, onChange, options, allLabel, ariaLabel, className }: FilterSelectProps) {
  return (
    <Select value={value ?? ALL} onValueChange={(v) => onChange(v === ALL ? null : v)}>
      <SelectTrigger aria-label={ariaLabel} className={cn("h-9 w-full bg-card data-[size=default]:h-9", !value && "text-muted-foreground", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-72">
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
