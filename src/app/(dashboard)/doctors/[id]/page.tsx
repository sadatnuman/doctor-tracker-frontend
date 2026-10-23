import type { Metadata } from "next"
import { Suspense } from "react"
import { DoctorDetailSkeleton, DoctorDetailView } from "@/components/doctors/doctor-detail-view"

export const metadata: Metadata = { title: "Doctor" }

export default function DoctorPage() {
  return (
    <Suspense fallback={<DoctorDetailSkeleton />}>
      <DoctorDetailView />
    </Suspense>
  )
}
