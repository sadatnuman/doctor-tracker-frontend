"use client"

import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { fieldA11y, FormField } from "@/components/common/form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLogin } from "@/hooks/use-auth"
import { loginSchema, type LoginValues } from "@/lib/validators"
import { zodResolver } from "@/lib/zod-resolver"

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD

/** Only allow same-site relative redirects (prevents open-redirects via ?next=). */
const safeNext = (next: string | null) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/")

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const login = useLogin()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } })

  const onSubmit = handleSubmit((values) =>
    login.mutate(values, {
      onSuccess: () => router.replace(safeNext(searchParams.get("next"))),
    })
  )

  const serverError =
    login.error?.message ?? (searchParams.get("expired") ? "Your session ended. Sign in again to continue." : null)

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-5">
      {serverError && (
        <div role="alert" className="rounded-lg border border-destructive/25 bg-destructive/8 px-3.5 py-2.5 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <FormField id="email" label="Email" error={errors.email?.message}>
        <Input
          {...fieldA11y("email", errors.email?.message)}
          type="email"
          autoComplete="username"
          autoFocus
          placeholder="you@hospital.org"
          className="h-10"
          {...register("email")}
        />
      </FormField>

      <FormField id="password" label="Password" error={errors.password?.message}>
        <div className="relative">
          <Input
            {...fieldA11y("password", errors.password?.message)}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="h-10 pr-10"
            {...register("password")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 text-muted-foreground"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
        </div>
      </FormField>

      <Button type="submit" size="lg" className="mt-1 h-10" disabled={login.isPending}>
        {login.isPending && <Loader2 className="animate-spin" />}
        {login.isPending ? "Signing in…" : "Sign in"}
      </Button>

      {DEMO_EMAIL && DEMO_PASSWORD && (
        <div className="rounded-lg border border-dashed bg-muted/50 px-3.5 py-3 text-sm">
          <p className="font-medium">Reviewing this project?</p>
          <p className="mt-0.5 text-muted-foreground">
            Demo account: <span className="text-foreground">{DEMO_EMAIL}</span>
          </p>
          <Button
            type="button"
            variant="link"
            className="mt-1 h-auto p-0"
            onClick={() => {
              setValue("email", DEMO_EMAIL, { shouldValidate: true })
              setValue("password", DEMO_PASSWORD, { shouldValidate: true })
            }}
          >
            Fill in demo credentials
          </Button>
        </div>
      )}
    </form>
  )
}
