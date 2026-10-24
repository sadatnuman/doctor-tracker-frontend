"use client"

import Link from "next/link"
import { AppointmentList } from "@/components/appointments/appointment-list"
import { ErrorState } from "@/components/common/states"
import { CaseloadStrip, DoctorDetailSkeleton, DoctorProfileHeader } from "@/components/doctors/doctor-detail-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDoctorOverview, useMyDoctor } from "@/hooks/use-doctors"
import { useI18n } from "@/i18n/client"

/** The doctor's home: this month's numbers, their profile and the next visits. */
export function DoctorOverview() {
  const { d, tr, f, href } = useI18n()
  const t = d.doctorArea
  const doctor = useMyDoctor()
  const overview = useDoctorOverview()

  if (doctor.error) {
    return (
      <div className="rounded-xl border bg-card">
        <ErrorState error={doctor.error} onRetry={() => doctor.refetch()} />
      </div>
    )
  }

  const stats = overview.data
    ? [
        { label: t.upcoming, value: f.number(overview.data.upcoming) },
        { label: t.completedMonth, value: f.number(overview.data.completedThisMonth) },
        { label: t.revenueMonth, value: f.money(overview.data.revenueThisMonth) },
        { label: t.patients, value: f.number(overview.data.patientCount) },
      ]
    : null

  return (
    <>
      <div className="mb-6">
        {doctor.data ? (
          <h1 className="text-[1.75rem] leading-tight font-semibold sm:text-[2rem]">{tr(t.greeting, { name: doctor.data.name })}</h1>
        ) : (
          <Skeleton className="h-9 w-72" />
        )}
        <p className="mt-1.5 text-sm text-muted-foreground">{t.overviewBody}</p>
      </div>

      {stats ? (
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-card px-5 py-4 sm:py-5">
              <dt className="text-sm text-muted-foreground">{s.label}</dt>
              <dd className="mt-1 font-heading text-[1.75rem] leading-none font-semibold tabular sm:text-[2rem]">{s.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <Skeleton className="h-[104px] rounded-xl" />
      )}

      <section className="mt-6" aria-labelledby="next-up">
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 id="next-up" className="text-lg font-semibold">{t.nextUp}</h2>
          <Button asChild variant="link" className="h-auto p-0">
            <Link href={href("/doctor/appointments")}>{t.seeAll}</Link>
          </Button>
        </div>
        <AppointmentList mode="doctor" preview={{ when: "upcoming", limit: 5 }} />
      </section>

      <section className="mt-8 rounded-xl border bg-card">
        {doctor.data ? (
          <>
            <DoctorProfileHeader doctor={doctor.data} />
            <CaseloadStrip doctor={doctor.data} />
          </>
        ) : (
          <DoctorDetailSkeleton />
        )}
      </section>
    </>
  )
}
