"use client"

import { ArrowLeft, Building2, Mail, Pencil, Phone, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { ErrorState } from "@/components/common/states"
import { StatusBand } from "@/components/common/status-band"
import { PatientList } from "@/components/patients/patient-list"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDoctor } from "@/hooks/use-doctors"
import { ApiError } from "@/lib/api"
import { formatDate, formatNumber, initials } from "@/lib/format"
import type { DoctorDetail, PatientStatus } from "@/lib/types"
import { DeleteDoctorDialog } from "./delete-doctor-dialog"
import { DoctorFormDialog } from "./doctor-form-dialog"

export function DoctorDetailView() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
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
            <p className="font-heading text-lg font-semibold">This doctor isn’t on the roster</p>
            <p className="mt-1 text-sm text-muted-foreground">They may have been deleted, or the link is incomplete.</p>
            <Button asChild variant="outline" className="mt-5">
              <Link href="/doctors">Back to doctors</Link>
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
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4 text-muted-foreground">
        <Link href="/doctors">
          <ArrowLeft />
          All doctors
        </Link>
      </Button>

      <section className="rounded-xl border bg-card">
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent font-heading text-lg font-semibold text-accent-foreground">
              {initials(doctor.name)}
            </span>
            <div className="min-w-0">
              <h1 className="text-[1.6rem] leading-tight font-semibold sm:text-[1.85rem]">{doctor.name}</h1>
              <p className="mt-1 font-medium text-primary">{doctor.specialization}</p>
              <ul className="mt-3 grid gap-1.5 text-sm text-muted-foreground sm:flex sm:flex-wrap sm:gap-x-5">
                <li className="flex items-center gap-2"><Building2 className="size-4" />{doctor.hospital}</li>
                <li><a href={`tel:${doctor.phone}`} className="flex items-center gap-2 hover:text-foreground"><Phone className="size-4" />{doctor.phone}</a></li>
                <li className="min-w-0"><a href={`mailto:${doctor.email}`} className="flex items-center gap-2 truncate hover:text-foreground"><Mail className="size-4 shrink-0" />{doctor.email}</a></li>
              </ul>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}><Pencil />Edit</Button>
            <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}><Trash2 />Delete</Button>
          </div>
        </div>
        <CaseloadStrip doctor={doctor} />
      </section>

      <div className="mt-8">
        <PatientList
          doctor={doctor}
          header={(openCreate) => (
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Patients</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">Everyone in {doctor.name}’s care.</p>
              </div>
              <Button onClick={openCreate}><Plus />Add patient</Button>
            </div>
          )}
        />
      </div>

      <DoctorFormDialog open={editOpen} onOpenChange={setEditOpen} doctor={doctor} />
      <DeleteDoctorDialog doctor={deleteOpen ? doctor : null} onClose={() => setDeleteOpen(false)} onDeleted={() => router.replace("/doctors")} />
    </>
  )
}

/** Caseload at a glance: total plus a status-proportional band. */
function CaseloadStrip({ doctor }: { doctor: DoctorDetail }) {
  const counts = Object.fromEntries(doctor.patientsByStatus.map((s) => [s.status, s.count])) as Partial<
    Record<PatientStatus, number>
  >
  const total = doctor.patientCount
  const topConditions = doctor.patientsByCondition.slice(0, 3)

  return (
    <div className="grid gap-5 border-t p-5 sm:p-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-8">
      <div>
        <p className="text-sm text-muted-foreground">Caseload</p>
        <p className="font-heading text-3xl font-semibold tabular">{formatNumber(total)}</p>
      </div>

      <StatusBand counts={counts} className="min-w-0" />

      <div className="text-sm">
        <p className="text-muted-foreground">Most common</p>
        <p className="mt-0.5 font-medium">{topConditions.length ? topConditions.map((c) => c.condition).join(", ") : "No patients yet"}</p>
        <p className="mt-1 text-xs text-muted-foreground">On the roster since {formatDate(doctor.createdAt)}</p>
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
