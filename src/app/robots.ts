import type { MetadataRoute } from "next"
import { LOCALES } from "@/i18n/config"
import { SITE_URL } from "@/lib/site"

/** Public pages are crawlable; workspaces, auth pages and the API are not. */
export default function robots(): MetadataRoute.Robots {
  const privateAreas = LOCALES.flatMap((l) => [`/${l}/admin`, `/${l}/doctor$`, `/${l}/doctor/`, `/${l}/account`, `/${l}/login`, `/${l}/register`])
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", ...privateAreas] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
