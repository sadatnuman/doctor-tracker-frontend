"use client"

import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { fieldA11y, FormField } from "@/components/common/form-field"
import { PasswordInput } from "@/components/common/password-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRegister } from "@/hooks/use-auth"
import { useI18n } from "@/i18n/client"
import { ApiError, localizeError } from "@/lib/api"
import { applyServerErrors } from "@/lib/form-errors"
import { GENDERS } from "@/lib/types"
import { registerSchema, type RegisterFormInput, type RegisterValues } from "@/lib/validators"
import { zodResolver } from "@/lib/zod-resolver"
import { destinationFor } from "../login/login-form"

export function RegisterForm() {
  const { d, href } = useI18n()
  const router = useRouter()
  const next = useSearchParams().get("next")
  const registerUser = useRegister()
  const resolver = useMemo(() => zodResolver(registerSchema(d.validation)), [d])
  const t = d.auth

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormInput, unknown, RegisterValues>({
    resolver,
    defaultValues: { name: "", email: "", password: "", phone: "", age: "", gender: "" as RegisterFormInput["gender"] },
  })

  const onSubmit = handleSubmit((values) =>
    registerUser.mutate(values, {
      onSuccess: ({ data }) => {
        router.replace(destinationFor(data.user.role, next, href))
        router.refresh()
      },
      onError: (error) => applyServerErrors(error, setError, ["name", "email", "password", "phone", "age", "gender"]),
    })
  )

  const serverError =
    registerUser.error && !(registerUser.error instanceof ApiError && registerUser.error.fieldErrors.length)
      ? localizeError(registerUser.error, d.errors)
      : null

  return (
    <>
      <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-4 sm:grid-cols-2">
        {serverError && (
          <div role="alert" className="rounded-lg border border-destructive/25 bg-destructive/8 px-3.5 py-2.5 text-sm text-destructive sm:col-span-2">
            {serverError}
          </div>
        )}

        <FormField id="reg-name" label={t.fullName} error={errors.name?.message} className="sm:col-span-2">
          <Input {...fieldA11y("reg-name", errors.name?.message)} autoComplete="name" placeholder={t.namePlaceholder} {...register("name")} />
        </FormField>

        <FormField id="reg-email" label={t.email} error={errors.email?.message} className="sm:col-span-2">
          <Input {...fieldA11y("reg-email", errors.email?.message)} type="email" autoComplete="email" placeholder={t.emailPlaceholder} {...register("email")} />
        </FormField>

        <FormField id="reg-phone" label={t.phone} error={errors.phone?.message} className="sm:col-span-2">
          <Input {...fieldA11y("reg-phone", errors.phone?.message)} type="tel" inputMode="tel" autoComplete="tel" placeholder={t.phonePlaceholder} {...register("phone")} />
        </FormField>

        <FormField id="reg-age" label={t.age} error={errors.age?.message}>
          <Input {...fieldA11y("reg-age", errors.age?.message)} type="number" inputMode="numeric" min={0} max={130} {...register("age")} />
        </FormField>

        <FormField id="reg-gender" label={t.gender} error={errors.gender?.message}>
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
                <SelectTrigger {...fieldA11y("reg-gender", errors.gender?.message)} className="w-full">
                  <SelectValue placeholder={d.patientsAdmin.choose} />
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

        <FormField id="reg-password" label={t.password} hint={errors.password ? undefined : t.passwordHint} error={errors.password?.message} className="sm:col-span-2">
          <PasswordInput {...fieldA11y("reg-password", errors.password?.message)} autoComplete="new-password" {...register("password")} />
        </FormField>

        <Button type="submit" size="lg" className="mt-1 h-10 sm:col-span-2" disabled={registerUser.isPending}>
          {registerUser.isPending && <Loader2 className="animate-spin" />}
          {registerUser.isPending ? t.creating : d.common.signUp}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t.haveAccount}{" "}
        <Link prefetch={false} href={`${href("/login")}${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-primary underline-offset-4 hover:underline">
          {d.common.signIn}
        </Link>
      </p>
    </>
  )
}
