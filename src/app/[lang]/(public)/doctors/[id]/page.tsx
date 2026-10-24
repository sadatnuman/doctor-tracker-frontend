import { Building2, CalendarClock, Clock, Wallet } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { UserAvatar } from "@/components/common/user-avatar"
import { BookingPanel } from "@/components/public/booking-panel"
import { consultingDays, DoctorCard } from "@/components/public/doctor-card"
import { Skeleton } from "@/components/ui/skeleton"
import { localePath, OG_LOCALE, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n/dictionaries/en"
import { currentLocale, getDictionary, resolveLocale } from "@/i18n/server"
import { createFormatters, interpolate } from "@/lib/format"
import { getPublicDoctor, getPublicDoctors } from "@/lib/server-api"
import { absoluteUrl, alternatesFor, jsonLd, specialtySlug } from "@/lib/site"
import type { PublicDoctor } from "@/lib/types"

/** schema.org MedicalSpecialty values for our specialties. */
const SCHEMA_SPECIALTY: Record<string, string> = {
  Cardiology: "Cardiovascular",
  Dermatology: "Dermatology",
  Endocrinology: "Endocrine",
  Gastroenterology: "Gastroenterologic",
  "General Medicine": "PrimaryCare",
  Neurology: "Neurologic",
  Oncology: "Oncologic",
  Orthopedics: "Musculoskeletal",
  Pediatrics: "Pediatric",
  Psychiatry: "Psychiatric",
  Pulmonology: "Pulmonary",
  Radiology: "Radiography",
}
const SCHEMA_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

async function loadDoctor(params: PageProps<"/[lang]/doctors/[id]">["params"]) {
  const { id } = await params
  const result = await getPublicDoctor(id)
  if (result.status === 404) notFound()
  return result
}

export async function generateMetadata({ params }: PageProps<"/[lang]/doctors/[id]">): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const d = await getDictionary(locale)
  const result = await loadDoctor(params)
  if (result.status !== 200) return { title: d.meta.doctorsTitle, robots: { index: false } }
  const doctor = result.doctor
  const vars = {
    name: doctor.name,
    specialty: d.enums.specialization[doctor.specialization] ?? doctor.specialization,
    hospital: doctor.hospital,
    fee: createFormatters(locale).money(doctor.consultationFee),
  }
  const title = interpolate(d.meta.doctorTitle, vars)
  const description = interpolate(d.meta.doctorDescription, vars)
  const path = `/doctors/${doctor.id}`
  return {
    title,
    description,
    alternates: alternatesFor(locale, path),
    openGraph: {
      type: "profile",
      title,
      description,
      url: absoluteUrl(localePath(locale, path)),
      locale: OG_LOCALE[locale],
    },
  }
}

export default async function DoctorProfilePage({ params }: PageProps<"/[lang]/doctors/[id]">) {
  const locale = await currentLocale()
  const d = await getDictionary(locale)
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:pt-12">
      {/* The id is URL data: unknown doctors stream in after the shell (ISR-style). */}
      <Suspense fallback={<ProfileSkeleton />}>
        <Profile locale={locale} d={d} params={params} />
      </Suspense>
    </div>
  )
}

