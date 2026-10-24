import { Suspense } from "react"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { privatePageMetadata } from "@/i18n/server"

export const generateMetadata = privatePageMetadata((d) => d.admin.dashboardTitle)

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardView />
    </Suspense>
  )
}
