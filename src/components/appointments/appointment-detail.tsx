"use client"

import { ArrowLeft, CalendarX2, CheckCircle2, Clock, Receipt, XCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { ErrorState } from "@/components/common/states"
import { AppointmentStatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppointment, useCancelAppointment } from "@/hooks/use-appointments"
import { useI18n } from "@/i18n/client"
import type { Appointment } from "@/lib/types"
import { HoldCountdown } from "./hold-countdown"
import { PaymentForm } from "./payment-form"

/** The patient's booking page: pay within the hold, then keep the receipt. */
export function AppointmentDetail() {
  const { id } = useParams<{ id: string }>()
  const { d, href } = useI18n()
  const { data: a, error, isPending, refetch } = useAppointment(id)

  if (isPending) return <DetailSkeleton />
  if (error) {
    return (
      <div className="rounded-xl border bg-card">
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
        <Link href={href("/account")}>
          <ArrowLeft />
          {d.booking.backToAppointments}
        </Link>
      </Button>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="min-w-0">
          {a.status === "pending_payment" && a.holdExpiresAt ? (
            <PendingPayment appointment={a} />
          ) : a.status === "expired" ? (
            <Expired appointment={a} />
          ) : (
            <Settled appointment={a} />
          )}
        </div>
        <Summary appointment={a} />
      </div>
    </>
  )
}

function PendingPayment({ appointment: a }: { appointment: Appointment }) {
  const { d } = useI18n()
  return (
    <section className="rounded-xl border bg-card p-5 sm:p-6" aria-labelledby="pay-title">
      <h1 id="pay-title" className="text-2xl font-semibold">{d.booking.payTitle}</h1>
      <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-[color-mix(in_oklab,var(--pending)_35%,transparent)] bg-[color-mix(in_oklab,var(--pending)_10%,transparent)] px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Clock className="size-4" />
          {d.booking.holdNotice}
        </span>
        <HoldCountdown appointmentId={a.id} expiresAt={a.holdExpiresAt!} serverTime={a.serverTime} className="text-xl" />
      </div>
      <div className="mt-6">
        <PaymentForm appointment={a} />
      </div>
      <CancelButton appointment={a} label={d.booking.abandon} />
    </section>
  )
}

function Expired({ appointment: a }: { appointment: Appointment }) {
  const { d, tr, f, href } = useI18n()
  return (
    <section className="flex flex-col items-center rounded-xl border bg-card px-6 py-14 text-center">
      <span className="mb-4 grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <CalendarX2 className="size-6" />
      </span>
      <h1 className="text-xl font-semibold">{d.booking.holdExpiredTitle}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{tr(d.booking.holdExpiredBody, { minutes: f.number(5) })}</p>
      {a.doctor && (
        <Button asChild className="mt-6">
          <Link href={href(`/doctors/${a.doctor.id}`)}>{d.booking.pickAnother}</Link>
        </Button>
      )}
    </section>
  )
}

function Settled({ appointment: a }: { appointment: Appointment }) {
  const { d, f, tr } = useI18n()
  const p = a.payment
  const confirmed = a.status === "confirmed" || a.status === "completed"
  return (
    <section className="rounded-xl border bg-card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className={`grid size-11 shrink-0 place-items-center rounded-full ${confirmed ? "bg-[color-mix(in_oklab,var(--recovered)_15%,transparent)] text-recovered" : "bg-muted text-muted-foreground"}`}>
          {confirmed ? <CheckCircle2 className="size-6" /> : <XCircle className="size-6" />}
        </span>
        <div>
          <h1 className="text-2xl font-semibold">{confirmed ? d.booking.paidTitle : d.booking.cancelled}</h1>
          {confirmed && <p className="mt-1 text-sm text-muted-foreground">{d.booking.paidBody}</p>}
        </div>
      </div>

      {p && (
        <div className="mt-6 rounded-lg border">
          <p className="flex items-center gap-2 border-b px-4 py-3 text-sm font-semibold">
            <Receipt className="size-4 text-primary" />
            {d.booking.receipt}
          </p>
          <dl className="grid gap-3 px-4 py-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">{d.booking.transaction}</dt>
              <dd className="mt-0.5 font-medium break-all tabular">{p.transactionId}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{d.booking.paidWith}</dt>
              <dd className="mt-0.5 font-medium">{p.instrument}</dd>
            </div>
            {p.paidAt && (
              <div>
                <dt className="text-muted-foreground">{d.booking.paidOn}</dt>
                <dd className="mt-0.5 font-medium">{f.dateTime(p.paidAt)}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground">{d.booking.total}</dt>
              <dd className="mt-0.5 font-heading text-lg font-semibold tabular">{f.money(p.amount)}</dd>
            </div>
          </dl>
          {p.refundedAt && (
            <p className="border-t px-4 py-3 text-sm text-muted-foreground">{tr(d.booking.refunded, { date: f.dateTime(p.refundedAt) })}</p>
          )}
        </div>
      )}

      {a.status === "confirmed" && new Date(a.start) > new Date() && <CancelButton appointment={a} label={d.booking.cancelAction} />}
    </section>
  )
}

function Summary({ appointment: a }: { appointment: Appointment }) {
  const { d, f, href } = useI18n()
  const specialty = a.doctor ? (d.enums.specialization[a.doctor.specialization] ?? a.doctor.specialization) : ""
  return (
    <aside className="rounded-xl border bg-card p-5 lg:sticky lg:top-24">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">{d.booking.summary}</h2>
        <AppointmentStatusBadge status={a.status} />
      </div>
      <dl className="mt-4 grid gap-3.5 text-sm">
        <div>
          <dt className="text-muted-foreground">{d.booking.doctor}</dt>
          <dd className="mt-0.5 font-medium">
            {a.doctor ? (
              <Link href={href(`/doctors/${a.doctor.id}`)} className="hover:text-primary hover:underline">
                {a.doctor.name}
              </Link>
            ) : (
              "—"
            )}
          </dd>
          {a.doctor && (
            <dd className="text-muted-foreground">
              {specialty}, {a.doctor.hospital}
            </dd>
          )}
        </div>
        <div>
          <dt className="text-muted-foreground">{d.booking.when}</dt>
          <dd className="mt-0.5 font-medium">{f.slotDayLong(a.start)}</dd>
          <dd className="text-muted-foreground tabular">
            {f.slotTime(a.start)} – {f.slotTime(a.end)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{d.booking.reason}</dt>
          <dd className="mt-0.5">{a.reason}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t pt-3.5">
          <dt className="font-medium">{d.booking.total}</dt>
          <dd className="font-heading text-xl font-semibold tabular">{f.money(a.fee)}</dd>
        </div>
      </dl>
    </aside>
  )
}

function CancelButton({ appointment, label }: { appointment: Appointment; label: string }) {
  const { d } = useI18n()
  const [open, setOpen] = useState(false)
  const cancel = useCancelAppointment()
  return (
    <>
      <Button variant="ghost" className="mt-5 text-muted-foreground hover:text-destructive" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={(next) => !cancel.isPending && setOpen(next)}
        title={d.booking.cancelTitle}
        description={d.booking.cancelBody}
        confirmLabel={d.booking.cancelAction}
        pending={cancel.isPending}
        onConfirm={() =>
          cancel.mutate(
            { id: appointment.id },
            {
              onSuccess: () => {
                toast.success(d.booking.cancelled)
                setOpen(false)
              },
            }
          )
        }
      />
    </>
  )
}

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]" aria-busy>
      <Skeleton className="h-[28rem] rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  )
}
