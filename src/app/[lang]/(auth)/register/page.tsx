import type { Metadata } from "next"
import { Suspense } from "react"
import { getDictionary, resolveLocale } from "@/i18n/server"
import { alternatesFor } from "@/lib/site"
import { RegisterForm } from "./register-form"

export async function generateMetadata({ params }: PageProps<"/[lang]/register">): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const d = await getDictionary(locale)
  return { title: d.meta.registerTitle, alternates: alternatesFor(locale, "/register"), robots: { index: false, follow: true } }
}

export default async function RegisterPage({ params }: PageProps<"/[lang]/register">) {
  const d = await getDictionary(await resolveLocale(params))
  return (
    <>
      <h1 className="text-2xl font-semibold">{d.auth.registerTitle}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{d.auth.registerBody}</p>
      <Suspense>
        <RegisterForm />
      </Suspense>
    </>
  )
}
