import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { DirectoryFilters } from "@/components/public/directory-filters"
import { DoctorDirectory, toDirectoryQuery } from "@/components/public/doctor-directory"
import { SpecialtyIcon } from "@/components/public/specialty-icon"
import { Skeleton } from "@/components/ui/skeleton"
import { localePath, OG_LOCALE, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n/dictionaries/en"
import { getDictionary, resolveLocale } from "@/i18n/server"
import { createFormatters, interpolate } from "@/lib/format"
import { getFilterOptions, getPublicDoctors } from "@/lib/server-api"
import { absoluteUrl, alternatesFor, jsonLd, SPECIALTIES, specialtyBySlug } from "@/lib/site"

export function generateStaticParams() {
  return SPECIALTIES.map((s) => ({ slug: s.slug }))
}

async function resolve(params: PageProps<"/[lang]/specialties/[slug]">["params"]) {
  const locale = await resolveLocale(params)
  const specialty = specialtyBySlug((await params).slug)
  if (!specialty) notFound()
  return { locale, specialty }
}

export async function generateMetadata({ params }: PageProps<"/[lang]/specialties/[slug]">): Promise<Metadata> {
  const { locale, specialty } = await resolve(params)
  const d = await getDictionary(locale)
  const name = d.enums.specialization[specialty.name]
  const count = (await getPublicDoctors({ specialization: specialty.name, limit: 1 }))?.meta.total
  const title = interpolate(d.meta.specialtyTitle, { specialty: name })
  const description = interpolate(d.meta.specialtyDescription, {
    specialty: name,
    count: count ? createFormatters(locale).number(count) : "",
  }).replace(/\s{2,}/g, " ")
  const path = `/specialties/${specialty.slug}`
  return {
    title,
    description,
    alternates: alternatesFor(locale, path),
    openGraph: { title, description, url: absoluteUrl(localePath(locale, path)), locale: OG_LOCALE[locale] },
  }
}

export default async function SpecialtyPage({ params, searchParams }: PageProps<"/[lang]/specialties/[slug]">) {
  const { locale, specialty } = await resolve(params)
  const d = await getDictionary(locale)
  const name = d.enums.specialization[specialty.name]
  const path = `/specialties/${specialty.slug}`

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: d.nav.home, item: absoluteUrl(localePath(locale)) },
      { "@type": "ListItem", position: 2, name: d.nav.findDoctors, item: absoluteUrl(localePath(locale, "/doctors")) },
      { "@type": "ListItem", position: 3, name, item: absoluteUrl(localePath(locale, path)) },
    ],
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:pt-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbs)} />
      <nav aria-label={d.nav.breadcrumb} className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href={localePath(locale)} className="hover:text-foreground">{d.nav.home}</Link></li>
          <li aria-hidden>/</li>
          <li><Link href={localePath(locale, "/doctors")} className="hover:text-foreground">{d.nav.findDoctors}</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-foreground">{name}</li>
        </ol>
      </nav>

      <div className="mt-6 flex items-start gap-4">
        <span className="hidden size-14 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground sm:grid">
          <SpecialtyIcon name={specialty.name} className="size-7" />
        </span>
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">{interpolate(d.directory.specialtyHeading, { specialty: name })}</h1>
          <Suspense fallback={<p className="mt-2 h-6" />}>
            <Intro locale={locale} d={d} specialty={specialty.name} />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="mt-6 h-9 w-full" />}>
        <Filters basePath={localePath(locale, path)} />
      </Suspense>

      <Suspense fallback={<GridSkeleton />}>
        <Results locale={locale} d={d} specialty={specialty.name} path={path} searchParams={searchParams} />
      </Suspense>

      <nav aria-label={d.directory.otherSpecialties} className="mt-14">
        <h2 className="text-lg font-semibold">{d.directory.otherSpecialties}</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {SPECIALTIES.filter((s) => s.slug !== specialty.slug).map((s) => (
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

async function Intro({ locale, d, specialty }: { locale: Locale; d: Dictionary; specialty: string }) {
  const count = (await getPublicDoctors({ specialization: specialty, limit: 1 }))?.meta.total ?? 0
  return (
    <p className="mt-2 max-w-2xl text-muted-foreground">
      {interpolate(d.directory.specialtyIntro, { count: createFormatters(locale).number(count), specialty: d.enums.specialization[specialty] })}
    </p>
  )
}

async function Filters({ basePath }: { basePath: string }) {
  const options = await getFilterOptions()
  return (
    <div className="mt-6">
      <DirectoryFilters basePath={basePath} fixedSpecialty specializations={[]} hospitals={options?.hospitals ?? []} />
    </div>
  )
}

async function Results({
  locale,
  d,
  specialty,
  path,
  searchParams,
}: {
  locale: Locale
  d: Dictionary
  specialty: string
  path: string
  searchParams: PageProps<"/[lang]/specialties/[slug]">["searchParams"]
}) {
  const sp = await searchParams
  return <DoctorDirectory locale={locale} d={d} query={toDirectoryQuery(sp, specialty)} basePath={path} searchParams={sp} />
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
