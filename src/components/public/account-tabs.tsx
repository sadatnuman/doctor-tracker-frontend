"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense } from "react"
import { useI18n } from "@/i18n/client"
import { cn } from "@/lib/utils"

function Tabs({ pathname }: { pathname: string | null }) {
  const { d, href } = useI18n()
  const tabs = [
    { href: href("/account"), label: d.nav.myAppointments, active: (p: string) => p === href("/account") || p.startsWith(href("/account/appointments")) },
    { href: href("/account/profile"), label: d.nav.profile, active: (p: string) => p.startsWith(href("/account/profile")) },
  ]
  return (
    <nav aria-label={d.nav.account} className="flex gap-1 border-b">
      {tabs.map((tab) => {
        const active = pathname !== null && tab.active(pathname)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}

function ActiveTabs() {
  return <Tabs pathname={usePathname()} />
}

export function AccountTabs() {
  return (
    <Suspense fallback={<Tabs pathname={null} />}>
      <ActiveTabs />
    </Suspense>
  )
}
