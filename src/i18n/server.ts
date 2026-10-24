import "server-only"
import { notFound } from "next/navigation"
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

/** `generateMetadata` for private workspace pages: a localized title, never indexed. */
export function privatePageMetadata(pick: (d: Dictionary) => string) {
  return async ({ params }: { params: Promise<{ lang: string }> }) => {
    const d = await getDictionary(await resolveLocale(params))
    return { title: pick(d), robots: { index: false, follow: false } }
  }
}
