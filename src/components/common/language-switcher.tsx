"use client"

import { Languages } from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/client"
import { LOCALE_COOKIE, LOCALE_LABEL, switchLocalePath, type Locale } from "@/i18n/config"
import { cn } from "@/lib/utils"

function Switcher({ className, compact }: { className?: string; compact?: boolean }) {
  const { locale, d } = useI18n()
  const pathname = usePathname()
  const search = useSearchParams().toString()
  const target: Locale = locale === "en" ? "bn" : "en"

  return (
    <Button
      asChild
      variant="ghost"
      size={compact ? "icon" : "sm"}
      className={cn("font-medium", className)}
      title={d.common.language}
    >
      {/* A real link (not a button) so crawlers and middle-click work too. */}
      <a
        href={`${switchLocalePath(pathname, target)}${search ? `?${search}` : ""}`}
        hrefLang={target === "bn" ? "bn-BD" : "en"}
        lang={target === "bn" ? "bn-BD" : "en"}
        onClick={() => {
          document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`
        }}
        aria-label={`${d.common.language}: ${LOCALE_LABEL[target]}`}
      >
        <Languages />
        {!compact && LOCALE_LABEL[target]}
      </a>
    </Button>
  )
}

/** Links to the same page in the other language (pathname is request data → Suspense). */
export function LanguageSwitcher(props: { className?: string; compact?: boolean }) {
  return (
    <Suspense fallback={<span className="inline-block h-8 w-16" />}>
      <Switcher {...props} />
    </Suspense>
  )
}
