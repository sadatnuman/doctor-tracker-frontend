import { MySchedule } from "@/components/doctor-area/my-schedule"
import { privatePageMetadata } from "@/i18n/server"

export const generateMetadata = privatePageMetadata((d) => d.nav.schedule)

export default function SchedulePage() {
  return <MySchedule />
}
