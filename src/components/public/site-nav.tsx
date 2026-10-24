"use client"

import { LayoutDashboard, LogOut, Menu, Moon, Sun, UserCog } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useState } from "react"
import { BrandMark, BrandName } from "@/components/brand-mark"
import { LanguageSwitcher } from "@/components/common/language-switcher"
import { UserAvatar } from "@/components/common/user-avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { useLogout, useSession } from "@/hooks/use-auth"
import { useI18n } from "@/i18n/client"
import { ROLE_HOME } from "@/lib/types"

/** Public header: browse links for everyone, session-aware account controls. */
export function SiteNav() {
  const { d, href } = useI18n()
  const [open, setOpen] = useState(false)
  const links = [
    { href: href("/doctors"), label: d.nav.findDoctors },
    { href: `${href("/")}#specialties`, label: d.nav.specialties },
    { href: `${href("/")}#how-it-works`, label: d.nav.howItWorks },
    { href: `${href("/")}#for-doctors`, label: d.nav.forDoctors },
  ]

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href={href("/")} className="flex items-center gap-2.5">
          <BrandMark />
          <BrandName />
        </Link>

        <nav aria-label={d.nav.mainNav} className="ml-6 hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <ThemeButton />
          <AccountControls />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label={d.nav.mainNav}>
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>{d.common.appName}</SheetTitle>
              </SheetHeader>
              <nav aria-label={d.nav.mainNav} className="grid gap-1 px-4">
                {links.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 font-medium hover:bg-muted">
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="px-4">
                <LanguageSwitcher />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme()
  const { d } = useI18n()
  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label={d.common.toggleTheme}>
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  )
}

function AccountControls() {
  const { d, href } = useI18n()
  const { data: user, isPending } = useSession()
  const logout = useLogout(href("/"))

  if (isPending) return <Skeleton className="h-8 w-20 rounded-md" />
  if (!user) {
    return (
      <div className="flex items-center gap-1">
        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
          <Link href={href("/login")}>{d.common.signIn}</Link>
        </Button>
        <Button asChild size="sm">
          <Link href={href("/register")}>{d.common.signUp}</Link>
        </Button>
      </div>
    )
  }

  const home = href(ROLE_HOME[user.role])
  const profile = href(user.role === "patient" ? "/account/profile" : `/${user.role}/profile`)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-1.5" aria-label={d.nav.account}>
          <UserAvatar name={user.name} src={user.avatarUrl} tone="teal" className="size-8" />
          <span className="hidden max-w-32 truncate text-sm font-medium md:inline">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{d.roles[user.role]}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={home}>
            <LayoutDashboard />
            {user.role === "patient" ? d.nav.myAppointments : d.nav.goToWorkspace}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={profile}>
            <UserCog />
            {d.nav.profile}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={logout.isPending} onSelect={() => logout.mutate()}>
          <LogOut />
          {d.common.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
