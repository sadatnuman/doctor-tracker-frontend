import type { Metadata } from "next"
import { RoleGate } from "@/components/common/role-gate"
import { AccountTabs } from "@/components/public/account-tabs"
import { SiteNav } from "@/components/public/site-nav"

// Private area: never indexed (also disallowed in robots.txt).
export const metadata: Metadata = { robots: { index: false, follow: false } }

/** The patient's area keeps the public header, so booking more is one click away. */
export default function AccountLayout({ children }: LayoutProps<"/[lang]/account">) {
  return (
    <>
      <SiteNav />
      <main id="main" className="mx-auto w-full max-w-6xl px-4 pt-8 pb-20 sm:px-6">
        <RoleGate role="patient">
          <AccountTabs />
          <div className="mt-6">{children}</div>
        </RoleGate>
      </main>
    </>
  )
}
