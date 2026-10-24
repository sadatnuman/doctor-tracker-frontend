import type { Dictionary } from "@/i18n/dictionaries/en"

/**
 * Thin typed fetch client. Requests go to same-origin `/api/*`, which Next.js
 * rewrites to the Express backend — so the httpOnly auth cookie is first-party.
 */

export interface FieldError {
  field: string
  message: string
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code = "ERROR",
    public readonly details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }

  get fieldErrors(): FieldError[] {
    return Array.isArray(this.details) ? (this.details as FieldError[]) : []
  }
}

type QueryValue = string | number | boolean | Date | null | undefined | readonly string[]
export type QueryParams = Record<string, QueryValue>

function toSearchParams(params?: QueryParams) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === "") continue
    if (Array.isArray(value)) {
      if (value.length) search.set(key, value.join(","))
    } else {
      search.set(key, value instanceof Date ? value.toISOString() : String(value))
    }
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ""
}

interface RequestOptions {
  params?: QueryParams
  body?: unknown
  signal?: AbortSignal
  /** Don't redirect to sign-in on 401 (e.g. "am I signed in?" checks on public pages). */
  silent?: boolean
}

async function send(method: string, path: string, options: RequestOptions) {
  try {
    return await fetch(`/api${path}${toSearchParams(options.params)}`, {
      method,
      credentials: "same-origin",
      headers: options.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    })
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.", "NETWORK_ERROR")
  }
}

/**
 * One refresh at a time for the whole tab: concurrent 401s wait on the same promise
 * instead of each rotating the refresh token (which the API would treat as reuse).
 */
let refreshing: Promise<boolean> | null = null
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function refreshSession(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const res = await send("POST", "/auth/refresh", {})
      if (res.ok) return true
      const code = (await res.json().catch(() => null))?.error?.code
      // Another tab rotated the token a moment ago; its cookie is already ours.
      if (code === "REFRESH_RACE") {
        await sleep(250)
        return true
      }
      return false
    } finally {
      setTimeout(() => (refreshing = null), 0)
    }
  })()
  return refreshing
}

const NO_REFRESH = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"]

function redirectToSignIn() {
  if (typeof window === "undefined") return
  const [, locale = "en"] = window.location.pathname.split("/")
  const next = encodeURIComponent(window.location.pathname + window.location.search)
  // A full navigation (not router.push) is deliberate: it drops every cached query of the old session.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`/${locale}/login?next=${next}&expired=1`)
}

async function request<T>(method: string, path: string, options: RequestOptions = {}, retried = false): Promise<T> {
  const res = await send(method, path, options)
  if (res.status === 204) return undefined as T

  const payload = await res.json().catch(() => null)

  if (!res.ok) {
    const error = payload?.error
    // Access token expired: refresh once, then replay the original request.
    if (res.status === 401 && !retried && !NO_REFRESH.some((p) => path.startsWith(p))) {
      if (await refreshSession()) return request<T>(method, path, options, true)
      if (!options.silent) redirectToSignIn()
    }
    throw new ApiError(
      res.status,
      error?.message ?? (res.status >= 500 ? "The server ran into a problem. Try again in a moment." : "Request failed"),
      error?.code,
      error?.details
    )
  }

  return payload as T
}

export const api = {
  get: <T>(path: string, params?: QueryParams, signal?: AbortSignal, opts?: { silent?: boolean }) =>
    request<T>("GET", path, { params, signal, ...opts }),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body }),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, { body }),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, { body }),
  delete: <T>(path: string, params?: QueryParams) => request<T>("DELETE", path, { params }),
}

/**
 * User-facing message in the current language: known codes (and `details.reason`)
 * map to the dictionary; anything else falls back to the server's own message.
 */
export function localizeError(error: unknown, messages: Dictionary["errors"]): string {
  if (!(error instanceof ApiError)) return error instanceof Error ? error.message : messages.SERVER
  const reason = (error.details as { reason?: string } | undefined)?.reason
  for (const key of [reason, error.code]) {
    if (key && key in messages) return messages[key as keyof typeof messages]
  }
  if (error.status === 403) return messages.FORBIDDEN
  if (error.status >= 500 || error.status === 0) return error.status === 0 ? messages.NETWORK_ERROR : messages.SERVER
  return error.message
}
