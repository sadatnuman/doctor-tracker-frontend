"use client"

import { CalendarCheck, CheckCircle2, CreditCard, Eye, MoreHorizontal, Phone, XCircle } from "lucide-react"
import Link from "next/link"
import { useQueryStates } from "nuqs"
import { memo, useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState, ErrorState } from "@/components/common/states"
import { AppointmentStatusBadge } from "@/components/common/status-badge"
import { MultiFilter } from "@/components/data/multi-filter"
import { Pagination } from "@/components/data/pagination"
import { TableSkeleton } from "@/components/data/table-skeleton"
import { DoctorPicker } from "@/components/doctors/doctor-picker"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useAppointments, useCancelAppointment, useCompleteAppointment } from "@/hooks/use-appointments"
import { useI18n } from "@/i18n/client"
import { APPOINTMENT_VIEWS, appointmentListParams } from "@/lib/search-params"
import { APPOINTMENT_STATUSES, type Appointment } from "@/lib/types"
import { cn } from "@/lib/utils"

export type AppointmentMode = "patient" | "doctor" | "admin"

interface AppointmentListProps {
  mode: AppointmentMode
  /** Fixed view without tabs/filters/pagination (e.g. "next up" on an overview). */
  preview?: { when: "upcoming" | "past"; limit: number }
}

