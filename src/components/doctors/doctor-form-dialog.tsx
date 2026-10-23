"use client"

import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { fieldA11y, FormField } from "@/components/common/form-field"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useCreateDoctor, useFilterOptions, useUpdateDoctor } from "@/hooks/use-doctors"
import { applyServerErrors } from "@/lib/form-errors"
import type { Doctor } from "@/lib/types"
import { doctorSchema, type DoctorValues } from "@/lib/validators"
import { zodResolver } from "@/lib/zod-resolver"

const FIELDS = ["name", "specialization", "hospital", "phone", "email"] as const
const EMPTY: DoctorValues = { name: "", specialization: "", hospital: "", phone: "", email: "" }

interface DoctorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When set the dialog edits this doctor; otherwise it creates one. */
  doctor?: Pick<Doctor, "id" | (typeof FIELDS)[number]>
  onSaved?: (doctor: Doctor) => void
}

export function DoctorFormDialog({ open, onOpenChange, doctor, onSaved }: DoctorFormDialogProps) {
  const isEdit = Boolean(doctor)
  const { data: options } = useFilterOptions()
  const create = useCreateDoctor()
  const update = useUpdateDoctor(doctor?.id ?? "")
  const mutation = isEdit ? update : create

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<DoctorValues>({ resolver: zodResolver(doctorSchema), defaultValues: EMPTY })

  useEffect(() => {
    if (open) {
      reset(doctor ? { name: doctor.name, specialization: doctor.specialization, hospital: doctor.hospital, phone: doctor.phone, email: doctor.email } : EMPTY)
      create.reset()
      update.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the dialog opens
  }, [open, doctor?.id])

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: (saved) => {
        toast.success(isEdit ? "Doctor updated" : `${saved.name} added`)
        onOpenChange(false)
        onSaved?.(saved)
      },
      onError: (error) => {
        if (!applyServerErrors(error, setError, FIELDS)) toast.error(error.message)
      },
    })
  )

  const e = errors

  return (
    <Dialog open={open} onOpenChange={(next) => !mutation.isPending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit doctor" : "Add doctor"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Changes appear everywhere this doctor is listed." : "The doctor can take patients as soon as they’re added."}
          </DialogDescription>
        </DialogHeader>

        <form id="doctor-form" onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
          <FormField id="doctor-name" label="Full name" error={e.name?.message} className="sm:col-span-2">
            <Input {...fieldA11y("doctor-name", e.name?.message)} placeholder="Dr. Amara Okafor" autoComplete="off" {...register("name")} />
          </FormField>

          <FormField id="doctor-specialization" label="Specialization" error={e.specialization?.message}>
            <Input
              {...fieldA11y("doctor-specialization", e.specialization?.message)}
              list="specialization-options"
              placeholder="Cardiology"
              autoComplete="off"
              {...register("specialization")}
            />
            <datalist id="specialization-options">
              {options?.specializations.map((s) => <option key={s} value={s} />)}
            </datalist>
          </FormField>

          <FormField id="doctor-hospital" label="Hospital" error={e.hospital?.message}>
            <Input
              {...fieldA11y("doctor-hospital", e.hospital?.message)}
              list="hospital-options"
              placeholder="Riverside General Hospital"
              autoComplete="off"
              {...register("hospital")}
            />
            <datalist id="hospital-options">
              {options?.hospitals.map((h) => <option key={h} value={h} />)}
            </datalist>
          </FormField>

          <FormField id="doctor-phone" label="Phone" error={e.phone?.message}>
            <Input {...fieldA11y("doctor-phone", e.phone?.message)} type="tel" inputMode="tel" placeholder="+1 555 010 2000" {...register("phone")} />
          </FormField>

          <FormField id="doctor-email" label="Email" error={e.email?.message}>
            <Input {...fieldA11y("doctor-email", e.email?.message)} type="email" placeholder="name@hospital.org" {...register("email")} />
          </FormField>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="doctor-form" disabled={mutation.isPending || (isEdit && !isDirty)}>
            {mutation.isPending && <Loader2 className="animate-spin" />}
            {isEdit ? "Save changes" : "Add doctor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
