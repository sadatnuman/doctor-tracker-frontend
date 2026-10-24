"use client"

import { Plus } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/client"
import { PatientList } from "./patient-list"

export function PatientsView() {
  const { d } = useI18n()
  return (
    <PatientList
      header={(openCreate) => (
        <PageHeader
          title={d.admin.patientsTitle}
          description={d.admin.patientsBody}
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
