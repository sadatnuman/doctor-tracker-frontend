import { Suspense } from "react"
import { MyPatients } from "@/components/doctor-area/my-patients"
import { TableSkeleton } from "@/components/data/table-skeleton"
import { privatePageMetadata } from "@/i18n/server"

export const generateMetadata = privatePageMetadata((d) => d.nav.myPatients)

export default function MyPatientsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <MyPatients />
    </Suspense>
  )
}
