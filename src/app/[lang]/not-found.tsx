"use client"

import Link from "next/link"
import { BrandMark } from "@/components/brand-mark"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/client"

export default function NotFound() {
  const { d, href } = useI18n()
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-sm text-center">
        <BrandMark className="mx-auto size-10" />
        <h1 className="mt-6 text-2xl font-semibold">{d.common.notFoundTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{d.common.notFoundBody}</p>
        <Button asChild className="mt-6">
          <Link href={href("/")}>{d.common.goHome}</Link>
        </Button>
      </div>
    </main>
  )
}
