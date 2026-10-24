"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api, ApiError } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import type { SessionUser, User } from "@/lib/types"
import type { ChangePasswordValues, LoginValues, ProfileValues, RegisterValues } from "@/lib/validators"

type SessionResponse = { data: { user: SessionUser; accessToken: string; expiresIn: number } }

/**
 * The signed-in user, or `null` for visitors. Silent: a 401 here never redirects,
 * so public pages can ask "who is this?" safely.
 */
export function useSession() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async ({ signal }) => {
      try {
        return (await api.get<{ data: User }>("/auth/me", undefined, signal, { silent: true })).data
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null
        throw error
      }
    },
    staleTime: 5 * 60_000,
    retry: false,
  })
}

function useSessionMutation<TVars>(fn: (vars: TVars) => Promise<SessionResponse>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    meta: { silent: true }, // forms show errors inline
    onSuccess: async () => {
      // Drop any data cached for a previous session, then load the new user.
      queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== "auth" })
      await queryClient.invalidateQueries({ queryKey: queryKeys.me })
    },
  })
}

export const useLogin = () => useSessionMutation((values: LoginValues) => api.post<SessionResponse>("/auth/login", values))
export const useRegister = () =>
  useSessionMutation((values: RegisterValues) => api.post<SessionResponse>("/auth/register", values))

/** Full navigation after sign-out: no cached data from the old session survives. */
function leave(path: string) {
  window.location.assign(path)
}

export function useLogout(redirectTo: string) {
  return useMutation({
    mutationFn: () => api.post<void>("/auth/logout"),
    onSettled: () => leave(redirectTo),
  })
}

export function useLogoutEverywhere(redirectTo: string) {
  return useMutation({
    mutationFn: () => api.post<void>("/auth/logout-all"),
    onSuccess: () => leave(redirectTo),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: ProfileValues) => api.patch<{ data: User }>("/auth/me", values).then((r) => r.data),
    meta: { silent: true },
    onSuccess: (user) => queryClient.setQueryData(queryKeys.me, user),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (values: ChangePasswordValues) => api.post<SessionResponse>("/auth/change-password", values),
    meta: { silent: true },
  })
}