async function Profile({ locale, d, params }: { locale: Locale; d: Dictionary; params: PageProps<"/[lang]/doctors/[id]">["params"] }) {
  const result = await loadDoctor(params)
  if (result.status !== 200) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="font-heading font-semibold">{d.directory.unavailable}</p>
        <p className="mt-1 text-sm text-muted-foreground">{d.directory.unavailableBody}</p>
      </div>
    )
  }
  const doctor = result.doctor
  const f = createFormatters(locale)
  const specialty = d.enums.specialization[doctor.specialization] ?? doctor.specialization
  const slug = specialtySlug(doctor.specialization)
  const url = absoluteUrl(localePath(locale, `/doctors/${doctor.id}`))
  const { availability } = doctor

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Physician",
        "@id": `${url}#physician`,
        name: doctor.name,
        url,
        ...(doctor.avatarUrl && { image: absoluteUrl(doctor.avatarUrl) }),
        description: doctor.bio,
        medicalSpecialty: SCHEMA_SPECIALTY[doctor.specialization],
        priceRange: f.money(doctor.consultationFee),
        currenciesAccepted: "BDT",
        paymentAccepted: "Credit Card, bKash, Nagad",
        hospitalAffiliation: { "@type": "Hospital", name: doctor.hospital, address: { "@type": "PostalAddress", addressCountry: "BD" } },
        address: { "@type": "PostalAddress", addressCountry: "BD" },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: availability.days.map((day) => `https://schema.org/${SCHEMA_DAYS[day]}`),
          opens: availability.start,
          closes: availability.end,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: d.nav.home, item: absoluteUrl(localePath(locale)) },
          { "@type": "ListItem", position: 2, name: d.nav.findDoctors, item: absoluteUrl(localePath(locale, "/doctors")) },
          ...(slug ? [{ "@type": "ListItem", position: 3, name: specialty, item: absoluteUrl(localePath(locale, `/specialties/${slug}`)) }] : []),
          { "@type": "ListItem", position: slug ? 4 : 3, name: doctor.name, item: url },
        ],
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />
      <nav aria-label={d.nav.breadcrumb} className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href={localePath(locale)} className="hover:text-foreground">{d.nav.home}</Link></li>
          <li aria-hidden>/</li>
          <li><Link href={localePath(locale, "/doctors")} className="hover:text-foreground">{d.nav.findDoctors}</Link></li>
          {slug && (
            <>
              <li aria-hidden>/</li>
              <li><Link href={localePath(locale, `/specialties/${slug}`)} className="hover:text-foreground">{specialty}</Link></li>
            </>
          )}
          <li aria-hidden>/</li>
          <li aria-current="page" className="truncate text-foreground">{doctor.name}</li>
        </ol>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <div>
          <div className="flex items-start gap-5">
            <UserAvatar name={doctor.name} src={doctor.avatarUrl} tone="teal" className="size-20 rounded-2xl font-heading text-2xl" />
            <div className="min-w-0">
              <h1 className="text-2xl leading-tight font-semibold break-words sm:text-4xl">{doctor.name}</h1>
              {slug ? (
                <Link href={localePath(locale, `/specialties/${slug}`)} className="mt-1 inline-block font-medium text-primary hover:underline">
                  {specialty}
                </Link>
              ) : (
                <p className="mt-1 font-medium text-primary">{specialty}</p>
              )}
            </div>
          </div>

          <dl className="mt-8 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
            <Fact icon={Building2} label={d.doctorProfile.hospital} value={doctor.hospital} />
            <Fact icon={Wallet} label={d.doctorProfile.fee} value={`${f.money(doctor.consultationFee)} ${d.common.perVisit}`} />
            <Fact icon={CalendarClock} label={d.doctorProfile.schedule} value={`${consultingDays(availability.days, d)}, ${f.wallTime(availability.start)}–${f.wallTime(availability.end)}`} />
            <Fact icon={Clock} label={d.booking.when} value={interpolate(d.doctorProfile.slotLength, { n: f.number(availability.slotMinutes) })} />
          </dl>

          {doctor.bio && (
            <section className="mt-8" aria-labelledby="about-title">
              <h2 id="about-title" className="text-lg font-semibold">{d.doctorProfile.about}</h2>
              <p className="mt-2 max-w-prose leading-relaxed text-muted-foreground">{doctor.bio}</p>
            </section>
          )}
        </div>

        <div className="min-w-0 lg:sticky lg:top-24">
          <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
            <BookingPanel doctorId={doctor.id} />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={null}>
        <Related locale={locale} d={d} doctor={doctor} />
      </Suspense>
    </>
  )
}

function Fact({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 bg-card p-4">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 font-medium">{value}</dd>
      </div>
    </div>
  )
}

/** Same-specialty doctors: internal links that keep visitors (and crawlers) moving. */
async function Related({ locale, d, doctor }: { locale: Locale; d: Dictionary; doctor: PublicDoctor }) {
  const result = await getPublicDoctors({ specialization: doctor.specialization, limit: 4 })
  const others = result?.data.filter((x) => x.id !== doctor.id).slice(0, 3) ?? []
  if (!others.length) return null
  const specialty = d.enums.specialization[doctor.specialization] ?? doctor.specialization
  return (
    <section className="mt-16" aria-labelledby="related-title">
      <h2 id="related-title" className="text-xl font-semibold">{interpolate(d.doctorProfile.relatedTitle, { specialty })}</h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {others.map((x) => (
          <li key={x.id}>
            <DoctorCard doctor={x} locale={locale} d={d} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]" aria-busy>
      <div>
        <div className="flex items-start gap-5">
          <Skeleton className="size-20 rounded-2xl" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <Skeleton className="mt-8 h-40 rounded-xl" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  )
}
