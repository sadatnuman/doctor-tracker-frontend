import { Suspense } from "react"
import { AppointmentsPage } from "@/components/appointments/appointments-page"
import { TableSkeleton } from "@/components/data/table-skeleton"
import { privatePageMetadata } from "@/i18n/server"

export const generateMetadata = privatePageMetadata((d) => d.nav.myAppointments)

export default function MyAppointmentsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <AppointmentsPage mode="patient" />
    </Suspense>
  )
}
