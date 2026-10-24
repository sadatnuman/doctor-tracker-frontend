import { localePath, LOCALES, type Locale } from "@/i18n/config"

/**
 * Canonical origin for metadata, sitemap and JSON-LD. Set NEXT_PUBLIC_SITE_URL once a
 * custom domain exists; on Vercel the production URL is used automatically.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/+$/, "")

export const absoluteUrl = (path: string) => `${SITE_URL}${path}`

/**
 * The site link-preview image (src/app/[lang]/opengraph-image.tsx). Pages that set their own
 * `openGraph` replace the inherited one, so they pass this explicitly.
 */
export const siteOgImage = (locale: Locale, alt: string) => ({
  url: localePath(locale, "/opengraph-image"),
  width: 1200,
  height: 630,
  type: "image/png",
  alt,
})

/** hreflang alternates for a locale-independent app path ("/doctors"). */
export function languageAlternates(path: string) {
  return {
    ...Object.fromEntries(LOCALES.map((l) => [l === "bn" ? "bn-BD" : "en", localePath(l, path)])),
    "x-default": localePath("en", path),
  }
}

/** Canonical + hreflang block for `generateMetadata`. */
export const alternatesFor = (locale: Locale, path: string) => ({
  canonical: localePath(locale, path),
  languages: languageAlternates(path),
})

/** Specialty landing pages: stable English slugs for every language. */
export const SPECIALTIES = [
  { slug: "cardiology", name: "Cardiology" },
  { slug: "dermatology", name: "Dermatology" },
  { slug: "endocrinology", name: "Endocrinology" },
  { slug: "gastroenterology", name: "Gastroenterology" },
  { slug: "general-medicine", name: "General Medicine" },
  { slug: "neurology", name: "Neurology" },
  { slug: "oncology", name: "Oncology" },
  { slug: "orthopedics", name: "Orthopedics" },
  { slug: "pediatrics", name: "Pediatrics" },
  { slug: "psychiatry", name: "Psychiatry" },
  { slug: "pulmonology", name: "Pulmonology" },
  { slug: "radiology", name: "Radiology" },
] as const

export const specialtyBySlug = (slug: string) => SPECIALTIES.find((s) => s.slug === slug)
export const specialtySlug = (name: string) => SPECIALTIES.find((s) => s.name === name)?.slug

/** Escapes `<` so user content inside JSON-LD can't close the script tag. */
export const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") })
