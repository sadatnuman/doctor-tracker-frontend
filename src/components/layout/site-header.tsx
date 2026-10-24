"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { LanguageSwitcher } from "@/components/common/language-switcher"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useI18n } from "@/i18n/client"
import { ServerWakeNotice } from "./server-wake-notice"

/** Top bar of the admin and doctor workspaces. */
export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme()
  const { d } = useI18n()

  return (
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex h-14 items-center gap-2 px-4 md:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-5" />
        <ServerWakeNotice />
        <div className="ml-auto flex items-center gap-1">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label={d.common.toggleTheme}
          >
            <Sun className="hidden dark:block" />
            <Moon className="dark:hidden" />
          </Button>
        </div>
      </div>
    </header>
  )
}
