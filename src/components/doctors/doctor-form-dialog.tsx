"use client"

import { Loader2 } from "lucide-react"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { fieldA11y, FormField } from "@/components/common/form-field"
import { PasswordInput } from "@/components/common/password-input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCreateDoctor, useFilterOptions, useUpdateDoctor } from "@/hooks/use-doctors"
import { useI18n } from "@/i18n/client"
import { localizeError } from "@/lib/api"
import { applyServerErrors } from "@/lib/form-errors"
import type { Doctor, DoctorDetail } from "@/lib/types"
import { doctorSchema, type DoctorFormInput, type DoctorValues } from "@/lib/validators"
import { zodResolver } from "@/lib/zod-resolver"

const FIELDS = ["name", "specialization", "hospital", "phone", "email", "consultationFee", "bio", "password"] as const
const EMPTY: DoctorFormInput = { name: "", specialization: "", hospital: "", phone: "", email: "", consultationFee: 1000, bio: "", password: "" }

interface DoctorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When set the dialog edits this doctor; otherwise it creates one. */
  doctor?: Pick<Doctor, "id" | "name" | "specialization" | "hospital" | "phone" | "email" | "consultationFee"> &
    Partial<Pick<DoctorDetail, "bio">>
  onSaved?: (doctor: Doctor) => void
}

export function DoctorFormDialog({ open, onOpenChange, doctor, onSaved }: DoctorFormDialogProps) {
  const { d, tr } = useI18n()
  const t = d.doctorsAdmin
  const isEdit = Boolean(doctor)
  const { data: options } = useFilterOptions()
  const create = useCreateDoctor()
  const update = useUpdateDoctor(doctor?.id ?? "")
  const mutation = isEdit ? update : create
  const resolver = useMemo(() => zodResolver(doctorSchema(d.validation)), [d])

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<DoctorFormInput, unknown, DoctorValues>({ resolver, defaultValues: EMPTY })

  useEffect(() => {
    if (open) {
      reset(
        doctor
          ? {
              name: doctor.name,
              specialization: doctor.specialization,
              hospital: doctor.hospital,
              phone: doctor.phone,
              email: doctor.email,
              consultationFee: doctor.consultationFee,
              bio: doctor.bio ?? "",
              password: "",
            }
          : EMPTY
      )
      create.reset()
      update.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the dialog opens
  }, [open, doctor?.id])

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: (saved) => {
        toast.success(isEdit ? t.savedEdit : tr(t.savedNew, { name: saved.name }))
        onOpenChange(false)
        onSaved?.(saved)
      },
      onError: (error) => {
        if (!applyServerErrors(error, setError, FIELDS)) toast.error(localizeError(error, d.errors))
      },
    })
  )

  const e = errors
  const specialty = (s: string) => d.enums.specialization[s] ?? s

  return (
    <Dialog open={open} onOpenChange={(next) => !mutation.isPending && onOpenChange(next)}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? t.formEditTitle : t.formAddTitle}</DialogTitle>
          <DialogDescription>{isEdit ? t.formEditBody : t.formAddBody}</DialogDescription>
        </DialogHeader>

        <form id="doctor-form" onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
          <FormField id="doctor-name" label={t.fullName} error={e.name?.message} className="sm:col-span-2">
            <Input {...fieldA11y("doctor-name", e.name?.message)} placeholder={t.namePlaceholder} autoComplete="off" {...register("name")} />
          </FormField>

          <FormField id="doctor-specialization" label={t.specialization} error={e.specialization?.message}>
            <Input
              {...fieldA11y("doctor-specialization", e.specialization?.message)}
              list="specialization-options"
              placeholder="Cardiology"
              autoComplete="off"
              {...register("specialization")}
            />
            <datalist id="specialization-options">
              {options?.specializations.map((s) => (
                <option key={s} value={s} label={specialty(s)} />
              ))}
            </datalist>
          </FormField>

          <FormField id="doctor-hospital" label={t.hospital} error={e.hospital?.message}>
            <Input
              {...fieldA11y("doctor-hospital", e.hospital?.message)}
              list="hospital-options"
              placeholder={t.hospitalPlaceholder}
              autoComplete="off"
              {...register("hospital")}
            />
            <datalist id="hospital-options">
              {options?.hospitals.map((h) => <option key={h} value={h} />)}
            </datalist>
          </FormField>

          <FormField id="doctor-phone" label={t.phone} error={e.phone?.message}>
            <Input
              {...fieldA11y("doctor-phone", e.phone?.message)}
              type="tel"
              inputMode="tel"
              placeholder="+880 1712-345678"
              {...register("phone")}
            />
          </FormField>

          <FormField id="doctor-email" label={t.email} error={e.email?.message}>
            <Input {...fieldA11y("doctor-email", e.email?.message)} type="email" placeholder={t.emailPlaceholder} {...register("email")} />
          </FormField>

          <FormField id="doctor-fee" label={t.fee} error={e.consultationFee?.message}>
            <Input {...fieldA11y("doctor-fee", e.consultationFee?.message)} type="number" inputMode="numeric" min={0} step={50} {...register("consultationFee")} />
          </FormField>

          {!isEdit && (
            <FormField
              id="doctor-password"
              label={d.admin.initialPassword}
              optional
              hint={e.password?.message ? undefined : d.admin.initialPasswordHint}
              error={e.password?.message}
            >
              <PasswordInput {...fieldA11y("doctor-password", e.password?.message)} autoComplete="new-password" {...register("password")} />
            </FormField>
          )}

          <FormField id="doctor-bio" label={t.bio} optional error={e.bio?.message} className="sm:col-span-2">
            <Textarea {...fieldA11y("doctor-bio", e.bio?.message)} rows={3} placeholder={t.bioPlaceholder} {...register("bio")} />
          </FormField>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            {d.common.cancel}
          </Button>
          <Button type="submit" form="doctor-form" disabled={mutation.isPending || (isEdit && !isDirty)}>
            {mutation.isPending && <Loader2 className="animate-spin" />}
            {isEdit ? d.common.save : d.admin.addDoctor}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
