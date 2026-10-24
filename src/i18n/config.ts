export const LOCALES = ["en", "bn"] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "en"
export const LOCALE_COOKIE = "NEXT_LOCALE"

export const hasLocale = (value: string | undefined): value is Locale =>
  !!value && (LOCALES as readonly string[]).includes(value)

/** BCP-47 tags used for Intl formatting, <html lang> and hreflang. */
export const INTL_LOCALE: Record<Locale, string> = { en: "en-GB", bn: "bn-BD" }
export const OG_LOCALE: Record<Locale, string> = { en: "en_US", bn: "bn_BD" }
export const LOCALE_LABEL: Record<Locale, string> = { en: "English", bn: "বাংলা" }

/** Prefix an app path with a locale: ("/doctors", "bn") → "/bn/doctors". */
export const localePath = (locale: Locale, path = "/") => `/${locale}${path === "/" ? "" : path}`

/** Swap the locale segment of a pathname, keeping the rest. */
export function switchLocalePath(pathname: string, to: Locale) {
  const [, first, ...rest] = pathname.split("/")
  const tail = hasLocale(first) ? rest : [first, ...rest].filter(Boolean)
  return `/${to}${tail.length ? `/${tail.join("/")}` : ""}`
}
