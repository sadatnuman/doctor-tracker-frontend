import type { Metadata } from "next"
import { Suspense } from "react"
import { BrandMark, BrandName } from "@/components/brand-mark"
import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Sign in" }

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-3 text-white">
          <BrandMark />
          <BrandName />
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-[2.6rem] leading-[1.08] font-semibold text-white">
            Every doctor, every patient, one clear picture.
          </h1>
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-sidebar-foreground">
            Keep rosters current, follow each caseload from admission to discharge, and see where demand is
            growing.
          </p>
        </div>

        <PulseTrace />
        <p className="relative z-10 text-xs text-sidebar-foreground/70">Restricted to authorised administrators.</p>
      </aside>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[22rem]">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <BrandMark />
            <BrandName />
          </div>
          <h2 className="text-2xl font-semibold">Sign in</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Use your administrator account to continue.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
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
