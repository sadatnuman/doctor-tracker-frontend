"use client"

import { Plus } from "lucide-react"
import Link from "next/link"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/client"
import { AppointmentList, type AppointmentMode } from "./appointment-list"

/** Heading + list for each role's appointments page. */
export function AppointmentsPage({ mode }: { mode: AppointmentMode }) {
  const { d, href } = useI18n()
  const copy =
    mode === "patient"
      ? { title: d.nav.myAppointments, body: d.appointment.emptyPatientBody }
      : mode === "doctor"
        ? { title: d.nav.appointments, body: d.doctorArea.appointmentsBody }
        : { title: d.admin.appointmentsTitle, body: d.admin.appointmentsBody }
  return (
    <>
      <PageHeader
        title={copy.title}
        description={copy.body}
        actions={
          mode === "patient" && (
            <Button asChild>
              <Link href={href("/doctors")}>
                <Plus />
                {d.nav.findDoctors}
              </Link>
            </Button>
          )
        }
      />
      <AppointmentList mode={mode} />
    </>
  )
}
