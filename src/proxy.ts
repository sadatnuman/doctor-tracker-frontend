import { jwtVerify } from "jose"
import { NextResponse, type NextRequest } from "next/server"
import { DEFAULT_LOCALE, hasLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config"

/**
 * Runs before every page:
 * 1. Locale routing — paths without /en or /bn are redirected to the visitor's
 *    language (saved choice → browser language → English).
 * 2. Role-based route protection (optimistic) — /admin, /doctor and /account need the
 *    matching role, verified from the access-token signature. The API re-checks every
 *    request, so this layer is about UX (no flash of the wrong area), not the only defense.
 */

const ACCESS_COOKIE = "dt_access"
const REFRESH_COOKIE = "dt_refresh"
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "")

type Role = "admin" | "doctor" | "patient"
const AREA_ROLE: Record<string, Role> = { admin: "admin", doctor: "doctor", account: "patient" }
const ROLE_HOME: Record<Role, string> = { admin: "/admin", doctor: "/doctor", patient: "/account" }
const AUTH_PAGES = new Set(["login", "register"])

async function sessionRole(token: string | undefined): Promise<Role | null> {
  if (!token || !process.env.JWT_SECRET) return null
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
      issuer: "doctor-tracker-api",
      audience: "doctor-tracker",
    })
    return payload.typ === "access" ? (payload.role as Role) : null
  } catch {
    return null
  }
}

function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value
  if (hasLocale(saved)) return saved
  const accept = request.headers.get("accept-language") ?? ""
  return /(^|,)\s*bn\b/i.test(accept) ? "bn" : DEFAULT_LOCALE
}

/** Only same-site relative paths are accepted as a post-login destination. */
const safeNext = (value: string | null) => (value && value.startsWith("/") && !value.startsWith("//") ? value : null)

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const [, first, area] = pathname.split("/")

  // 1. Locale prefix
  if (!hasLocale(first)) {
    const url = request.nextUrl.clone()
    url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`
    return NextResponse.redirect(url)
  }
  const locale = first

  // 2. Role areas
  const role = await sessionRole(request.cookies.get(ACCESS_COOKIE)?.value)
  const canRefresh = request.cookies.has(REFRESH_COOKIE)
  const required = area ? AREA_ROLE[area] : undefined

  if (required) {
    if (role && role !== required) {
      return NextResponse.redirect(new URL(`/${locale}${ROLE_HOME[role]}`, request.url))
    }
    // An expired access token with a refresh cookie is let through: the client refreshes
    // on its first API call, and the area layout re-checks the role.
    if (!role && !canRefresh) {
      const url = new URL(`/${locale}/login`, request.url)
      url.searchParams.set("next", pathname + search)
      return NextResponse.redirect(url)
    }
  }

  if (area && AUTH_PAGES.has(area) && role) {
    const next = safeNext(request.nextUrl.searchParams.get("next"))
    const allowed = next && (!AREA_ROLE[next.split("/")[2] ?? ""] || AREA_ROLE[next.split("/")[2] ?? ""] === role)
    return NextResponse.redirect(new URL(allowed ? next : `/${locale}${ROLE_HOME[role]}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Skip the API (rewritten to the backend, which does its own auth), Next internals and metadata files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|manifest.webmanifest|opengraph-image|.*\\.(?:png|jpg|svg|webp|ico)$).*)"],
}
