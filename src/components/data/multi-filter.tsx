"use client"

import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface MultiFilterProps<T extends string> {
  label: string
  options: readonly T[]
  value: T[]
  onChange: (value: T[]) => void
  renderOption?: (option: T) => React.ReactNode
  className?: string
}

export function MultiFilter<T extends string>({ label, options, value, onChange, renderOption, className }: MultiFilterProps<T>) {
  const toggle = (option: T) =>
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option])

  const summary = value.length === 0 ? label : value.length === 1 ? value[0] : `${label}: ${value.length}`

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
          {options.length > 6 && <CommandInput placeholder={`Find ${label.toLowerCase()}`} />}
          <CommandList>
            <CommandEmpty>No matches</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const checked = value.includes(option)
                return (
                  <CommandItem key={option} value={option} onSelect={() => toggle(option)} aria-checked={checked} role="option">
                    <span
                      className={cn(
                        "grid size-4 place-items-center rounded-[4px] border",
                        checked ? "border-primary bg-primary text-primary-foreground" : "border-input"
                      )}
                    >
                      {checked && <Check className="size-3" />}
                    </span>
                    {renderOption ? renderOption(option) : option}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {value.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => onChange([])} className="justify-center text-muted-foreground">
                    Clear selection
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
