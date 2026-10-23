"use client"

import { Plus } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { PatientList } from "./patient-list"

export function PatientsView() {
  return (
    <PatientList
      header={(openCreate) => (
        <PageHeader
          title="Patients"
          description="Every patient across all doctors. Filter by condition, status or admission date to find a caseload."
          actions={
            <Button onClick={openCreate}>
              <Plus />
              Add patient
            </Button>
          }
        />
      )}
    />
  )
}
