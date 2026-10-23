"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api, type QueryParams } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import type { Paginated, Patient } from "@/lib/types"
import type { PatientValues } from "@/lib/validators"

/** All patients, or one doctor's patients when `doctorId` is set (nested REST route). */
export function usePatients(params: QueryParams, doctorId?: string) {
  const path = doctorId ? `/doctors/${doctorId}/patients` : "/patients"
  return useQuery({
    queryKey: queryKeys.patients.list({ ...params, doctorScope: doctorId }),
    queryFn: ({ signal }) => api.get<Paginated<Patient>>(path, params, signal),
    placeholderData: (previous) => previous,
  })
}

function useInvalidatePatientData() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all }),
      // Doctor rows show patient counts; dashboard shows aggregates.
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.stats }),
    ])
}

const toPayload = ({ email, notes, ...values }: Partial<PatientValues>) => ({
  ...values,
  ...(email !== undefined && { email: email || "" }),
  ...(notes !== undefined && { notes }),
})

export function useCreatePatient() {
  const invalidate = useInvalidatePatientData()
  return useMutation({
    mutationFn: ({ doctor, ...values }: PatientValues) =>
      api.post<{ data: Patient }>(`/doctors/${doctor}/patients`, toPayload(values)).then((r) => r.data),
    meta: { silent: true }, // the form maps errors onto fields
    onSuccess: invalidate,
  })
}

export function useUpdatePatient() {
  const invalidate = useInvalidatePatientData()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<PatientValues> }) =>
      api.patch<{ data: Patient }>(`/patients/${id}`, toPayload(values)).then((r) => r.data),
    meta: { silent: true },
    onSuccess: invalidate,
  })
}

/**
 * Optimistically removes the row from every cached patients page, rolling back on failure.
 * With `doctorId` it goes through the doctor-scoped route.
 */
export function useDeletePatient() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidatePatientData()
  return useMutation({
    mutationFn: ({ id, doctorId }: { id: string; doctorId?: string }) =>
      api.delete<{ data: { id: string } }>(doctorId ? `/doctors/${doctorId}/patients/${id}` : `/patients/${id}`),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.patients.lists() })
      const snapshot = queryClient.getQueriesData<Paginated<Patient>>({ queryKey: queryKeys.patients.lists() })
      queryClient.setQueriesData<Paginated<Patient>>({ queryKey: queryKeys.patients.lists() }, (old) =>
        old
          ? { data: old.data.filter((p) => p.id !== id), meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) } }
          : old
      )
      return { snapshot }
    },
    onError: (_error, _vars, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
    onSettled: invalidate,
  })
}
