"use client"

import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useDeleteDoctor } from "@/hooks/use-doctors"
import { useI18n } from "@/i18n/client"
import type { Doctor } from "@/lib/types"

interface DeleteDoctorDialogProps {
  doctor: Pick<Doctor, "id" | "name" | "patientCount"> | null
  onClose: () => void
  onDeleted?: () => void
}

export function DeleteDoctorDialog({ doctor, onClose, onDeleted }: DeleteDoctorDialogProps) {
  const { d, tr, f } = useI18n()
  const remove = useDeleteDoctor()
  const count = doctor?.patientCount ?? 0
  const t = d.doctorsAdmin

  return (
    <ConfirmDialog
      open={Boolean(doctor)}
      onOpenChange={(open) => !open && !remove.isPending && onClose()}
      title={tr(t.deleteTitle, { name: doctor?.name ?? "" })}
      description={<p>{count > 0 ? tr(t.deleteWithPatients, { count: f.number(count) }) : t.deleteNoPatients}</p>}
      confirmLabel={count > 0 ? t.deleteConfirmAll : t.deleteConfirm}
      pending={remove.isPending}
      onConfirm={() =>
        doctor &&
        // Always cascade: the dialog has already told the admin what goes with the doctor.
        remove.mutate(
          { id: doctor.id, cascade: true },
          {
            onSuccess: () => {
              toast.success(tr(t.deleted, { name: doctor.name }))
              onClose()
              onDeleted?.()
            },
          }
        )
      }
    />
  )
}
