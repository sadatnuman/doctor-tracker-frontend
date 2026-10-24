import "server-only"
import { notFound } from "next/navigation"
import { lang } from "next/root-params"
import { hasLocale, type Locale } from "./config"
import type { Dictionary } from "./dictionaries/en"

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en").then((m) => m.default),
  bn: () => import("./dictionaries/bn").then((m) => m.default),
}

/** Resolve `[lang]` from route params, 404 for unsupported locales. */
export async function resolveLocale(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  return lang
}

export const getDictionary = (locale: Locale) => dictionaries[locale]()

/**
 * The locale of the current route, read as a root param. Unlike awaiting `params`,
 * this never depends on deeper URL segments, so pages with unknown ids can still
 * prerender their shell.
 */
export async function currentLocale(): Promise<Locale> {
  const value = await lang()
  if (!hasLocale(value)) notFound()
  return value
}

/** `generateMetadata` for private workspace pages: a localized title, never indexed. */
export function privatePageMetadata(pick: (d: Dictionary) => string) {
  return async ({ params }: { params: Promise<{ lang: string }> }) => {
    const d = await getDictionary(await resolveLocale(params))
    return { title: pick(d), robots: { index: false, follow: false } }
  }
}
