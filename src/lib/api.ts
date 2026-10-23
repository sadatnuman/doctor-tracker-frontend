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

async function request<T>(method: string, path: string, options: { params?: QueryParams; body?: unknown; signal?: AbortSignal } = {}) {
  let res: Response
  try {
    res = await fetch(`/api${path}${toSearchParams(options.params)}`, {
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

  if (res.status === 204) return undefined as T

  const payload = await res.json().catch(() => null)

  if (!res.ok) {
    const error = payload?.error
    const apiError = new ApiError(
      res.status,
      error?.message ?? (res.status >= 500 ? "The server ran into a problem. Try again in a moment." : "Request failed"),
      error?.code,
      error?.details
    )
    // Session expired mid-use: send the user back to sign in, then return here.
    if (res.status === 401 && typeof window !== "undefined" && !path.startsWith("/auth/login")) {
      const next = encodeURIComponent(window.location.pathname + window.location.search)
      // A full navigation (not router.push) is deliberate: it drops every cached query of the old session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/login?next=${next}&expired=1`)
    }
    throw apiError
  }

  return payload as T
}

export const api = {
  get: <T>(path: string, params?: QueryParams, signal?: AbortSignal) => request<T>("GET", path, { params, signal }),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body }),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, { body }),
  delete: <T>(path: string, params?: QueryParams) => request<T>("DELETE", path, { params }),
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong"
}
