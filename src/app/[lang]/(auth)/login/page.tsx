import type { Metadata } from "next"
import { Suspense } from "react"
import { getDictionary, resolveLocale } from "@/i18n/server"
import { alternatesFor } from "@/lib/site"
import { LoginForm } from "./login-form"

export async function generateMetadata({ params }: PageProps<"/[lang]/login">): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const d = await getDictionary(locale)
  // Reachable and linked from the site, but not worth indexing.
  return { title: d.meta.loginTitle, alternates: alternatesFor(locale, "/login"), robots: { index: false, follow: true } }
}

export default async function LoginPage({ params }: PageProps<"/[lang]/login">) {
  const d = await getDictionary(await resolveLocale(params))
  return (
    <>
      <h1 className="text-2xl font-semibold">{d.auth.loginTitle}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{d.auth.loginBody}</p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  )
}
