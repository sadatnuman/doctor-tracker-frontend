"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import type { User } from "@/lib/types"
import type { LoginValues } from "@/lib/validators"

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: ({ signal }) => api.get<{ data: User }>("/auth/me", undefined, signal).then((r) => r.data),
    staleTime: 5 * 60_000,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: LoginValues) => api.post<{ data: { user: User } }>("/auth/login", values),
    meta: { silent: true }, // the form shows the error inline
    onSuccess: ({ data }) => queryClient.setQueryData(queryKeys.me, data.user),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: () => api.post<void>("/auth/logout"),
    onSettled: () => {
      queryClient.clear()
      router.replace("/login")
      router.refresh()
    },
  })
}
