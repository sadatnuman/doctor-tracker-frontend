"use client"

import { PageHeader } from "@/components/common/page-header"
import { ScheduleForm } from "@/components/doctors/schedule-form"
import { Skeleton } from "@/components/ui/skeleton"
import { useMyDoctor } from "@/hooks/use-doctors"
import { useI18n } from "@/i18n/client"

export function MySchedule() {
  const { d } = useI18n()
  const { data: doctor } = useMyDoctor()
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={d.doctorArea.scheduleTitle} description={d.doctorArea.scheduleBody} />
      <section className="rounded-xl border bg-card p-5 sm:p-6">
        {/* Keyed by doctor so the form starts from the saved schedule once it loads. */}
        {doctor ? <ScheduleForm key={doctor.id} availability={doctor.availability} /> : <Skeleton className="h-64" />}
      </section>
    </div>
  )
}
