"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api, type QueryParams } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import type { Doctor, DoctorDetail, FilterOptions, Paginated } from "@/lib/types"
import type { DoctorValues } from "@/lib/validators"

export function useDoctors(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.doctors.list(params),
    queryFn: ({ signal }) => api.get<Paginated<Doctor>>("/doctors", params, signal),
    // Keep the current page on screen while the next one loads — no flicker.
    placeholderData: (previous) => previous,
  })
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: queryKeys.doctors.detail(id),
    queryFn: ({ signal }) => api.get<{ data: DoctorDetail }>(`/doctors/${id}`, undefined, signal).then((r) => r.data),
    enabled: Boolean(id),
  })
}

/** Lightweight lookup used by doctor pickers (patients filter, patient form). */
export function useDoctorOptions(search: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.doctors.options(search),
    queryFn: ({ signal }) =>
      api
        .get<Paginated<Doctor>>("/doctors", { search, limit: 20, sort: "name" }, signal)
        .then((r) => r.data),
    enabled,
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  })
}

export function useFilterOptions() {
  return useQuery({
    queryKey: queryKeys.filterOptions,
    queryFn: ({ signal }) => api.get<{ data: FilterOptions }>("/meta/filters", undefined, signal).then((r) => r.data),
    staleTime: 5 * 60_000,
  })
}

function useInvalidateDoctorData() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.filterOptions }),
      queryClient.invalidateQueries({ queryKey: queryKeys.stats }),
    ])
}

export function useCreateDoctor() {
  const invalidate = useInvalidateDoctorData()
  return useMutation({
    mutationFn: (values: DoctorValues) => api.post<{ data: Doctor }>("/doctors", values).then((r) => r.data),
    meta: { silent: true }, // the form maps errors onto fields
    onSuccess: invalidate,
  })
}

export function useUpdateDoctor(id: string) {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateDoctorData()
  return useMutation({
    mutationFn: (values: Partial<DoctorValues>) =>
      api.patch<{ data: Doctor }>(`/doctors/${id}`, values).then((r) => r.data),
    meta: { silent: true },
    onSuccess: (doctor) => {
      queryClient.setQueryData<DoctorDetail>(queryKeys.doctors.detail(id), (old) => (old ? { ...old, ...doctor } : old))
      // Patient rows embed the doctor's name.
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all })
      return invalidate()
    },
  })
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateDoctorData()
  return useMutation({
    mutationFn: ({ id, cascade }: { id: string; cascade?: boolean }) =>
      api.delete<{ data: { id: string; deletedPatients: number } }>(`/doctors/${id}`, { cascade }).then((r) => r.data),
    onSuccess: ({ id }) => {
      queryClient.removeQueries({ queryKey: queryKeys.doctors.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all })
      return invalidate()
    },
  })
}
