import { Suspense } from "react"
import { TableSkeleton } from "@/components/data/table-skeleton"
import { PatientsView } from "@/components/patients/patients-view"
import { privatePageMetadata } from "@/i18n/server"

export const generateMetadata = privatePageMetadata((d) => d.admin.patientsTitle)

export default function PatientsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <PatientsView />
    </Suspense>
  )
}
