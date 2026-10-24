import { Suspense } from "react"
import { DoctorDetailSkeleton, DoctorDetailView } from "@/components/doctors/doctor-detail-view"
import { privatePageMetadata } from "@/i18n/server"

export const generateMetadata = privatePageMetadata((d) => d.nav.doctors)

export default function DoctorPage() {
  return (
    <Suspense fallback={<DoctorDetailSkeleton />}>
      <DoctorDetailView />
    </Suspense>
  )
}
