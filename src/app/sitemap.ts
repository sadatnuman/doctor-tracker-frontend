import type { MetadataRoute } from "next"
import { localePath, LOCALES } from "@/i18n/config"
import { getAllDoctorIds } from "@/lib/server-api"
import { absoluteUrl, SPECIALTIES } from "@/lib/site"

/** Every public page in both languages, each entry carrying its hreflang alternates. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entry = (path: string, priority: number, changeFrequency: "daily" | "weekly"): MetadataRoute.Sitemap =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(localePath(locale, path)),
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [l === "bn" ? "bn-BD" : "en", absoluteUrl(localePath(l, path))])),
      },
    }))

  const doctorIds = await getAllDoctorIds()
  return [
    ...entry("/", 1, "daily"),
    ...entry("/doctors", 0.9, "daily"),
    ...SPECIALTIES.flatMap((s) => entry(`/specialties/${s.slug}`, 0.8, "weekly")),
    ...doctorIds.flatMap((id) => entry(`/doctors/${id}`, 0.7, "weekly")),
  ]
}
