"use client"

import { Loader2 } from "lucide-react"
import { useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { fieldA11y, FormField } from "@/components/common/form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useUpdateAvailability } from "@/hooks/use-doctors"
import { useI18n } from "@/i18n/client"
import { SLOT_LENGTHS, type Availability } from "@/lib/types"
import { availabilitySchema, type AvailabilityFormInput, type AvailabilityValues } from "@/lib/validators"
import { zodResolver } from "@/lib/zod-resolver"

const toMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3))
/** Bangladesh week: Saturday first, Friday (weekend) last. */
const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5]

interface ScheduleFormProps {
  availability: Availability
  /** Admin editing someone else's schedule; omit for "my schedule". */
  doctorId?: string
}

export function ScheduleForm({ availability, doctorId }: ScheduleFormProps) {
  const { d, tr, f } = useI18n()
  const t = d.doctorArea
  const save = useUpdateAvailability(doctorId)
  const resolver = useMemo(() => zodResolver(availabilitySchema(d.validation)), [d])
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AvailabilityFormInput, unknown, AvailabilityValues>({ resolver, defaultValues: availability })

  const [start, end, slot] = useWatch({ control, name: ["start", "end", "slotMinutes"] })
  const slotsPerDay = useMemo(() => {
    const span = toMinutes(end ?? "00:00") - toMinutes(start ?? "00:00")
    return span > 0 && slot ? Math.floor(span / Number(slot)) : 0
  }, [start, end, slot])

  const onSubmit = handleSubmit((values) =>
    save.mutate(values, {
      onSuccess: () => {
        toast.success(t.scheduleSaved)
        reset(values)
      },
    })
  )

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <FormField id="schedule-days" label={t.days} error={errors.days?.message}>
        <Controller
          control={control}
          name="days"
          render={({ field }) => (
            <ToggleGroup
              id="schedule-days"
              type="multiple"
              variant="outline"
              value={field.value.map(String)}
              onValueChange={(v) => field.onChange(v.map(Number))}
              className="flex-wrap justify-start"
            >
              {WEEK_ORDER.map((day) => (
                <ToggleGroupItem
                  key={day}
                  value={String(day)}
                  aria-label={d.enums.weekdays[day]}
                  className="min-w-14 data-[state=on]:bg-accent data-[state=on]:font-semibold data-[state=on]:text-accent-foreground"
                >
                  {d.enums.weekdaysShort[day]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id="schedule-start" label={t.startTime} error={errors.start?.message}>
          <Input {...fieldA11y("schedule-start", errors.start?.message)} type="time" step={300} {...register("start")} />
        </FormField>
        <FormField id="schedule-end" label={t.endTime} error={errors.end?.message}>
          <Input {...fieldA11y("schedule-end", errors.end?.message)} type="time" step={300} {...register("end")} />
        </FormField>
        <FormField id="schedule-slot" label={t.slotLength}>
          <Controller
            control={control}
            name="slotMinutes"
            render={({ field }) => (
              <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                <SelectTrigger id="schedule-slot" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SLOT_LENGTHS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {tr(d.common.minutes, { n: f.number(n) })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed bg-muted/40 px-4 py-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {tr(t.preview, { count: f.number(slotsPerDay) })}
        </p>
        <Button type="submit" disabled={!isDirty || save.isPending}>
          {save.isPending && <Loader2 className="animate-spin" />}
          {d.common.save}
        </Button>
      </div>
    </form>
  )
}
