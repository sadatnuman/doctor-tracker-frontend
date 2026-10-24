"use client"

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { I18nProvider } from "@/i18n/client"
import type { Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n/dictionaries/en"
import { ApiError, localizeError } from "@/lib/api"

interface ProvidersProps {
  locale: Locale
  dictionary: Dictionary
  children: React.ReactNode
}

/** Messages for the global error toast; kept in sync with the active language. */
const activeErrors: { current: Dictionary["errors"] | null } = { current: null }

export function Providers({ locale, dictionary, children }: ProvidersProps) {
  useEffect(() => {
    activeErrors.current = dictionary.errors
  }, [dictionary])

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            // Don't retry client errors (validation, 404, auth); retry transient ones twice.
            retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 2,
          },
        },
        mutationCache: new MutationCache({
          // Global fallback; forms that show inline field errors set `meta.silent`.
          onError: (error, _vars, _ctx, mutation) => {
            if (mutation.meta?.silent) return
            toast.error(activeErrors.current ? localizeError(error, activeErrors.current) : error.message)
          },
        }),
      })
  )

  return (
    <I18nProvider locale={locale} dictionary={dictionary}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <NuqsAdapter>
            <TooltipProvider delayDuration={300}>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </TooltipProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </QueryClientProvider>
    </I18nProvider>
  )
}
