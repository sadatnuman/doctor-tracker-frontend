import Link from "next/link"
import { BrandMark, BrandName } from "@/components/brand-mark"
import { localePath, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n/dictionaries/en"
import { SPECIALTIES } from "@/lib/site"

/** Server-rendered footer: every specialty page is linked from every public page (internal linking). */
export function SiteFooter({ locale, d }: { locale: Locale; d: Dictionary }) {
  const href = (p: string) => localePath(locale, p)
  const top = SPECIALTIES.slice(0, 8)
  return (
    <footer className="mt-24 border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr_1.4fr]">
        <div>
          <Link href={href("/")} className="flex w-fit items-center gap-2.5">
            <BrandMark />
            <BrandName />
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{d.landing.footerTagline}</p>
        </div>

        <nav aria-label={d.landing.footerPatients}>
          <p className="text-sm font-semibold">{d.landing.footerPatients}</p>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
            <li><Link className="hover:text-foreground" href={href("/doctors")}>{d.nav.findDoctors}</Link></li>
            <li><Link className="hover:text-foreground" href={`${href("/")}#how-it-works`}>{d.nav.howItWorks}</Link></li>
            <li><Link className="hover:text-foreground" href={`${href("/")}#faq`}>{d.nav.faq}</Link></li>
            <li><Link className="hover:text-foreground" href={href("/register")}>{d.common.signUp}</Link></li>
          </ul>
        </nav>

        <nav aria-label={d.landing.footerProfessionals}>
          <p className="text-sm font-semibold">{d.landing.footerProfessionals}</p>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
            <li><Link className="hover:text-foreground" href={`${href("/")}#for-doctors`}>{d.nav.forDoctors}</Link></li>
            <li><Link className="hover:text-foreground" href={href("/login")}>{d.common.signIn}</Link></li>
          </ul>
        </nav>

        <nav aria-label={d.landing.footerSpecialties}>
          <p className="text-sm font-semibold">{d.landing.footerSpecialties}</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {top.map((s) => (
              <li key={s.slug}>
                <Link className="hover:text-foreground" href={href(`/specialties/${s.slug}`)}>
                  {d.enums.specialization[s.name]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6">
          © {d.common.appName}. {d.landing.footerDemo}
        </p>
      </div>
    </footer>
  )
}
