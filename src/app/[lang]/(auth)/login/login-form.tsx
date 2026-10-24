"use client"

import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { fieldA11y, FormField } from "@/components/common/form-field"
import { PasswordInput } from "@/components/common/password-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLogin } from "@/hooks/use-auth"
import { useI18n } from "@/i18n/client"
import { localizeError } from "@/lib/api"
import { ROLE_HOME, ROLES, type Role } from "@/lib/types"
import { loginSchema, type LoginValues } from "@/lib/validators"
import { zodResolver } from "@/lib/zod-resolver"

/** "email:password" pairs for admin, doctor, patient (in that order), for reviewers. */
const DEMO_LOGINS = (process.env.NEXT_PUBLIC_DEMO_LOGINS ?? "")
  .split(",")
  .map((pair, i) => {
    const [email, password] = pair.split(":")
    return email && password ? { role: ROLES[i] as Role, email, password } : null
  })
  .filter((x): x is { role: Role; email: string; password: string } => x !== null)

/** Only same-site relative paths are accepted as a post-login destination (no open redirects). */
export const safeNext = (next: string | null) => (next && next.startsWith("/") && !next.startsWith("//") ? next : null)

const AREA_ROLE: Record<string, Role> = { admin: "admin", doctor: "doctor", account: "patient" }

/** Where to go after signing in: `next` if this role may open it, otherwise the role's home. */
export function destinationFor(role: Role, next: string | null, href: (p: string) => string) {
  const target = safeNext(next)
  const area = target?.split("/")[2] ?? ""
  return target && (!AREA_ROLE[area] || AREA_ROLE[area] === role) ? target : href(ROLE_HOME[role])
}

export function LoginForm() {
  const { d, tr, href } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useLogin()
  const resolver = useMemo(() => zodResolver(loginSchema(d.validation)), [d])
  const next = searchParams.get("next")

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({ resolver, defaultValues: { email: "", password: "" } })

  const onSubmit = handleSubmit((values) =>
    login.mutate(values, {
      onSuccess: ({ data }) => {
        router.replace(destinationFor(data.user.role, next, href))
        router.refresh()
      },
    })
  )

  const serverError = login.error ? localizeError(login.error, d.errors) : searchParams.get("expired") ? d.auth.sessionEnded : null

  return (
    <>
      <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-5">
        {serverError && (
          <div role="alert" className="rounded-lg border border-destructive/25 bg-destructive/8 px-3.5 py-2.5 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <FormField id="email" label={d.auth.email} error={errors.email?.message}>
          <Input
            {...fieldA11y("email", errors.email?.message)}
            type="email"
            autoComplete="username"
            autoFocus
            placeholder={d.auth.emailPlaceholder}
            className="h-10"
            {...register("email")}
          />
        </FormField>

        <FormField id="password" label={d.auth.password} error={errors.password?.message}>
          <PasswordInput {...fieldA11y("password", errors.password?.message)} autoComplete="current-password" className="h-10" {...register("password")} />
        </FormField>

        <Button type="submit" size="lg" className="mt-1 h-10" disabled={login.isPending}>
          {login.isPending && <Loader2 className="animate-spin" />}
          {login.isPending ? d.auth.signingIn : d.common.signIn}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {d.auth.noAccount}{" "}
        <Link href={`${href("/register")}${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-primary underline-offset-4 hover:underline">
          {d.auth.createAccount}
        </Link>
      </p>

      {DEMO_LOGINS.length > 0 && (
        <div className="mt-8 rounded-lg border border-dashed bg-muted/50 px-4 py-3.5 text-sm">
          <p className="font-medium">{d.auth.demoTitle}</p>
          <p className="mt-0.5 text-muted-foreground">{d.auth.demoBody}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DEMO_LOGINS.map((demo) => (
              <Button
                key={demo.role}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setValue("email", demo.email, { shouldValidate: true })
                  setValue("password", demo.password, { shouldValidate: true })
                }}
              >
                {tr(d.auth.demoFill, { role: d.roles[demo.role] })}
              </Button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
