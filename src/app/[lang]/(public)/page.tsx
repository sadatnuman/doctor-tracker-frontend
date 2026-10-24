import { Check, Search, ShieldCheck } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { DoctorCard } from "@/components/public/doctor-card"
import { SpecialtyIcon } from "@/components/public/specialty-icon"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { localePath, OG_LOCALE, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n/dictionaries/en"
import { getDictionary, resolveLocale } from "@/i18n/server"
import { createFormatters } from "@/lib/format"
import { getFilterOptions, getPublicDoctors } from "@/lib/server-api"
import { absoluteUrl, alternatesFor, jsonLd, SPECIALTIES } from "@/lib/site"

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const d = await getDictionary(locale)
  return {
    title: { absolute: `${d.meta.homeTitle} · ${d.meta.siteName}` },
    description: d.meta.homeDescription,
    alternates: alternatesFor(locale, "/"),
    openGraph: {
      type: "website",
      siteName: d.meta.siteName,
      title: d.meta.homeTitle,
      description: d.meta.homeDescription,
      url: absoluteUrl(localePath(locale)),
      locale: OG_LOCALE[locale],
    },
    twitter: { card: "summary_large_image", title: d.meta.homeTitle, description: d.meta.homeDescription },
  }
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const locale = await resolveLocale(params)
  const d = await getDictionary(locale)
  const t = d.landing
  const href = (p: string) => localePath(locale, p)

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqSchema)} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b">
        <div className="chart-paper absolute inset-0 opacity-50 [mask-image:linear-gradient(180deg,black,transparent_85%)]" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-20 lg:pb-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              {t.eyebrowFree}
            </p>
            <h1 className="mt-5 max-w-[18ch] text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-[3.4rem]">{t.heroTitle}</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{t.heroBody}</p>

            {/* A plain GET form: works before JavaScript loads and is crawlable. */}
            <form action={href("/doctors")} method="get" role="search" className="mt-8 flex max-w-xl flex-col gap-2 sm:flex-row">
              <label htmlFor="hero-search" className="sr-only">
                {t.searchPlaceholder}
              </label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="hero-search"
                  name="search"
                  type="search"
                  placeholder={t.searchPlaceholder}
                  className="h-12 w-full rounded-lg border bg-card pr-3 pl-10 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6 text-base">
                {t.searchAction}
              </Button>
            </form>

            <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{t.popular}</span>
              {["general-medicine", "pediatrics", "cardiology", "orthopedics"].map((slug) => {
                const s = SPECIALTIES.find((x) => x.slug === slug)!
                return (
                  <Link key={slug} href={href(`/specialties/${slug}`)} className="rounded-full border bg-card px-3 py-1 font-medium text-foreground hover:border-primary/50 hover:text-primary">
                    {d.enums.specialization[s.name]}
                  </Link>
                )
              })}
            </p>

            <Suspense fallback={<Skeleton className="mt-10 h-12 w-80" />}>
              <HeroStats locale={locale} d={d} />
            </Suspense>
          </div>

          <BookingTicket d={d} locale={locale} />
        </div>
      </section>

      {/* ── Specialties ──────────────────────────────────────────────────── */}
      <section id="specialties" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-20 sm:px-6" aria-labelledby="specialties-title">
        <h2 id="specialties-title" className="text-2xl font-semibold sm:text-3xl">{t.specialtiesTitle}</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">{t.specialtiesBody}</p>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SPECIALTIES.map((s) => (
            <li key={s.slug}>
              <Link href={href(`/specialties/${s.slug}`)} className="group flex h-full items-center gap-3 rounded-xl border bg-card p-4 hover:border-primary/40">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <SpecialtyIcon name={s.name} className="size-5" />
                </span>
                <span className="font-medium group-hover:text-primary">{d.enums.specialization[s.name]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── How it works (a real sequence, so it is numbered) ────────────── */}
      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-20 sm:px-6" aria-labelledby="how-title">
        <h2 id="how-title" className="text-2xl font-semibold sm:text-3xl">{t.howTitle}</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-4">
          {t.howSteps.map((step, i) => (
            <li key={step.title} className="relative rounded-xl border bg-card p-5">
              <span className="font-heading text-sm font-semibold text-primary tabular">{createFormatters(locale).number(i + 1)}</span>
              <h3 className="mt-2 font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Featured doctors ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6" aria-labelledby="featured-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="featured-title" className="text-2xl font-semibold sm:text-3xl">{t.featuredTitle}</h2>
            <p className="mt-2 text-muted-foreground">{t.featuredBody}</p>
          </div>
          <Button asChild variant="outline">
            <Link href={href("/doctors")}>{t.seeAllDoctors}</Link>
          </Button>
        </div>
        <Suspense fallback={<CardsSkeleton />}>
          <FeaturedDoctors locale={locale} d={d} />
        </Suspense>
      </section>

      {/* ── For doctors & trust ──────────────────────────────────────────── */}
      <section id="for-doctors" className="mx-auto mt-20 max-w-7xl scroll-mt-20 px-4 sm:px-6">
        <div className="grid gap-10 overflow-hidden rounded-2xl bg-sidebar p-8 text-sidebar-foreground sm:p-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">{t.doctorsTitle}</h2>
            <p className="mt-3 max-w-lg leading-relaxed">{t.doctorsBody}</p>
            <Button asChild size="lg" className="mt-7 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
              <Link href={href("/login")}>{t.doctorCta}</Link>
            </Button>
          </div>
          <ul className="grid content-center gap-4">
            {t.doctorPoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-sidebar-accent text-sidebar-primary">
                  <Check className="size-3.5" />
                </span>
                <span className="text-white">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6" aria-labelledby="trust-title">
        <h2 id="trust-title" className="text-2xl font-semibold sm:text-3xl">{t.trustTitle}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {t.trustPoints.map((point) => (
            <div key={point.title} className="border-l-2 border-primary pl-4">
              <h3 className="font-semibold">{point.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{point.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ (native disclosure: no JS, fully crawlable) ──────────────── */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 pt-20 sm:px-6" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-2xl font-semibold sm:text-3xl">{t.faqTitle}</h2>
        <div className="mt-6 divide-y rounded-xl border bg-card">
          {t.faq.map((item) => (
            <details key={item.q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                <h3 className="text-base">{item.q}</h3>
                <span aria-hidden className="text-xl leading-none text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border bg-card p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-semibold">{t.ctaTitle}</h2>
            <p className="mt-1.5 text-muted-foreground">{t.ctaBody}</p>
          </div>
          <Button asChild size="lg">
            <Link href={href("/doctors")}>{t.ctaAction}</Link>
          </Button>
        </div>
      </section>
    </>
  )
}

async function HeroStats({ locale, d }: { locale: Locale; d: Dictionary }) {
  const [doctors, options] = await Promise.all([getPublicDoctors({ limit: 1 }), getFilterOptions()])
  const f = createFormatters(locale)
  const stats = [
    { value: doctors?.meta.total, label: d.landing.statsDoctors },
    { value: 12, label: d.landing.statsSpecialties },
    { value: options?.hospitals.length, label: d.landing.statsHospitals },
  ].filter((s) => s.value)
  if (!stats.length) return null
  return (
    <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
      {stats.map((s) => (
        <div key={s.label}>
          <dt className="sr-only">{s.label}</dt>
          <dd className="flex items-baseline gap-1.5">
            <span className="font-heading text-3xl font-semibold tabular">{f.number(s.value!)}</span>
            <span className="text-sm text-muted-foreground">{s.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  )
}

async function FeaturedDoctors({ locale, d }: { locale: Locale; d: Dictionary }) {
  const result = await getPublicDoctors({ limit: 6, sort: "name", page: 2 })
  if (!result) {
    return <p className="mt-8 rounded-xl border bg-card p-6 text-sm text-muted-foreground">{d.directory.unavailableBody}</p>
  }
  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {result.data.map((doctor) => (
        <li key={doctor.id}>
          <DoctorCard doctor={doctor} locale={locale} d={d} />
        </li>
      ))}
    </ul>
  )
}

function CardsSkeleton() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-52 rounded-xl" />
      ))}
    </div>
  )
}

/** Decorative booking ticket: the product's core moment, drawn in the hero. */
function BookingTicket({ d, locale }: { d: Dictionary; locale: Locale }) {
  const f = createFormatters(locale)
  const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end">
      <div className="rounded-2xl border bg-card p-6 shadow-[0_24px_60px_-30px_rgb(15_42_61/0.35)]">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-accent font-heading text-sm font-semibold text-accent-foreground">AR</span>
          <div>
            <p className="font-semibold">Dr. Ayesha Rahman</p>
            <p className="text-sm text-primary">{d.enums.specialization["General Medicine"]}</p>
          </div>
          <p className="ml-auto font-heading text-lg font-semibold tabular">{f.money(800)}</p>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {slots.map((time, i) => (
            <span
              key={time}
              className={
                i === 2
                  ? "rounded-lg border-2 border-primary bg-accent py-2 text-center text-sm font-semibold text-accent-foreground"
                  : i === 4
                    ? "rounded-lg border border-dashed py-2 text-center text-sm text-muted-foreground line-through"
                    : "rounded-lg border py-2 text-center text-sm"
              }
            >
              {f.wallTime(time)}
            </span>
          ))}
        </div>
        <svg viewBox="0 0 400 60" className="mt-5 h-12 w-full" preserveAspectRatio="none">
          <path d="M0 34 H120 l10 -14 l8 14 H180 l8 -30 l12 52 l10 -32 l8 10 H400" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-muted px-3.5 py-2.5 text-sm">
          <span className="text-muted-foreground">{d.booking.holdNotice}</span>
          <span className="font-heading font-semibold tabular">{`${f.number(4)}:${f.number(5)}${f.number(9)}`}</span>
        </div>
      </div>
    </div>
  )
}