export function AppointmentList({ mode, preview }: AppointmentListProps) {
  const { d, href } = useI18n()
  const t = d.appointment
  const [query, setQuery] = useQueryStates(appointmentListParams, { history: "replace" })
  const [cancelling, setCancelling] = useState<Appointment | null>(null)
  const cancel = useCancelAppointment()

  const params = useMemo(
    () =>
      preview
        ? { when: preview.when, limit: preview.limit, page: 1, status: preview.when === "upcoming" ? ["confirmed", "pending_payment"] : undefined }
        : {
            page: query.page,
            limit: query.limit,
            when: query.when,
            status: query.status,
            doctor: mode === "admin" ? query.doctor : undefined,
          },
    [query, mode, preview]
  )
  const { data, error, isPending, isPlaceholderData, refetch } = useAppointments(params)
  const onCancel = useCallback((a: Appointment) => setCancelling(a), [])
  const setFilter = (patch: Partial<typeof query>) => setQuery({ ...patch, page: 1 })

  const emptyTitle = (preview?.when ?? query.when) === "upcoming" ? t.emptyUpcoming : (preview?.when ?? query.when) === "past" ? t.emptyPast : t.emptyAll

  return (
    <>
      {!preview && (
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            type="single"
            variant="outline"
            value={query.when}
            onValueChange={(v) => v && setFilter({ when: v as (typeof APPOINTMENT_VIEWS)[number] })}
            className="bg-card"
          >
            {APPOINTMENT_VIEWS.map((view) => (
              <ToggleGroupItem key={view} value={view} className="px-4 data-[state=on]:bg-accent data-[state=on]:font-semibold data-[state=on]:text-accent-foreground">
                {t[view]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {mode !== "patient" && (
            <MultiFilter
              label={t.filterStatus}
              options={APPOINTMENT_STATUSES}
              value={query.status}
              getLabel={(s) => t.status[s]}
              onChange={(status) => setFilter({ status })}
              className="w-auto min-w-40"
            />
          )}
          {mode === "admin" && <DoctorPicker allowAll value={query.doctor} onChange={(id) => setFilter({ doctor: id })} className="w-56" />}
        </div>
      )}

      <div className={cn("overflow-hidden rounded-xl border bg-card transition-opacity", !preview && "mt-4", isPlaceholderData && "opacity-60")}>
        {isPending ? (
          <TableSkeleton rows={preview?.limit ?? 6} columns={4} />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : data.data.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title={emptyTitle}
            description={mode === "patient" ? t.emptyPatientBody : mode === "doctor" ? t.emptyDoctorBody : undefined}
            action={
              mode === "patient" ? (
                <Button asChild>
                  <Link href={href("/doctors")}>{d.nav.findDoctors}</Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="divide-y">
            {data.data.map((appointment) => (
              <AppointmentRow key={appointment.id} appointment={appointment} mode={mode} onCancel={onCancel} />
            ))}
          </ul>
        )}
      </div>

      {!preview && data && data.meta.total > 0 && (
        <Pagination
          meta={data.meta}
          noun={d.nouns.appointments}
          onPageChange={(page) => setQuery({ page })}
          onLimitChange={(limit) => setQuery({ limit, page: 1 })}
        />
      )}

      <ConfirmDialog
        open={Boolean(cancelling)}
        onOpenChange={(open) => !open && !cancel.isPending && setCancelling(null)}
        title={d.booking.cancelTitle}
        description={d.booking.cancelBody}
        confirmLabel={d.booking.cancelAction}
        pending={cancel.isPending}
        onConfirm={() =>
          cancelling &&
          cancel.mutate(
            { id: cancelling.id },
            {
              onSuccess: () => {
                toast.success(d.booking.cancelled)
                setCancelling(null)
              },
            }
          )
        }
      />
    </>
  )
}

interface RowProps {
  appointment: Appointment
  mode: AppointmentMode
  onCancel: (appointment: Appointment) => void
}

const AppointmentRow = memo(function AppointmentRow({ appointment: a, mode, onCancel }: RowProps) {
  const { d, f, tr, href } = useI18n()
  const t = d.appointment
  const complete = useCompleteAppointment()
  const started = new Date(a.start) <= new Date()
  const canCancel = (a.status === "pending_payment" || a.status === "confirmed") && (mode === "admin" || !started)
  const canComplete = mode !== "patient" && a.status === "confirmed" && started
  const specialty = a.doctor ? (d.enums.specialization[a.doctor.specialization] ?? a.doctor.specialization) : ""

  return (
    <li className="grid gap-3 px-4 py-4 sm:grid-cols-[9.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-5">
      <div className="flex items-baseline gap-2 sm:block">
        <p className="font-heading font-semibold">{f.slotDay(a.start)}</p>
        <p className="text-sm text-muted-foreground tabular">{f.slotTime(a.start)}</p>
      </div>

      <div className="min-w-0">
        {mode === "patient" ? (
          <p className="truncate font-medium">
            {a.doctor ? (
              <Link href={href(`/doctors/${a.doctor.id}`)} className="hover:text-primary hover:underline">
                {a.doctor.name}
              </Link>
            ) : (
              "—"
            )}
            <span className="font-normal text-muted-foreground">, {specialty}</span>
          </p>
        ) : (
          <p className="truncate font-medium">
            {a.patientUser?.name}
            {mode === "admin" && a.doctor && <span className="font-normal text-muted-foreground"> → {a.doctor.name}</span>}
          </p>
        )}
        <p className="mt-0.5 truncate text-sm text-muted-foreground">{a.reason}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <AppointmentStatusBadge status={a.status} />
          {a.payment && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <CreditCard className="size-3.5" />
              {f.money(a.payment.amount)}, {t.payments[a.payment.status]}
            </span>
          )}
          {!a.payment && <span className="text-muted-foreground tabular">{f.money(a.fee)}</span>}
          {a.cancelledBy && a.status === "cancelled" && <span className="text-muted-foreground">{tr(t.cancelledBy, { role: d.roles[a.cancelledBy] })}</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:justify-end">
        {mode === "patient" && a.status === "pending_payment" && (
          <Button asChild size="sm">
            <Link href={href(`/account/appointments/${a.id}`)}>{t.payNow}</Link>
          </Button>
        )}
        {canComplete && (
          <Button size="sm" variant="outline" disabled={complete.isPending} onClick={() => complete.mutate(a.id, { onSuccess: () => toast.success(t.completed) })}>
            <CheckCircle2 />
            {t.complete}
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={tr(d.common.actionsFor, { name: a.patientUser?.name ?? a.doctor?.name ?? "" })}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {mode === "patient" && (
              <DropdownMenuItem asChild>
                <Link href={href(`/account/appointments/${a.id}`)}>
                  <Eye />
                  {t.details}
                </Link>
              </DropdownMenuItem>
            )}
            {mode !== "patient" && a.patientUser && (
              <DropdownMenuItem asChild>
                <a href={`tel:${a.patientUser.phone ?? ""}`}>
                  <Phone />
                  {a.patientUser.phone ?? a.patientUser.email}
                </a>
              </DropdownMenuItem>
            )}
            {canCancel && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => onCancel(a)}>
                  <XCircle />
                  {d.booking.cancelAction}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  )
})
