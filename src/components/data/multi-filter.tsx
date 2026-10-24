"use client"

import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useI18n } from "@/i18n/client"

interface MultiFilterProps<T extends string> {
  label: string
  options: readonly T[]
  value: T[]
  onChange: (value: T[]) => void
  renderOption?: (option: T) => React.ReactNode
  /** Display text for an option (e.g. a translated enum). */
  getLabel?: (option: T) => string
  className?: string
}

export function MultiFilter<T extends string>({ label, options, value, onChange, renderOption, getLabel = (o) => o, className }: MultiFilterProps<T>) {
  const toggle = (option: T) =>
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option])

  const { d } = useI18n()
  const summary = value.length === 0 ? label : value.length === 1 ? getLabel(value[0]!) : `${label}: ${value.length}`

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("h-9 w-full justify-between bg-card font-normal", value.length === 0 && "text-muted-foreground", className)}
        >
          <span className="truncate">{summary}</span>
          <ChevronDown className="opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          {options.length > 6 && <CommandInput placeholder={label} />}
          <CommandList>
            <CommandEmpty>{d.common.noMatches}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const checked = value.includes(option)
                return (
                  <CommandItem key={option} value={getLabel(option)} onSelect={() => toggle(option)} aria-checked={checked} role="option">
                    <span
                      className={cn(
                        "grid size-4 place-items-center rounded-[4px] border",
                        checked ? "border-primary bg-primary text-primary-foreground" : "border-input"
                      )}
                    >
                      {checked && <Check className="size-3" />}
                    </span>
                    {renderOption ? renderOption(option) : getLabel(option)}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {value.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => onChange([])} className="justify-center text-muted-foreground">
                    {d.common.clearSelection}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
