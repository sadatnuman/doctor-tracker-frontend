"use client"

import { Plus } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { TableSkeleton } from "@/components/data/table-skeleton"
import { PatientList } from "@/components/patients/patient-list"
import { Button } from "@/components/ui/button"
import { useMyDoctor } from "@/hooks/use-doctors"
import { useI18n } from "@/i18n/client"

/** The doctor's own caseload: the same list as admins see, scoped to them, no reassigning. */
export function MyPatients() {
  const { d } = useI18n()
  const { data: doctor } = useMyDoctor()
  if (!doctor) return <TableSkeleton />
  return (
    <PatientList
      doctor={doctor}
      canReassign={false}
      header={(openCreate) => (
        <PageHeader
          title={d.nav.myPatients}
          description={d.doctorArea.patientsBody}
          actions={
            <Button onClick={openCreate}>
              <Plus />
              {d.admin.addPatient}
            </Button>
          }
        />
      )}
    />
  )
}
