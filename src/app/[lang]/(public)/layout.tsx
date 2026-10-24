import { SiteFooter } from "@/components/public/site-footer"
import { SiteNav } from "@/components/public/site-nav"
import { getDictionary, resolveLocale } from "@/i18n/server"
import { absoluteUrl, jsonLd, SITE_URL } from "@/lib/site"
import { localePath } from "@/i18n/config"

/** Public, indexable pages: shared header/footer plus site-wide structured data. */
export default async function PublicLayout({ children, params }: LayoutProps<"/[lang]">) {
  const locale = await resolveLocale(params)
  const d = await getDictionary(locale)

  // WebSite (+ sitelinks search box) and the organization behind it.
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: absoluteUrl(localePath(locale)),
        name: d.meta.siteName,
        inLanguage: locale === "bn" ? "bn-BD" : "en",
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl(localePath(locale, "/doctors"))}?search={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "MedicalOrganization",
        "@id": `${SITE_URL}/#organization`,
        name: d.meta.siteName,
        url: SITE_URL,
        logo: absoluteUrl("/icon.svg"),
        areaServed: { "@type": "Country", name: "Bangladesh" },
        medicalSpecialty: "PrimaryCare",
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />
      <SiteNav />
      <main id="main">{children}</main>
      <SiteFooter locale={locale} d={d} />
    </>
  )
}
