"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api, type QueryParams } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import type { Appointment, DoctorSlots, Paginated } from "@/lib/types"
import type { CardPaymentValues, WalletPaymentValues } from "@/lib/validators"

/** Rows are scoped by the API to the caller's role (all / own schedule / own bookings). */
export function useAppointments(params: QueryParams) {
  return useQuery({
    queryKey: queryKeys.appointments.list(params),
    queryFn: ({ signal }) => api.get<Paginated<Appointment>>("/appointments", params, signal),
    placeholderData: (previous) => previous,
  })
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: queryKeys.appointments.detail(id),
    queryFn: ({ signal }) => api.get<{ data: Appointment }>(`/appointments/${id}`, undefined, signal).then((r) => r.data),
    // While the hold is ticking, re-check so an expiry elsewhere shows up promptly.
    refetchInterval: (query) => (query.state.data?.status === "pending_payment" ? 30_000 : false),
  })
}

/** Live availability: never cached for long, refreshed while the picker is open. */
export function useSlots(doctorId: string, from?: string) {
  return useQuery({
    queryKey: queryKeys.slots(doctorId, from),
    queryFn: ({ signal }) =>
      api.get<{ data: DoctorSlots }>(`/public/doctors/${doctorId}/slots`, { from, days: 14 }, signal, { silent: true }).then((r) => r.data),
    staleTime: 10_000,
    refetchInterval: 60_000,
  })
}

function useInvalidateBookings() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all }),
      queryClient.invalidateQueries({ queryKey: ["slots"] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.myOverview }),
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.stats }),
    ])
}

export function useBookAppointment() {
  const invalidate = useInvalidateBookings()
  return useMutation({
    mutationFn: (input: { doctorId: string; start: string; reason: string }) =>
      api.post<{ data: Appointment }>("/appointments", input).then((r) => r.data),
    meta: { silent: true }, // the booking panel explains failures inline
    onSuccess: invalidate,
  })
}

export function usePayAppointment(id: string) {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateBookings()
  return useMutation({
    mutationFn: (payment: CardPaymentValues | WalletPaymentValues) =>
      api.post<{ data: Appointment }>(`/appointments/${id}/pay`, payment).then((r) => r.data),
    meta: { silent: true },
    onSuccess: (appointment) => {
      queryClient.setQueryData(queryKeys.appointments.detail(id), appointment)
      return invalidate()
    },
  })
}

export function useCancelAppointment() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateBookings()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.post<{ data: Appointment }>(`/appointments/${id}/cancel`, { reason }).then((r) => r.data),
    onSuccess: (appointment) => {
      queryClient.setQueryData(queryKeys.appointments.detail(appointment.id), appointment)
      return invalidate()
    },
  })
}

export function useCompleteAppointment() {
  const invalidate = useInvalidateBookings()
  return useMutation({
    mutationFn: (id: string) => api.post<{ data: Appointment }>(`/appointments/${id}/complete`).then((r) => r.data),
    onSuccess: invalidate,
  })
}
