"use client"

import { Loader2 } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { fieldA11y, FormField } from "@/components/common/form-field"
import { STATUS_COLOR } from "@/components/common/status-badge"
import { DoctorPicker } from "@/components/doctors/doctor-picker"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useCreatePatient, useUpdatePatient } from "@/hooks/use-patients"
import { useI18n } from "@/i18n/client"
import { localizeError } from "@/lib/api"
import { todayInputValue } from "@/lib/format"
import { applyServerErrors } from "@/lib/form-errors"
import { CONDITIONS, GENDERS, STATUSES, type DoctorSummary, type Patient } from "@/lib/types"
import { patientSchema, type PatientFormInput, type PatientValues } from "@/lib/validators"
import { zodResolver } from "@/lib/zod-resolver"

const FIELDS = ["name", "age", "gender", "phone", "email", "condition", "status", "admissionDate", "notes", "doctor"] as const

interface PatientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Edit mode when set. */
  patient?: Patient
  /** Creating under a specific doctor: the doctor is fixed and the picker hidden. */
  doctor?: Pick<DoctorSummary, "id" | "name">
  /** Only administrators may move a patient to another doctor. */
  canReassign?: boolean
}

function toFormValues(patient?: Patient, doctorId?: string): PatientFormInput {
  return {
    name: patient?.name ?? "",
    age: patient?.age ?? "",
    gender: patient?.gender ?? ("" as PatientFormInput["gender"]),
    phone: patient?.phone ?? "",
    email: patient?.email ?? "",
    condition: patient?.condition ?? ("" as PatientFormInput["condition"]),
    status: patient?.status ?? "Active",
    admissionDate: patient ? patient.admissionDate.slice(0, 10) : todayInputValue(),
    notes: patient?.notes ?? "",
    doctor: patient?.doctor?.id ?? doctorId ?? "",
  }
}

export function PatientFormDialog({ open, onOpenChange, patient, doctor, canReassign = true }: PatientFormDialogProps) {
  const { d, tr } = useI18n()
  const t = d.patientsAdmin
  const isEdit = Boolean(patient)
  const create = useCreatePatient()
  const update = useUpdatePatient()
  const mutation = isEdit ? update : create
  const resolver = useMemo(() => zodResolver(patientSchema(d.validation)), [d])

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<PatientFormInput, unknown, PatientValues>({ resolver, defaultValues: toFormValues(patient, doctor?.id) })

  useEffect(() => {
    if (open) {
      reset(toFormValues(patient, doctor?.id))
      create.reset()
      update.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the dialog opens
  }, [open, patient?.id, doctor?.id])

  const onSubmit = handleSubmit((values) => {
    const handlers = {
      onSuccess: () => {
        toast.success(isEdit ? t.updated : doctor ? tr(t.addedTo, { name: values.name, doctor: doctor.name }) : tr(t.added, { name: values.name }))
        onOpenChange(false)
      },
      onError: (error: Error) => {
        if (!applyServerErrors(error, setError, FIELDS)) toast.error(localizeError(error, d.errors))
      },
    }
    if (patient) {
      // PATCH only what changed.
      const changed = Object.fromEntries(
        Object.entries(values).filter(([key]) => dirtyFields[key as keyof PatientFormInput])
      ) as Partial<PatientValues>
      update.mutate({ id: patient.id, values: changed }, handlers)
    } else {
      create.mutate(values, handlers)
    }
  })

  const e = errors
  const showPicker = !doctor && (!isEdit || canReassign)

  return (
    <Dialog open={open} onOpenChange={(next) => !mutation.isPending && onOpenChange(next)}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? t.formEditTitle : doctor ? tr(t.formAddFor, { name: doctor.name }) : t.formAddTitle}</DialogTitle>
          <DialogDescription>{isEdit ? t.formEditBody : t.formAddBody}</DialogDescription>
        </DialogHeader>

        <form id="patient-form" onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-6">
          <FormField id="patient-name" label={t.fullName} error={e.name?.message} className="sm:col-span-4">
            <Input {...fieldA11y("patient-name", e.name?.message)} placeholder={t.namePlaceholder} autoComplete="off" {...register("name")} />
          </FormField>

          <FormField id="patient-age" label={t.age} error={e.age?.message} className="sm:col-span-2">
            <Input {...fieldA11y("patient-age", e.age?.message)} type="number" inputMode="numeric" min={0} max={130} {...register("age")} />
          </FormField>

          <FormField id="patient-gender" label={t.gender} error={e.gender?.message} className="sm:col-span-2">
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger {...fieldA11y("patient-gender", e.gender?.message)} className="w-full">
                    <SelectValue placeholder={t.choose} />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {d.enums.gender[g]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField id="patient-phone" label={t.phone} error={e.phone?.message} className="sm:col-span-2">
            <Input {...fieldA11y("patient-phone", e.phone?.message)} type="tel" inputMode="tel" placeholder="+880 1811-223344" {...register("phone")} />
          </FormField>

          <FormField id="patient-email" label={t.email} optional error={e.email?.message} className="sm:col-span-2">
            <Input {...fieldA11y("patient-email", e.email?.message)} type="email" placeholder="name@example.com" {...register("email")} />
          </FormField>

          <FormField id="patient-condition" label={t.condition_} error={e.condition?.message} className="sm:col-span-3">
            <Controller
              control={control}
              name="condition"
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger {...fieldA11y("patient-condition", e.condition?.message)} className="w-full">
                    <SelectValue placeholder={t.chooseCondition} />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {d.enums.condition[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField id="patient-admission" label={t.admission} error={e.admissionDate?.message} className="sm:col-span-3">
            <Input {...fieldA11y("patient-admission", e.admissionDate?.message)} type="date" max={todayInputValue()} {...register("admissionDate")} />
          </FormField>

          <FormField id="patient-status" label={t.status_} error={e.status?.message} className="sm:col-span-6">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <ToggleGroup
                  id="patient-status"
                  type="single"
                  variant="outline"
                  value={field.value}
                  onValueChange={(v) => v && field.onChange(v)}
                  className="w-full flex-wrap justify-start sm:flex-nowrap"
                >
                  {STATUSES.map((s) => (
                    <ToggleGroupItem key={s} value={s} className="flex-1 gap-2 data-[state=on]:bg-accent data-[state=on]:font-semibold">
                      <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: STATUS_COLOR[s] }} />
                      {d.enums.status[s]}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              )}
            />
          </FormField>

          {showPicker && (
            <FormField id="patient-doctor" label={t.doctor} error={e.doctor?.message} className="sm:col-span-6">
              <Controller
                control={control}
                name="doctor"
                render={({ field }) => (
                  <DoctorPicker
                    id="patient-doctor"
                    value={field.value || null}
                    selectedName={field.value === patient?.doctor?.id ? patient?.doctor?.name : undefined}
                    onChange={(id) => field.onChange(id ?? "")}
                    invalid={Boolean(e.doctor)}
                  />
                )}
              />
            </FormField>
          )}

          <FormField id="patient-notes" label={t.notes} optional error={e.notes?.message} className="sm:col-span-6">
            <Textarea {...fieldA11y("patient-notes", e.notes?.message)} rows={3} placeholder={t.notesPlaceholder} {...register("notes")} />
          </FormField>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            {d.common.cancel}
          </Button>
          <Button type="submit" form="patient-form" disabled={mutation.isPending || (isEdit && !isDirty)}>
            {mutation.isPending && <Loader2 className="animate-spin" />}
            {isEdit ? d.common.save : d.admin.addPatient}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
