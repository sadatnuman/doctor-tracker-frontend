"use client"

import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useDoctor, useDoctorOptions } from "@/hooks/use-doctors"
import { useI18n } from "@/i18n/client"
import { cn } from "@/lib/utils"

interface DoctorPickerProps {
  value: string | null
  onChange: (id: string | null, name?: string) => void
  /** Known name for the selected id (skips a lookup). */
  selectedName?: string
  /** Show an "All doctors" option — used when the picker is a filter. */
  allowAll?: boolean
  id?: string
  invalid?: boolean
  className?: string
}

/** Server-searched combobox: scales to any number of doctors, unlike a static <select>. */
export function DoctorPicker({ value, onChange, selectedName, allowAll, id, invalid, className }: DoctorPickerProps) {
  const { d, tr } = useI18n()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const debounced = useDebouncedValue(search, 250)
  const options = useDoctorOptions(debounced, open)
  const needsLookup = Boolean(value && !selectedName)
  const selected = useDoctor(needsLookup ? value! : "")
  const label = value
    ? (selectedName ?? selected.data?.name ?? d.common.loading)
    : allowAll
      ? d.admin.allDoctors
      : d.doctorsAdmin.chooseDoctor
  const specialty = (s: string) => d.enums.specialization[s] ?? s

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          className={cn("h-9 w-full justify-between bg-card font-normal", !value && "text-muted-foreground", className)}
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-64 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder={d.doctorsAdmin.searchDoctors} value={search} onValueChange={setSearch} />
          <CommandList>
            {options.isFetching && !options.data ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> {d.doctorsAdmin.searching}
              </div>
            ) : (
              <CommandEmpty>{tr(d.doctorsAdmin.noDoctorsMatch, { term: debounced })}</CommandEmpty>
            )}
            <CommandGroup>
              {allowAll && !search && (
                <CommandItem
                  value="__all__"
                  onSelect={() => {
                    onChange(null)
                    setOpen(false)
                  }}
                >
                  <Check className={cn(value ? "opacity-0" : "opacity-100")} />
                  {d.admin.allDoctors}
                </CommandItem>
              )}
              {options.data?.map((doctor) => (
                <CommandItem
                  key={doctor.id}
                  value={doctor.id}
                  onSelect={() => {
                    onChange(doctor.id, doctor.name)
                    setOpen(false)
                  }}
                >
                  <Check className={cn(value === doctor.id ? "opacity-100" : "opacity-0")} />
                  <div className="min-w-0">
                    <p className="truncate">{doctor.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {specialty(doctor.specialization)}, {doctor.hospital}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
