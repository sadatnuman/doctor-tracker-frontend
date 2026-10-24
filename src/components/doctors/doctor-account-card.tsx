"use client"

import { KeyRound, Loader2 } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { fieldA11y, FormField } from "@/components/common/form-field"
import { PasswordInput } from "@/components/common/password-input"
import { Button } from "@/components/ui/button"
import { useSetDoctorAccount } from "@/hooks/use-doctors"
import { useI18n } from "@/i18n/client"
import { localizeError } from "@/lib/api"
import type { DoctorDetail } from "@/lib/types"
import { doctorAccountSchema } from "@/lib/validators"
import { zodResolver } from "@/lib/zod-resolver"

/** Admin-only: create a doctor's login or reset its password (ends their other sessions). */
export function DoctorAccountCard({ doctor }: { doctor: DoctorDetail }) {
  const { d, tr, f } = useI18n()
  const [editing, setEditing] = useState(false)
  const setAccount = useSetDoctorAccount(doctor.id)
  const resolver = useMemo(() => zodResolver(doctorAccountSchema(d.validation)), [d])
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ password: string }>({ resolver, defaultValues: { password: "" } })

  const onSubmit = handleSubmit(({ password }) =>
    setAccount.mutate(password, {
      onSuccess: () => {
        toast.success(d.admin.accountSaved)
        reset()
        setEditing(false)
      },
      onError: (error) => toast.error(localizeError(error, d.errors)),
    })
  )

  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
          <KeyRound className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold">{d.admin.accountTitle}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {doctor.account
              ? tr(d.admin.accountSet, {
                  email: doctor.account.email,
                  last: doctor.account.lastLoginAt ? f.dateTime(doctor.account.lastLoginAt) : d.admin.never,
                })
              : d.admin.accountNone}
          </p>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            {doctor.hasAccount ? d.admin.resetPassword : d.admin.createLogin}
          </Button>
        )}
      </div>

      {editing && (
        <form onSubmit={onSubmit} noValidate className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <FormField id="doctor-new-password" label={d.admin.newPasswordLabel} hint={errors.password ? undefined : d.auth.passwordHint} error={errors.password?.message}>
            <PasswordInput {...fieldA11y("doctor-new-password", errors.password?.message)} autoComplete="new-password" autoFocus {...register("password")} />
          </FormField>
          <div className="flex gap-2 sm:pb-[1.35rem]">
            <Button type="button" variant="outline" onClick={() => setEditing(false)} disabled={setAccount.isPending}>
              {d.common.cancel}
            </Button>
            <Button type="submit" disabled={setAccount.isPending}>
              {setAccount.isPending && <Loader2 className="animate-spin" />}
              {d.common.save}
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}
