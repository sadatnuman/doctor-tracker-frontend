"use client"

import { Loader2, LogOut, ShieldCheck } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { fieldA11y, FormField } from "@/components/common/form-field"
import { PageHeader } from "@/components/common/page-header"
import { PasswordInput } from "@/components/common/password-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useChangePassword, useLogoutEverywhere, useSession, useUpdateProfile } from "@/hooks/use-auth"
import { useI18n } from "@/i18n/client"
import { localizeError } from "@/lib/api"
import { applyServerErrors } from "@/lib/form-errors"
import { GENDERS, type User } from "@/lib/types"
import { changePasswordSchema, profileSchema, type ChangePasswordValues, type ProfileFormInput, type ProfileValues } from "@/lib/validators"
import { zodResolver } from "@/lib/zod-resolver"
import { AvatarUploader } from "./avatar-uploader"

/** Profile & security for every role: picture, details, password, sessions. */
export function ProfileView() {
  const { d, f } = useI18n()
  const t = d.profile
  const { data: user, isPending } = useSession()

  if (isPending || !user) {
    return (
      <div className="grid gap-5" aria-busy>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t.title} description={t.subtitle} />
      <div className="grid gap-5">
        <Card>
          <AvatarUploader name={user.name} src={user.avatarUrl} />
          <dl className="mt-6 grid gap-4 border-t pt-5 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">{t.email}</dt>
              <dd className="mt-0.5 font-medium break-all">{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t.role}</dt>
              <dd className="mt-0.5 font-medium">{d.roles[user.role]}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t.joined}</dt>
              <dd className="mt-0.5 font-medium">{f.date(user.createdAt)}</dd>
            </div>
          </dl>
        </Card>

        {user.role === "patient" && <DetailsForm user={user} />}
        <PasswordForm />
        <Sessions />
      </div>
    </div>
  )
}

function Card({ title, description, children }: { title?: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-5 sm:p-6">
      {title && <h2 className="text-base font-semibold">{title}</h2>}
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      <div className={title ? "mt-5" : undefined}>{children}</div>
    </section>
  )
}

function DetailsForm({ user }: { user: User }) {
  const { d } = useI18n()
  const t = d.auth
  const update = useUpdateProfile()
  const resolver = useMemo(() => zodResolver(profileSchema(d.validation)), [d])
  const defaults: ProfileFormInput = { name: user.name, phone: user.phone ?? "", age: user.age ?? "", gender: user.gender ?? "Male" }
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileFormInput, unknown, ProfileValues>({ resolver, defaultValues: defaults })

  useEffect(() => {
    reset({ name: user.name, phone: user.phone ?? "", age: user.age ?? "", gender: user.gender ?? "Male" })
  }, [user, reset])

  const onSubmit = handleSubmit((values) =>
    update.mutate(values, {
      onSuccess: () => toast.success(d.profile.saved),
      onError: (error) => {
        if (!applyServerErrors(error, setError, ["name", "phone", "age", "gender"])) toast.error(localizeError(error, d.errors))
      },
    })
  )

  return (
    <Card title={d.profile.details}>
      <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <FormField id="profile-name" label={t.fullName} error={errors.name?.message} className="sm:col-span-2">
          <Input {...fieldA11y("profile-name", errors.name?.message)} autoComplete="name" {...register("name")} />
        </FormField>
        <FormField id="profile-phone" label={t.phone} error={errors.phone?.message} className="sm:col-span-2">
          <Input {...fieldA11y("profile-phone", errors.phone?.message)} type="tel" autoComplete="tel" {...register("phone")} />
        </FormField>
        <FormField id="profile-age" label={t.age} error={errors.age?.message}>
          <Input {...fieldA11y("profile-age", errors.age?.message)} type="number" inputMode="numeric" {...register("age")} />
        </FormField>
        <FormField id="profile-gender" label={t.gender} error={errors.gender?.message}>
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="profile-gender" className="w-full">
                  <SelectValue />
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
        <div className="sm:col-span-2">
          <Button type="submit" disabled={!isDirty || update.isPending}>
            {update.isPending && <Loader2 className="animate-spin" />}
            {d.common.save}
          </Button>
        </div>
      </form>
    </Card>
  )
}

function PasswordForm() {
  const { d } = useI18n()
  const t = d.profile
  const change = useChangePassword()
  const resolver = useMemo(() => zodResolver(changePasswordSchema(d.validation)), [d])
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordValues>({ resolver, defaultValues: { currentPassword: "", newPassword: "" } })

  const onSubmit = handleSubmit((values) =>
    change.mutate(values, {
      onSuccess: () => {
        toast.success(t.passwordChanged)
        reset()
      },
      onError: (error) => {
        if (!applyServerErrors(error, setError, ["currentPassword", "newPassword"])) toast.error(localizeError(error, d.errors))
      },
    })
  )

  return (
    <Card title={t.passwordTitle} description={t.passwordBody}>
      <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <FormField id="current-password" label={t.currentPassword} error={errors.currentPassword?.message}>
          <PasswordInput {...fieldA11y("current-password", errors.currentPassword?.message)} autoComplete="current-password" {...register("currentPassword")} />
        </FormField>
        <FormField id="new-password" label={t.newPassword} hint={errors.newPassword ? undefined : d.auth.passwordHint} error={errors.newPassword?.message}>
          <PasswordInput {...fieldA11y("new-password", errors.newPassword?.message)} autoComplete="new-password" {...register("newPassword")} />
        </FormField>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={change.isPending}>
            {change.isPending ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
            {t.passwordTitle}
          </Button>
        </div>
      </form>
    </Card>
  )
}

function Sessions() {
  const { d, href } = useI18n()
  const logoutAll = useLogoutEverywhere(href("/login"))
  return (
    <Card title={d.profile.sessionsTitle} description={d.profile.sessionsBody}>
      <Button variant="outline" className="text-destructive hover:text-destructive" disabled={logoutAll.isPending} onClick={() => logoutAll.mutate()}>
        {logoutAll.isPending ? <Loader2 className="animate-spin" /> : <LogOut />}
        {d.profile.signOutEverywhere}
      </Button>
    </Card>
  )
}
