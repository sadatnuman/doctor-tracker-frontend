"use client"

import { CalendarX2, Loader2, LogIn } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { fieldA11y, FormField } from "@/components/common/form-field"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useBookAppointment, useSlots } from "@/hooks/use-appointments"
import { useSession } from "@/hooks/use-auth"
import { useI18n } from "@/i18n/client"
import { ApiError, localizeError } from "@/lib/api"
import { cn } from "@/lib/utils"
import { bookingSchema } from "@/lib/validators"

const DRAFT_KEY = (doctorId: string) => `booking-draft:${doctorId}`
const readDraft = (doctorId: string) => {
  try {
    return sessionStorage.getItem(DRAFT_KEY(doctorId)) ?? ""
  } catch {
    return ""
  }
}
const writeDraft = (doctorId: string, value: string) => {
  try {
    if (value) sessionStorage.setItem(DRAFT_KEY(doctorId), value)
    else sessionStorage.removeItem(DRAFT_KEY(doctorId))
  } catch {
    // Private mode or storage disabled: the reason just isn't remembered.
  }
}

/**
 * Pick a day and a live slot, say why you're coming, then book. Visitors are sent to
 * sign in with the chosen slot in the return URL, and land back here with it selected.
 */
export function BookingPanel({ doctorId, holdMinutes = 5 }: { doctorId: string; holdMinutes?: number }) {
  const { d, tr, f, href, locale } = useI18n()
  const t = d.doctorProfile
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: user, isPending: sessionPending } = useSession()
  const { data: slots, isPending, refetch } = useSlots(doctorId)
  const book = useBookAppointment()

  const preselected = searchParams.get("slot")
  const [dayIndex, setDayIndex] = useState<number | null>(null)
  const [slot, setSlot] = useState<string | null>(preselected)
  const [reason, setReason] = useState(() => (typeof window === "undefined" ? "" : readDraft(doctorId)))
  const [reasonError, setReasonError] = useState<string | null>(null)
  const [openHold, setOpenHold] = useState<string | null>(null)

  const days = useMemo(() => slots?.days ?? [], [slots])
  // Default to the preselected slot's day, else the first day with an open slot.
  const activeDay =
    dayIndex ??
    Math.max(
      0,
      days.findIndex((day) => (preselected ? day.slots.some((s) => s.start === preselected) : day.slots.some((s) => s.available)))
    )
  const day = days[activeDay]
  const selected = days.flatMap((x) => x.slots).find((s) => s.start === slot && s.available)

  const returnTo = `${href(`/doctors/${doctorId}`)}${slot ? `?slot=${encodeURIComponent(slot)}` : ""}`

  const submit = () => {
    const parsed = bookingSchema(d.validation).safeParse({ reason })
    if (!parsed.success) {
      setReasonError(parsed.error.issues[0]?.message ?? d.validation.reason)
      return
    }
    if (!selected) return
    setReasonError(null)
    book.mutate(
      { doctorId, start: selected.start, reason: parsed.data.reason },
      {
        onSuccess: (appointment) => {
          writeDraft(doctorId, "")
          router.push(href(`/account/appointments/${appointment.id}`))
        },
        onError: (error) => {
          const reasonCode = error instanceof ApiError ? (error.details as { reason?: string; appointmentId?: string } | undefined) : undefined
          if (reasonCode?.reason === "OPEN_HOLD" && reasonCode.appointmentId) setOpenHold(reasonCode.appointmentId)
          if (reasonCode?.reason === "SLOT_TAKEN") {
            setSlot(null)
            refetch()
          }
          toast.error(localizeError(error, d.errors))
        },
      }
    )
  }

  return (
    <section aria-labelledby="book-title" className="rounded-xl border bg-card p-5 sm:p-6">
      <h2 id="book-title" className="text-lg font-semibold">
        {t.bookTitle}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{tr(t.bookBody, { minutes: f.number(holdMinutes) })}</p>

      {isPending ? (
        <div className="mt-5 grid gap-3" aria-label={t.loadingSlots} aria-busy>
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : days.length === 0 ? (
        <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarX2 className="size-4" /> {t.noSlotsDay}
        </p>
      ) : (
        <>
          {/* Day strip */}
          <div role="tablist" aria-label={t.selectSlot} className="mt-5 -mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
            {days.map((x, i) => {
              const open = x.slots.filter((s) => s.available).length
              const date = new Date(`${x.date}T12:00:00Z`)
              return (
                <button
                  key={x.date}
                  type="button"
                  role="tab"
                  aria-selected={i === activeDay}
                  onClick={() => setDayIndex(i)}
                  className={cn(
                    "flex min-w-[4.5rem] snap-start flex-col items-center rounded-lg border px-2 py-2 text-center transition-colors",
                    i === activeDay ? "border-primary bg-accent text-accent-foreground" : "hover:bg-muted",
                    !open && "opacity-50"
                  )}
                >
                  <span className="text-xs">{d.enums.weekdaysShort[x.weekday]}</span>
                  <span className="font-heading text-lg leading-tight font-semibold tabular">
                    {new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", { day: "numeric", timeZone: "UTC" }).format(date)}
                  </span>
                  <span className="text-[0.7rem] text-muted-foreground">
                    {new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", { month: "short", timeZone: "UTC" }).format(date)}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Slots for the day */}
          <div role="tabpanel" className="mt-3">
            {day && day.slots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {day.slots.map((s) => (
                  <button
                    key={s.start}
                    type="button"
                    disabled={!s.available}
                    aria-pressed={slot === s.start}
                    onClick={() => setSlot(s.start)}
                    className={cn(
                      "rounded-lg border py-2 text-sm tabular transition-colors",
                      slot === s.start && s.available
                        ? "border-primary bg-primary font-semibold text-primary-foreground"
                        : s.available
                          ? "hover:border-primary/60 hover:bg-accent"
                          : "cursor-not-allowed border-dashed text-muted-foreground line-through"
                    )}
                  >
                    {f.wallTime(s.time)}
                  </button>
                ))}
              </div>
            ) : (
              <p className="py-4 text-sm text-muted-foreground">{day?.slots.length === 0 ? t.notWorking : t.noSlotsDay}</p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">{t.timezoneNote}</p>
          </div>

          <FormField id="booking-reason" label={t.reasonLabel} error={reasonError ?? undefined} className="mt-5">
            <Textarea
              {...fieldA11y("booking-reason", reasonError ?? undefined)}
              rows={3}
              maxLength={500}
              value={reason}
              placeholder={t.reasonPlaceholder}
              onChange={(e) => {
                setReason(e.target.value)
                writeDraft(doctorId, e.target.value)
              }}
            />
          </FormField>

          {selected && (
            <p className="mt-4 rounded-lg bg-muted px-3.5 py-2.5 text-sm">
              <span className="text-muted-foreground">{d.booking.when}: </span>
              <span className="font-medium">
                {f.slotDayLong(selected.start)}, {f.slotTime(selected.start)}
              </span>
            </p>
          )}

          <div className="mt-5">
            {sessionPending ? (
              <Skeleton className="h-10 w-full" />
            ) : !user ? (
              <>
                <Button asChild size="lg" className="h-10 w-full">
                  <Link href={`${href("/login")}?next=${encodeURIComponent(returnTo)}`}>
                    <LogIn />
                    {t.signInToBook}
                  </Link>
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">{t.signInHint}</p>
              </>
            ) : user.role !== "patient" ? (
              <p className="rounded-lg border border-dashed px-3.5 py-3 text-sm text-muted-foreground">{t.doctorsOnly}</p>
            ) : (
              <Button size="lg" className="h-10 w-full" disabled={!selected || book.isPending} onClick={submit}>
                {book.isPending && <Loader2 className="animate-spin" />}
                {book.isPending ? t.booking : t.bookAction}
              </Button>
            )}
            {openHold && (
              <Button asChild variant="link" className="mt-2 h-auto w-full p-0">
                <Link href={href(`/account/appointments/${openHold}`)}>{d.booking.goToOpenHold}</Link>
              </Button>
            )}
          </div>
        </>
      )}
    </section>
  )
}
