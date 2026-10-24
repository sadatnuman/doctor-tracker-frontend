"use client"

import { Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { useI18n } from "@/i18n/client"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  delay?: number
  className?: string
}

/**
 * Keeps keystrokes local and only commits (URL update → refetch) after `delay` ms idle,
 * so typing never triggers a request — or a list re-render — per character.
 */
export function SearchInput({ value, onChange, placeholder, delay = 300, className }: SearchInputProps) {
  const { d } = useI18n()
  const [draft, setDraft] = useState(value)
  const [lastValue, setLastValue] = useState(value)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // External resets (e.g. "Clear filters") flow back into the field — adjusted during render.
  if (value !== lastValue) {
    setLastValue(value)
    if (value !== draft.trim()) setDraft(value)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  const update = (next: string, immediate = false) => {
    setDraft(next)
    clearTimeout(timer.current)
    if (immediate) onChange(next.trim())
    else timer.current = setTimeout(() => onChange(next.trim()), delay)
  }

  return (
    <InputGroup className={cn("h-9 bg-card", className)}>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={draft}
        onChange={(e) => update(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") update(draft, true)
          if (e.key === "Escape") update("", true)
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className="[&::-webkit-search-cancel-button]:hidden"
      />
      {draft && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label={d.common.clearSearch} onClick={() => update("", true)}>
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}
