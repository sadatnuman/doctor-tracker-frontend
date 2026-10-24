import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { DirectoryFilters } from "@/components/public/directory-filters"
import { DoctorDirectory, toDirectoryQuery } from "@/components/public/doctor-directory"
import { Skeleton } from "@/components/ui/skeleton"
import { localePath, OG_LOCALE, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n/dictionaries/en"
import { getDictionary, resolveLocale } from "@/i18n/server"
import { createFormatters, interpolate } from "@/lib/format"
import { getFilterOptions, getPublicDoctors } from "@/lib/server-api"
import { absoluteUrl, alternatesFor, jsonLd, siteOgImage, SPECIALTIES } from "@/lib/site"

export async function generateMetadata({ params }: PageProps<"/[lang]/doctors">): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const d = await getDictionary(locale)
  return {
    title: d.meta.doctorsTitle,
    description: d.meta.doctorsDescription,
    // Filtered and paginated views all canonicalize to the directory itself.
    alternates: alternatesFor(locale, "/doctors"),
    openGraph: { title: d.meta.doctorsTitle, description: d.meta.doctorsDescription, url: absoluteUrl(localePath(locale, "/doctors")), locale: OG_LOCALE[locale], images: [siteOgImage(locale, d.meta.ogAlt)] },
  }
}

export default async function DoctorsDirectoryPage({ params, searchParams }: PageProps<"/[lang]/doctors">) {
  const locale = await resolveLocale(params)
  const d = await getDictionary(locale)

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: d.nav.home, item: absoluteUrl(localePath(locale)) },
      { "@type": "ListItem", position: 2, name: d.nav.findDoctors, item: absoluteUrl(localePath(locale, "/doctors")) },
    ],
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:pt-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbs)} />
      <h1 className="text-3xl font-semibold sm:text-4xl">{d.directory.title}</h1>
      <Suspense fallback={<p className="mt-2 h-6" />}>
        <Subtitle locale={locale} d={d} />
      </Suspense>

      <Suspense fallback={<Skeleton className="mt-6 h-9 w-full" />}>
        <Filters basePath={localePath(locale, "/doctors")} />
      </Suspense>

      <Suspense fallback={<GridSkeleton />}>
        <Results locale={locale} d={d} searchParams={searchParams} />
      </Suspense>

      <nav aria-label={d.landing.footerSpecialties} className="mt-14">
        <h2 className="text-lg font-semibold">{d.nav.specialties}</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => (
            <li key={s.slug}>
              <Link href={localePath(locale, `/specialties/${s.slug}`)} className="inline-block rounded-full border bg-card px-3 py-1 text-sm hover:border-primary/50 hover:text-primary">
                {d.enums.specialization[s.name]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

async function Subtitle({ locale, d }: { locale: Locale; d: Dictionary }) {
  const total = (await getPublicDoctors({ limit: 1 }))?.meta.total
  return <p className="mt-2 max-w-2xl text-muted-foreground">{total ? interpolate(d.directory.subtitle, { count: createFormatters(locale).number(total) }) : d.meta.doctorsDescription}</p>
}

async function Filters({ basePath }: { basePath: string }) {
  const options = await getFilterOptions()
  return (
    <div className="mt-6">
      <DirectoryFilters basePath={basePath} specializations={options?.specializations ?? []} hospitals={options?.hospitals ?? []} />
    </div>
  )
}

async function Results({ locale, d, searchParams }: { locale: Locale; d: Dictionary; searchParams: PageProps<"/[lang]/doctors">["searchParams"] }) {
  const sp = await searchParams
  return <DoctorDirectory locale={locale} d={d} query={toDirectoryQuery(sp)} basePath="/doctors" searchParams={sp} />
}

function GridSkeleton() {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-52 rounded-xl" />
      ))}
    </div>
  )
}
