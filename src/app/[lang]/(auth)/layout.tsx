import Link from "next/link"
import { BrandMark, BrandName } from "@/components/brand-mark"
import { LanguageSwitcher } from "@/components/common/language-switcher"
import { localePath } from "@/i18n/config"
import { getDictionary, resolveLocale } from "@/i18n/server"

/** Split-screen frame shared by sign-in and registration. */
export default async function AuthLayout({ children, params }: LayoutProps<"/[lang]">) {
  const locale = await resolveLocale(params)
  const d = await getDictionary(locale)
  return (
    <main id="main" className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href={localePath(locale)} className="flex w-fit items-center gap-3 text-white">
          <BrandMark />
          <BrandName />
        </Link>

        <div className="relative z-10 max-w-md">
          <p className="text-[2.6rem] leading-[1.08] font-semibold text-white">{d.auth.brandTitle}</p>
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-sidebar-foreground">{d.auth.brandBody}</p>
        </div>

        <PulseTrace />
        <p className="relative z-10 text-xs text-sidebar-foreground/70">{d.auth.restricted}</p>
      </aside>

      <section className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between lg:justify-end">
          <Link href={localePath(locale)} className="flex items-center gap-3 lg:hidden">
            <BrandMark />
            <BrandName />
          </Link>
          <LanguageSwitcher />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[24rem]">{children}</div>
        </div>
      </section>
    </main>
  )
}

/** Decorative monitor trace running across the brand panel. */
function PulseTrace() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 800 160"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-1/2 h-40 w-full -translate-y-1/2 opacity-[0.22] [mask-image:linear-gradient(90deg,transparent,black_20%,black_80%,transparent)]"
    >
      <path
        d="M0 90 H180 l14 -22 l12 22 H260 l10 -70 l16 128 l12 -78 l10 20 H430 l12 -16 l12 16 H560 l10 -60 l16 110 l12 -66 l10 16 H800"
        fill="none"
        stroke="#3CC2BF"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
