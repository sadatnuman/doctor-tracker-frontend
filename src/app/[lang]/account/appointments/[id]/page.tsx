import { Suspense } from "react"
import { AppointmentDetail } from "@/components/appointments/appointment-detail"
import { Skeleton } from "@/components/ui/skeleton"
import { privatePageMetadata } from "@/i18n/server"

export const generateMetadata = privatePageMetadata((d) => d.booking.payTitle)

export default function AppointmentPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
      <AppointmentDetail />
    </Suspense>
  )
}
