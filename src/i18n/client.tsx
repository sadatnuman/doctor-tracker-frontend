"use client"

import { createContext, useContext, useMemo } from "react"
import { createFormatters, interpolate, type Formatters } from "@/lib/format"
import { localePath, type Locale } from "./config"
import type { Dictionary } from "./dictionaries/en"

interface I18nValue {
  locale: Locale
  /** The full dictionary for the current locale. */
  d: Dictionary
  /** Interpolate a dictionary template: tr(d.common.page, { page: 1, pages: 3 }). */
  tr: (template: string, vars?: Record<string, string | number>) => string
  /** Locale-prefixed path: href("/doctors") → "/bn/doctors". */
  href: (path: string) => string
  f: Formatters
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ locale, dictionary, children }: { locale: Locale; dictionary: Dictionary; children: React.ReactNode }) {
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      d: dictionary,
      tr: interpolate,
      href: (path: string) => localePath(locale, path),
      f: createFormatters(locale),
    }),
    [locale, dictionary]
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const value = useContext(I18nContext)
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>")
  return value
}
