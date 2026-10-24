import { Suspense } from "react"
import { AppointmentsPage } from "@/components/appointments/appointments-page"
import { TableSkeleton } from "@/components/data/table-skeleton"
import { privatePageMetadata } from "@/i18n/server"

export const generateMetadata = privatePageMetadata((d) => d.admin.appointmentsTitle)

export default function AdminAppointmentsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <AppointmentsPage mode="admin" />
    </Suspense>
  )
}
