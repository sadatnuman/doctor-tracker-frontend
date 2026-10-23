"use client"

import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useDeleteDoctor } from "@/hooks/use-doctors"
import { formatNumber } from "@/lib/format"
import type { Doctor } from "@/lib/types"

interface DeleteDoctorDialogProps {
  doctor: Pick<Doctor, "id" | "name" | "patientCount"> | null
  onClose: () => void
  onDeleted?: () => void
}

export function DeleteDoctorDialog({ doctor, onClose, onDeleted }: DeleteDoctorDialogProps) {
  const remove = useDeleteDoctor()
  const count = doctor?.patientCount ?? 0

  return (
    <ConfirmDialog
      open={Boolean(doctor)}
      onOpenChange={(open) => !open && !remove.isPending && onClose()}
      title={`Delete ${doctor?.name ?? "doctor"}?`}
      description={
        count > 0 ? (
          <p>
            This also deletes their <strong className="text-foreground">{formatNumber(count)} patient {count === 1 ? "record" : "records"}</strong>.
            This can’t be undone.
          </p>
        ) : (
          <p>This doctor has no patients. This can’t be undone.</p>
        )
      }
      confirmLabel={count > 0 ? "Delete doctor and patients" : "Delete doctor"}
      pending={remove.isPending}
      onConfirm={() =>
        doctor &&
        remove.mutate(
          { id: doctor.id, cascade: count > 0 },
          {
            onSuccess: () => {
              toast.success(`${doctor.name} deleted`)
              onClose()
              onDeleted?.()
            },
          }
        )
      }
    />
  )
}
