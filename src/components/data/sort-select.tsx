"use client"

import { ArrowDownUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useI18n } from "@/i18n/client"

interface SortSelectProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  className?: string
}

export function SortSelect<T extends string>({ value, onChange, options, className }: SortSelectProps<T>) {
  const { d } = useI18n()
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger aria-label={d.common.sortBy} className={cn("h-9 w-full bg-card data-[size=default]:h-9", className)}>
        <ArrowDownUp className="text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
