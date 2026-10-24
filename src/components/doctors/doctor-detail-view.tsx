"use client"

import { ArrowLeft, Building2, CalendarClock, Mail, Pencil, Phone, Plus, Trash2, Wallet } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { ErrorState } from "@/components/common/states"
import { StatusBand } from "@/components/common/status-band"
import { UserAvatar } from "@/components/common/user-avatar"
import { PatientList } from "@/components/patients/patient-list"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDoctor } from "@/hooks/use-doctors"
import { useI18n } from "@/i18n/client"
import { ApiError } from "@/lib/api"
import type { DoctorDetail, PatientStatus } from "@/lib/types"
import { DeleteDoctorDialog } from "./delete-doctor-dialog"
import { DoctorAccountCard } from "./doctor-account-card"
import { DoctorFormDialog } from "./doctor-form-dialog"
import { ScheduleForm } from "./schedule-form"

/** Admin view of one doctor: profile, caseload, login, schedule and patient list. */
export function DoctorDetailView() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { d, tr, href } = useI18n()
  const t = d.doctorsAdmin
  const { data: doctor, error, isPending, refetch } = useDoctor(id)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (isPending) return <DoctorDetailSkeleton />

  if (error) {
    const notFound = error instanceof ApiError && (error.status === 404 || error.status === 400)
    return (
      <div className="rounded-xl border bg-card">
        {notFound ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <h1 className="font-heading text-lg font-semibold">{t.notOnRoster}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.notOnRosterBody}</p>
            <Button asChild variant="outline" className="mt-5">
              <Link href={href("/admin/doctors")}>{t.backToDoctors}</Link>
            </Button>
          </div>
        ) : (
          <ErrorState error={error} onRetry={() => refetch()} />
        )}
      </div>
    )
  }

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
        <Link href={href("/admin/doctors")}>
          <ArrowLeft />
          {t.allDoctorsLink}
        </Link>
      </Button>

      <section className="rounded-xl border bg-card">
        <DoctorProfileHeader
          doctor={doctor}
          actions={
            <>
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil />
                {d.common.edit}
              </Button>
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 />
                {d.common.delete}
              </Button>
            </>
          }
        />
        <CaseloadStrip doctor={doctor} />
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <DoctorAccountCard doctor={doctor} />
        <section className="rounded-xl border bg-card p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <CalendarClock className="size-4 text-primary" />
            {d.doctorArea.scheduleTitle}
          </h2>
          <p className="mt-0.5 mb-4 text-sm text-muted-foreground">{d.doctorArea.scheduleBody}</p>
          <ScheduleForm availability={doctor.availability} doctorId={doctor.id} />
        </section>
      </div>

      <div className="mt-8">
        <PatientList
          doctor={doctor}
          header={(openCreate) => (
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{t.patientsHeading}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">{tr(t.inCare, { name: doctor.name })}</p>
              </div>
              <Button onClick={openCreate}>
                <Plus />
                {d.admin.addPatient}
              </Button>
            </div>
          )}
        />
      </div>

      <DoctorFormDialog open={editOpen} onOpenChange={setEditOpen} doctor={doctor} />
      <DeleteDoctorDialog doctor={deleteOpen ? doctor : null} onClose={() => setDeleteOpen(false)} onDeleted={() => router.replace(href("/admin/doctors"))} />
    </>
  )
}

/** Name, specialty and contact block; shared by the admin view and the doctor's own overview. */
export function DoctorProfileHeader({ doctor, actions }: { doctor: DoctorDetail; actions?: React.ReactNode }) {
  const { d, f, tr } = useI18n()
  return (
    <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <UserAvatar name={doctor.name} src={doctor.avatarUrl} tone="teal" className="size-14 rounded-2xl font-heading text-lg" />
        <div className="min-w-0">
          <h1 className="text-[1.6rem] leading-tight font-semibold sm:text-[1.85rem]">{doctor.name}</h1>
          <p className="mt-1 font-medium text-primary">{d.enums.specialization[doctor.specialization] ?? doctor.specialization}</p>
          <ul className="mt-3 grid gap-1.5 text-sm text-muted-foreground sm:flex sm:flex-wrap sm:gap-x-5">
            <li className="flex items-center gap-2">
              <Building2 className="size-4" />
              {doctor.hospital}
            </li>
            <li>
              <a href={`tel:${doctor.phone}`} className="flex items-center gap-2 hover:text-foreground">
                <Phone className="size-4" />
                {doctor.phone}
              </a>
            </li>
            <li className="min-w-0">
              <a href={`mailto:${doctor.email}`} className="flex items-center gap-2 truncate hover:text-foreground">
                <Mail className="size-4 shrink-0" />
                {doctor.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Wallet className="size-4" />
              {f.money(doctor.consultationFee)} {d.common.perVisit}
            </li>
          </ul>
          {doctor.bio && <p className="mt-3 max-w-prose text-sm">{doctor.bio}</p>}
          <p className="sr-only">{tr(d.doctorsAdmin.onRosterSince, { date: f.date(doctor.createdAt) })}</p>
        </div>
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  )
}

/** Caseload at a glance: total plus a status-proportional band. */
export function CaseloadStrip({ doctor }: { doctor: DoctorDetail }) {
  const { d, f, tr } = useI18n()
  const t = d.doctorsAdmin
  const counts = Object.fromEntries(doctor.patientsByStatus.map((s) => [s.status, s.count])) as Partial<Record<PatientStatus, number>>
  const topConditions = doctor.patientsByCondition.slice(0, 3)

  return (
    <div className="grid gap-5 border-t p-5 sm:p-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-8">
      <div>
        <p className="text-sm text-muted-foreground">{t.caseload}</p>
        <p className="font-heading text-3xl font-semibold tabular">{f.number(doctor.patientCount)}</p>
      </div>

      <StatusBand counts={counts} className="min-w-0" />

      <div className="text-sm">
        <p className="text-muted-foreground">{t.mostCommon}</p>
        <p className="mt-0.5 font-medium">
          {topConditions.length ? topConditions.map((c) => d.enums.condition[c.condition]).join(", ") : t.noPatientsYet}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{tr(t.onRosterSince, { date: f.date(doctor.createdAt) })}</p>
      </div>
    </div>
  )
}

export function DoctorDetailSkeleton() {
  return (
    <div aria-busy="true">
      <Skeleton className="mb-4 h-7 w-28" />
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="size-14 rounded-2xl" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
        </div>
        <Skeleton className="mt-8 h-3 w-full rounded-full" />
      </div>
    </div>
  )
}
