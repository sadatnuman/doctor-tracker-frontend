import { Suspense } from "react"
import { TableSkeleton } from "@/components/data/table-skeleton"
import { DoctorsView } from "@/components/doctors/doctors-view"
import { privatePageMetadata } from "@/i18n/server"

export const generateMetadata = privatePageMetadata((d) => d.admin.doctorsTitle)

export default function DoctorsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <DoctorsView />
    </Suspense>
  )
}
