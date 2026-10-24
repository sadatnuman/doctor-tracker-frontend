import { Suspense } from "react"
import { DoctorOverview } from "@/components/doctor-area/doctor-overview"
import { privatePageMetadata } from "@/i18n/server"

export const generateMetadata = privatePageMetadata((d) => d.nav.overview)

export default function DoctorHomePage() {
  return (
    <Suspense>
      <DoctorOverview />
    </Suspense>
  )
}
