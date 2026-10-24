"use client"

import { ChevronsUpDown, Globe, LogOut, Moon, Sun, UserCog } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { UserAvatar } from "@/components/common/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useLogout, useSession } from "@/hooks/use-auth"
import { useI18n } from "@/i18n/client"

export function UserMenu({ profileHref }: { profileHref: string }) {
  const { data: user, isPending } = useSession()
  const { d, href } = useI18n()
  const logout = useLogout(href("/login"))
  const { isMobile } = useSidebar()
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme === "dark"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="h-12 data-[state=open]:bg-sidebar-accent">
              <UserAvatar name={user?.name ?? ""} src={user?.avatarUrl} tone="sidebar" className="size-8 rounded-lg" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                {isPending ? (
                  <>
                    <Skeleton className="h-3.5 w-20 bg-sidebar-accent" />
                    <Skeleton className="mt-1 h-3 w-28 bg-sidebar-accent" />
                  </>
                ) : (
                  <>
                    <span className="truncate font-medium text-white">{user?.name}</span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </>
                )}
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isMobile ? "top" : "right"} align="end" sideOffset={8} className="min-w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user && d.roles[user.role]}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={profileHref}>
                <UserCog />
                {d.nav.profile}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={href("/")}>
                <Globe />
                {d.nav.home}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTheme(dark ? "light" : "dark")}>
              {dark ? <Sun /> : <Moon />}
              {dark ? d.common.lightTheme : d.common.darkTheme}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" disabled={logout.isPending} onSelect={() => logout.mutate()}>
              <LogOut />
              {d.common.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
