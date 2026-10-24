"use client"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useSession } from "@/hooks/use-auth"
import { useI18n } from "@/i18n/client"
import { ROLE_HOME, type Role } from "@/lib/types"

/**
 * Client-side role check for workspace areas. The proxy already redirects wrong roles
 * when the access token is fresh; this covers the "expired token, valid refresh cookie"
 * path, where the role is only known after the first (refreshing) API call.
 */
export function RoleGate({ role, children }: { role: Role; children: React.ReactNode }) {
  const { data: user, isPending } = useSession()
  const router = useRouter()
  const { href, d } = useI18n()

  const allowed = user?.role === role
  useEffect(() => {
    if (isPending || allowed) return
    if (!user) router.replace(`${href("/login")}?next=${encodeURIComponent(window.location.pathname)}`)
    else router.replace(href(ROLE_HOME[user.role]))
  }, [isPending, allowed, user, router, href])

  if (!allowed) {
    return (
      <div className="grid min-h-[60dvh] place-items-center" role="status" aria-live="polite">
        <Loader2 className="size-6 animate-spin text-primary" aria-label={d.common.loading} />
      </div>
    )
  }
  return <>{children}</>
}
