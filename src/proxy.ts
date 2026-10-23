import { jwtVerify } from "jose"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Route protection (optimistic check). Verifies the httpOnly JWT cookie's signature
 * and expiry before any page renders. The Express API re-verifies on every request,
 * so this layer is about UX (no flash of protected UI) — not the only line of defense.
 */

const AUTH_COOKIE = "dt_token"
const PUBLIC_PATHS = ["/login"]
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "")

async function isAuthenticated(token: string | undefined) {
  if (!token || !process.env.JWT_SECRET) return false
  try {
    await jwtVerify(token, secret, { algorithms: ["HS256"], issuer: "doctor-tracker-api" })
    return true
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const authed = await isAuthenticated(request.cookies.get(AUTH_COOKIE)?.value)
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  if (!authed && !isPublic) {
    const url = new URL("/login", request.url)
    if (pathname !== "/") url.searchParams.set("next", pathname + search)
    const response = NextResponse.redirect(url)
    // Drop a stale/forged cookie so the login page starts clean.
    if (request.cookies.has(AUTH_COOKIE)) response.cookies.delete(AUTH_COOKIE)
    return response
  }

  if (authed && isPublic) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Skip the API (rewritten to the backend, which does its own auth), Next internals and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|.*\\.(?:png|jpg|svg|webp)$).*)"],
}
